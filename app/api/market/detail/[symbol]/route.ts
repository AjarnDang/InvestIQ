import { NextRequest, NextResponse } from "next/server";
import { SYMBOL_TO_META } from "@/src/data/sectorMap";
import { resolveAliasToYahoo } from "@/src/data/indexAliases";
import type { NewsItem, StockDetail } from "@/src/types";

export const revalidate = 60;

// Re-export so existing imports from this route still compile
export type { StockDetail };

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
  Origin: "https://finance.yahoo.com",
};

/**
 * Resolve the correct Yahoo Finance ticker for the given app symbol.
 *
 * Resolution order:
 *   1. Index alias (e.g. SPX → ^GSPC, SET50 → ^SET50.BK)
 *   2. SET stock in SYMBOL_TO_META (e.g. CPALL → CPALL.BK)
 *   3. Assume US stock — use symbol as-is (e.g. NVDA)
 */
function resolveYahooSymbol(sym: string) {
  const upper = sym.toUpperCase();

  // 1. Index alias mapping (URL-safe aliases for market indices)
  const indexYahoo = resolveAliasToYahoo(upper);
  if (indexYahoo) {
    return { yahooSymbol: indexYahoo, stockMeta: null };
  }

  // 2. Thai SET stock
  const meta = SYMBOL_TO_META[upper] ?? null;
  if (meta) {
    return { yahooSymbol: meta.yahooSymbol, stockMeta: meta };
  }

  // 3. US or other exchange — use as-is
  return { yahooSymbol: upper, stockMeta: null };
}

/**
 * PRIMARY source — v8/finance/chart.
 * Reliable, no auth required. Returns price + market data from chart metadata.
 */
async function fetchFromChart(yahooSymbol: string): Promise<Partial<StockDetail> | null> {
  const encoded = encodeURIComponent(yahooSymbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=2d&lang=en`;

  const res = await fetch(url, {
    headers: YAHOO_HEADERS,
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Yahoo Finance chart HTTP ${res.status}`);

  const data = await res.json();
  const m = data?.chart?.result?.[0]?.meta;
  if (!m?.regularMarketPrice) return null;

  const prevClose = m.previousClose ?? m.chartPreviousClose ?? m.regularMarketPrice;

  return {
    name:          m.longName ?? m.shortName ?? yahooSymbol,
    price:         m.regularMarketPrice,
    change:        m.regularMarketChange    ?? (m.regularMarketPrice - prevClose),
    changePercent: m.regularMarketChangePercent ?? 0,
    open:          m.regularMarketOpen,
    prevClose,
    dayHigh:       m.regularMarketDayHigh,
    dayLow:        m.regularMarketDayLow,
    volume:        m.regularMarketVolume,
    high52:        m.fiftyTwoWeekHigh,
    low52:         m.fiftyTwoWeekLow,
    marketCap:     m.marketCap,
    pe:            m.trailingPE,
    exchange:      m.exchangeName,
    currency:      m.currency,
    quoteType:     m.instrumentType ?? m.quoteType,
  };
}

/**
 * OPTIONAL enrichment — v10/finance/quoteSummary.
 * Provides sector, industry, company description, beta, etc.
 * May fail with 401/403 — silently returns null in that case.
 */
async function fetchFromQuoteSummary(
  yahooSymbol: string,
): Promise<Partial<StockDetail> | null> {
  try {
    const modules = "summaryProfile,summaryDetail,defaultKeyStatistics,assetProfile";
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(yahooSymbol)}?modules=${modules}`;
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const result = data?.quoteSummary?.result?.[0];
    if (!result) return null;

    const sd = result.summaryDetail ?? {};
    const sp = result.summaryProfile ?? result.assetProfile ?? {};
    const ks = result.defaultKeyStatistics ?? {};

    return {
      avgVolume:     sd.averageVolume?.raw,
      pe:            sd.trailingPE?.raw,
      eps:           ks.trailingEps?.raw,
      dividendYield: sd.dividendYield?.raw,
      beta:          sd.beta?.raw,
      sector:        sp.sector,
      industry:      sp.industry,
      description:   sp.longBusinessSummary,
      website:       sp.website,
      country:       sp.country,
      employees:     sp.fullTimeEmployees,
    };
  } catch {
    return null;
  }
}

/**
 * OPTIONAL enrichment — v7/finance/quote (single symbol).
 * Used for: pre/post-market fields + sometimes more reliable marketCap.
 * May fail with 401/403 — silently returns null in that case.
 */
async function fetchFromQuoteV7(
  yahooSymbol: string,
): Promise<Partial<StockDetail> | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
      yahooSymbol,
    )}&lang=en&region=US`;
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const r = data?.quoteResponse?.result?.[0];
    if (!r) return null;

    return {
      marketState: r.marketState,
      marketCap: typeof r.marketCap === "number" ? r.marketCap : undefined,
      preMarketPrice:
        typeof r.preMarketPrice === "number" ? r.preMarketPrice : undefined,
      preMarketChange:
        typeof r.preMarketChange === "number" ? r.preMarketChange : undefined,
      preMarketChangePercent:
        typeof r.preMarketChangePercent === "number"
          ? r.preMarketChangePercent
          : undefined,
      postMarketPrice:
        typeof r.postMarketPrice === "number" ? r.postMarketPrice : undefined,
      postMarketChange:
        typeof r.postMarketChange === "number" ? r.postMarketChange : undefined,
      postMarketChangePercent:
        typeof r.postMarketChangePercent === "number"
          ? r.postMarketChangePercent
          : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * OPTIONAL enrichment — Yahoo search news (no API key).
 * Endpoint: v1/finance/search
 */
async function fetchNewsFromYahooSearch(
  query: string,
  limit = 8,
): Promise<NewsItem[]> {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    query,
  )}&quotesCount=0&newsCount=${encodeURIComponent(String(limit))}&listsCount=0&enableFuzzyQuery=false&lang=en&region=US`;

  try {
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];

    const data = await res.json();
    type YahooSearchNewsItem = {
      uuid?: string;
      id?: string;
      title?: string;
      link?: string;
      url?: string;
      canonicalUrl?: { url?: string };
      clickThroughUrl?: { url?: string };
      providerPublishTime?: number;
      published_at?: string;
      publisher?: string;
      provider?: string;
      summary?: string;
      description?: string;
      thumbnail?: { resolutions?: Array<{ url?: string }>; url?: string };
      image?: { url?: string };
    };
    const news: YahooSearchNewsItem[] = data?.news ?? [];

    return news
      .map((n) => {
        const url =
          n?.link ??
          n?.canonicalUrl?.url ??
          n?.clickThroughUrl?.url ??
          n?.url;
        if (!url) return null;

        const publishedAt =
          typeof n?.providerPublishTime === "number"
            ? new Date(n.providerPublishTime * 1000).toISOString()
            : typeof n?.published_at === "string"
              ? n.published_at
              : new Date().toISOString();

        const title = String(n?.title ?? "").trim();
        if (!title) return null;

        const imageUrl =
          n?.thumbnail?.resolutions?.[0]?.url ??
          n?.thumbnail?.url ??
          n?.image?.url;

        const id =
          String(n?.uuid ?? n?.id ?? url ?? `${title}:${publishedAt}`) ?? title;

        return {
          id,
          title,
          description: String(n?.summary ?? n?.description ?? "").trim(),
          url: String(url),
          source: String(n?.publisher ?? n?.provider ?? "Yahoo Finance"),
          publishedAt,
          imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
        } satisfies NewsItem;
      })
      .filter(Boolean)
      .slice(0, limit) as NewsItem[];
  } catch {
    return [];
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const sym = symbol?.toUpperCase();
  if (!sym) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  const { yahooSymbol, stockMeta } = resolveYahooSymbol(sym);

  try {
    // ── Step 1: reliable chart data (v8) ───────────────────────────────
    const chartData = await fetchFromChart(yahooSymbol);
    if (!chartData?.price) {
      return NextResponse.json({ error: "Could not fetch data" }, { status: 404 });
    }

    // ── Step 2: optional profile enrichment (v10, may fail silently) ───
    const profileData = await fetchFromQuoteSummary(yahooSymbol);

    // ── Step 3: extended hours + market cap (v7, may fail silently) ────
    const v7Data = await fetchFromQuoteV7(yahooSymbol);

    // ── Step 4: related news (v1 search, may fail silently) ────────────
    // Prefer clean app symbol for query (AAPL) but also works with .BK / indices.
    const news = await fetchNewsFromYahooSearch(sym, 10);

    // ── Step 5: supplement with local metadata for SET stocks ──────────
    //   Clean symbol (without .BK), sector from sectorMap, etc.
    const localOverride: Partial<StockDetail> = {
      symbol: sym,                               // always use clean app symbol
      ...(stockMeta?.name       && { name:   stockMeta.name   }),
      ...(stockMeta?.sector     && { sector: profileData?.sector ?? stockMeta.sector }),
    };

    const detail: StockDetail = {
      // defaults
      symbol: sym,
      name:   sym,
      price:  0,
      change: 0,
      changePercent: 0,
      // merge in order: chart (reliable) → profile (optional) → v7 (optional) → local (override)
      ...chartData,
      ...profileData,
      ...v7Data,
      ...localOverride,
    };

    return NextResponse.json({ detail, news });
  } catch (err) {
    console.error(`[api/market/detail] error for ${sym} (${yahooSymbol}):`, err);
    return NextResponse.json({ error: "Could not fetch data" }, { status: 500 });
  }
}
