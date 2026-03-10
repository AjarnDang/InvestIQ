import { NextRequest, NextResponse } from "next/server";
import { SYMBOL_TO_META } from "@/src/data/sectorMap";

export const revalidate = 60;

export interface StockDetail {
  symbol:        string;
  name:          string;
  price:         number;
  change:        number;
  changePercent: number;
  open?:         number;
  prevClose?:    number;
  dayHigh?:      number;
  dayLow?:       number;
  marketCap?:    number;
  volume?:       number;
  avgVolume?:    number;
  pe?:           number;
  eps?:          number;
  dividendYield?: number;
  high52?:       number;
  low52?:        number;
  beta?:         number;
  sector?:       string;
  industry?:     string;
  description?:  string;
  website?:      string;
  country?:      string;
  exchange?:     string;
  currency?:     string;
  quoteType?:    string;
  employees?:    number;
}

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
  Origin: "https://finance.yahoo.com",
};

/**
 * Resolve the correct Yahoo Finance ticker.
 * Thai SET stocks are stored in SYMBOL_TO_META with .BK suffix.
 * US / other stocks are used as-is.
 */
function resolveYahooSymbol(sym: string) {
  const meta = SYMBOL_TO_META[sym.toUpperCase()] ?? null;
  return { yahooSymbol: meta?.yahooSymbol ?? sym, stockMeta: meta };
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

    // ── Step 3: supplement with local metadata for SET stocks ──────────
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
      // merge in order: chart (reliable) → profile (optional) → local (override)
      ...chartData,
      ...profileData,
      ...localOverride,
    };

    return NextResponse.json({ detail });
  } catch (err) {
    console.error(`[api/market/detail] error for ${sym} (${yahooSymbol}):`, err);
    return NextResponse.json({ error: "Could not fetch data" }, { status: 500 });
  }
}
