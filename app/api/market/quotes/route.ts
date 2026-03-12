import { NextRequest, NextResponse } from "next/server";
import { MOCK_STOCKS } from "@/src/data/stocks";
import { MOCK_INDICES } from "@/src/data/indices";
import {
  ALL_YAHOO_INDEX_SYMBOLS,
  SYMBOL_TO_META,
} from "@/src/data/sectorMap";
import type { Stock, MarketIndex } from "@/src/types";
import { transformQuotesToIndices } from "@/src/functions/yahooTransform";

// ─── Shared Yahoo headers ────────────────────────────────────────────────────
// Identical to /api/market/trending — keeps bot-detection profiles consistent.
const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
  Origin: "https://finance.yahoo.com",
};

// ─── Per-symbol chart endpoint (same as /api/market/trending) ────────────────
// Yahoo v8 chart is far more reliable than v7 bulk-quote for US tickers.
async function fetchYahooChartQuote(yahooSymbol: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
} | null> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}` +
    `?interval=1d&range=2d&lang=en&region=US`;
  try {
    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;

    const raw = await res.json();
    const meta = raw?.chart?.result?.[0]?.meta;
    if (!meta?.regularMarketPrice) return null;

    const price     = meta.regularMarketPrice as number;
    const prevClose = (meta.previousClose ?? meta.chartPreviousClose ?? price) as number;
    const change    = (meta.regularMarketChange ?? price - prevClose) as number;
    const changePct =
      (meta.regularMarketChangePercent ??
        (prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0)) as number;

    return {
      price:         Math.round(price * 100) / 100,
      change:        Math.round(change * 100) / 100,
      changePercent: Math.round(changePct * 100) / 100,
      volume:        (meta.regularMarketVolume as number) ?? 0,
      marketCap:     (meta.marketCap as number) ?? 0,
      high52w:       (meta.fiftyTwoWeekHigh as number) ?? 0,
      low52w:        (meta.fiftyTwoWeekLow as number) ?? 0,
    };
  } catch {
    return null;
  }
}

// ─── Bulk v7 (still used for indices & Thai stocks as fallback) ───────────────
const YAHOO_V7_FIELDS = [
  "regularMarketPrice",
  "regularMarketChange",
  "regularMarketChangePercent",
  "regularMarketVolume",
  "marketCap",
  "fiftyTwoWeekHigh",
  "fiftyTwoWeekLow",
  "trailingPE",
  "trailingAnnualDividendYield",
  "shortName",
  "longName",
].join(",");

async function fetchYahooV7Bulk(symbols: string) {
  const url =
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}` +
    `&fields=${YAHOO_V7_FIELDS}&lang=en&region=US`;
  const res = await fetch(url, {
    headers: { ...YAHOO_HEADERS, Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Yahoo Finance v7 responded ${res.status}`);
  return res.json();
}

// ─── Universe selection ───────────────────────────────────────────────────────
function pickUniverse(asset: string | null): Stock[] {
  const a = (asset ?? "th").toLowerCase();
  if (a === "us")
    return MOCK_STOCKS.filter(
      (s) =>
        s.instrumentType !== "ETF" &&
        s.instrumentType !== "CRYPTO" &&
        (s.exchange ?? "").toUpperCase() !== "SET",
    );
  if (a === "th")
    return MOCK_STOCKS.filter((s) => (s.exchange ?? "").toUpperCase() === "SET");
  if (a === "etf")    return MOCK_STOCKS.filter((s) => s.instrumentType === "ETF");
  if (a === "crypto") return MOCK_STOCKS.filter((s) => s.instrumentType === "CRYPTO");
  return MOCK_STOCKS;
}

// ─── Patch helpers ────────────────────────────────────────────────────────────

/** Patch from per-symbol v8 chart results (primary path for US/ETF/Crypto). */
async function patchViaChart(stocks: Stock[]): Promise<Stock[]> {
  const settled = await Promise.allSettled(
    stocks.map(async (s) => {
      const yahooSym = SYMBOL_TO_META[s.symbol]?.yahooSymbol ?? s.symbol;
      const live = await fetchYahooChartQuote(yahooSym);
      return { symbol: s.symbol, live };
    }),
  );

  const patchMap = new Map<string, ReturnType<typeof fetchYahooChartQuote> extends Promise<infer U> ? NonNullable<U> : never>();
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value.live) {
      patchMap.set(r.value.symbol.toUpperCase(), r.value.live);
    }
  }

  return stocks.map((s) => {
    const patch = patchMap.get(s.symbol.toUpperCase());
    return patch ? { ...s, ...patch } : s;
  });
}

/** Patch from Yahoo v7 bulk (fallback for Thai stocks or when chart fails). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function patchFromV7Bulk(stocks: Stock[], raw: any): Stock[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = raw?.quoteResponse?.result ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byYahoo = new Map<string, any>(results.map((r) => [String(r.symbol ?? ""), r]));

  return stocks.map((s) => {
    const meta     = SYMBOL_TO_META[s.symbol];
    const yahooSym = meta?.yahooSymbol;
    const r        = yahooSym ? byYahoo.get(yahooSym) : null;
    if (!r) return s;
    return {
      ...s,
      price:         Number(r.regularMarketPrice)         || s.price,
      change:        Number(r.regularMarketChange)        || s.change,
      changePercent: Number(r.regularMarketChangePercent) || s.changePercent,
      volume:        Number(r.regularMarketVolume)        || s.volume,
      marketCap:     Number(r.marketCap)                  || s.marketCap,
      high52w:       Number(r.fiftyTwoWeekHigh)           || s.high52w,
      low52w:        Number(r.fiftyTwoWeekLow)            || s.low52w,
      peRatio:
        typeof r.trailingPE === "number" ? r.trailingPE : s.peRatio,
      dividendYield:
        typeof r.trailingAnnualDividendYield === "number"
          ? r.trailingAnnualDividendYield * 100
          : s.dividendYield,
    };
  });
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const asset       = searchParams.get("asset");
  const limitParam  = Number(searchParams.get("limit") ?? "");
  const limit       = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(50, limitParam) : 25;
  const symbolsParam = (searchParams.get("symbols") ?? "").trim();

  try {
    // ── 1. Build base universe from MOCK_STOCKS skeleton ──────────────────
    let baseStocks: Stock[] = [];
    if (symbolsParam) {
      const requested = symbolsParam
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      baseStocks = requested
        .map((sym) => MOCK_STOCKS.find((s) => s.symbol.toUpperCase() === sym))
        .filter(Boolean) as Stock[];
    } else {
      baseStocks = pickUniverse(asset).slice(0, limit);
    }

    let stocks: Stock[] = baseStocks.map((s) => ({ ...s }));

    // ── 2. Live price patching ────────────────────────────────────────────
    // Strategy:
    //   Thai stocks  → try v7 bulk (better field coverage: PE, dividend, etc.)
    //                  if ALL prices come back 0 → fall back to per-symbol chart
    //   US / ETF / Crypto / mixed → per-symbol v8 chart (proven reliable)
    if (stocks.length > 0) {
      const assetKey = (asset ?? "th").toLowerCase();

      if (assetKey === "th") {
        // ── Thai: bulk v7 first, chart fallback ─────────────────────────
        let patched = stocks;
        try {
          const yahooSymbols = stocks
            .map((s) => SYMBOL_TO_META[s.symbol]?.yahooSymbol)
            .filter(Boolean) as string[];
          if (yahooSymbols.length > 0) {
            const raw = await fetchYahooV7Bulk(yahooSymbols.join(","));
            patched = patchFromV7Bulk(stocks, raw);
          }
        } catch {
          // v7 failed entirely — let fallback handle it
        }

        // If v7 returned all-zeros, try per-symbol chart
        const gotData = patched.some((s) => s.price > 0);
        if (!gotData) {
          try {
            patched = await patchViaChart(stocks);
          } catch {
            // keep skeleton
          }
        }
        stocks = patched;

      } else {
        // ── US / ETF / Crypto / all: per-symbol v8 chart (same as trending) ─
        try {
          stocks = await patchViaChart(stocks);
        } catch {
          // keep skeleton
        }
      }
    }

    // ── 3. Indices (bulk v7 for SET indices) ─────────────────────────────
    let indices: MarketIndex[] = [];
    try {
      const indexRaw = await fetchYahooV7Bulk(ALL_YAHOO_INDEX_SYMBOLS);
      indices = transformQuotesToIndices(indexRaw);
    } catch (e) {
      console.warn("[api/market/quotes] failed to fetch indices:", e);
    }

    const finalIndices =
      indices.length > 0
        ? MOCK_INDICES.map(
            (mock) => indices.find((idx) => idx.name === mock.name) ?? mock,
          )
        : MOCK_INDICES;

    return NextResponse.json({
      stocks,
      indices: finalIndices,
      asset:   asset ?? null,
      limit,
    });
  } catch (err) {
    console.error("[api/market/quotes] unhandled error:", err);
    return NextResponse.json(
      { stocks: MOCK_STOCKS, indices: MOCK_INDICES, fromCache: true },
      { status: 200 },
    );
  }
}
