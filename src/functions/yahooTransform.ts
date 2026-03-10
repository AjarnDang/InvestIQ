import type { Stock, MarketIndex, PriceHistory } from "@/src/types";
import { YAHOO_TO_META, INDEX_META } from "@/src/data/sectorMap";
import { GLOBAL_YAHOO_TO_META } from "@/src/data/globalIndices";

// ─── Yahoo Finance API Response Types ────────────────────────────────────────

interface YahooQuoteResult {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingPE?: number;
  trailingAnnualDividendYield?: number;
}

interface YahooQuoteResponse {
  quoteResponse?: {
    result?: YahooQuoteResult[];
    error?: unknown;
  };
}

interface YahooChartMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  gmtoffset?: number;
}

interface YahooChartResult {
  meta?: YahooChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      open?: (number | null)[];
      high?: (number | null)[];
      low?: (number | null)[];
      close?: (number | null)[];
      volume?: (number | null)[];
    }>;
  };
}

interface YahooChartResponse {
  chart?: {
    result?: YahooChartResult[];
    error?: unknown;
  };
}

// ─── Transform: Quotes → Stock[] ─────────────────────────────────────────────

export function transformQuotesToStocks(raw: YahooQuoteResponse): Stock[] {
  const results = raw?.quoteResponse?.result ?? [];
  const stocks: Stock[] = [];

  for (const q of results) {
    const meta = YAHOO_TO_META[q.symbol];
    if (!meta) continue; // skip unknowns (e.g. index symbols mixed in)

    stocks.push({
      symbol:          meta.symbol,
      name:            meta.name,
      sector:          meta.sector,
      price:           round2(q.regularMarketPrice ?? 0),
      change:          round2(q.regularMarketChange ?? 0),
      changePercent:   round2(q.regularMarketChangePercent ?? 0),
      volume:          q.regularMarketVolume ?? 0,
      marketCap:       q.marketCap ?? 0,
      high52w:         round2(q.fiftyTwoWeekHigh ?? 0),
      low52w:          round2(q.fiftyTwoWeekLow ?? 0),
      peRatio:         q.trailingPE != null ? round2(q.trailingPE) : undefined,
      dividendYield:   q.trailingAnnualDividendYield != null
                         ? round2(q.trailingAnnualDividendYield * 100) // decimal → %
                         : undefined,
    });
  }

  return stocks;
}

// ─── Transform: Quotes → SET MarketIndex[] ───────────────────────────────────

export function transformQuotesToIndices(raw: YahooQuoteResponse): MarketIndex[] {
  const results = raw?.quoteResponse?.result ?? [];
  return results.flatMap((q) => {
    const meta = INDEX_META.find((m) => m.yahooSymbol === q.symbol);
    if (!meta) return [];
    return [{
      name:          meta.displayName,
      value:         round2(q.regularMarketPrice ?? 0),
      change:        round2(q.regularMarketChange ?? 0),
      changePercent: round2(q.regularMarketChangePercent ?? 0),
    }];
  });
}

// ─── Transform: Quotes → Global MarketIndex[] (US + Forex) ───────────────────

export function transformQuotesToGlobalIndices(raw: YahooQuoteResponse): MarketIndex[] {
  const results = raw?.quoteResponse?.result ?? [];
  return results.flatMap((q) => {
    const meta = GLOBAL_YAHOO_TO_META[q.symbol];
    if (!meta) return [];
    return [{
      name:          meta.displayName,
      value:         round2(q.regularMarketPrice ?? 0),
      change:        round2(q.regularMarketChange ?? 0),
      changePercent: round2(q.regularMarketChangePercent ?? 0),
    }];
  });
}

// ─── Transform: Chart meta → single MarketIndex quote ────────────────────────

/**
 * Extracts the current price + change from a v8/finance/chart response.
 * Used for indices/forex where we only need the latest quote, not full OHLCV history.
 */
export function transformChartToQuote(
  raw: YahooChartResponse,
  displayName: string
): MarketIndex | null {
  const meta = raw?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) return null;

  const price      = meta.regularMarketPrice;
  const prevClose  = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change     = meta.regularMarketChange ?? price - prevClose;
  const changePct  = meta.regularMarketChangePercent ??
                     (prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0);

  return {
    name:          displayName,
    value:         round2(price),
    change:        round2(change),
    changePercent: round2(changePct),
  };
}

// ─── Transform: Chart → PriceHistory[] ───────────────────────────────────────

export function transformChartToPriceHistory(
  raw: YahooChartResponse,
  intraday = false,
): PriceHistory[] {
  const result = raw?.chart?.result?.[0];
  if (!result) return [];

  // gmtoffset is the exchange's UTC offset in seconds (e.g. 25200 for ICT UTC+7)
  const gmtOffset = result.meta?.gmtoffset ?? 0;

  const timestamps = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];
  if (!quote) return [];

  const history: PriceHistory[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const close  = quote.close?.[i];
    const open   = quote.open?.[i];
    const high   = quote.high?.[i];
    const low    = quote.low?.[i];
    const volume = quote.volume?.[i];

    // skip candles with missing OHLC data
    if (close == null || open == null || high == null || low == null) continue;

    const ts = timestamps[i];
    let dateStr: string;

    if (intraday) {
      // Shift to the exchange's local time and extract HH:MM
      const localMs = (ts + gmtOffset) * 1000;
      const d = new Date(localMs);
      const hh = String(d.getUTCHours()).padStart(2, "0");
      const mm = String(d.getUTCMinutes()).padStart(2, "0");
      dateStr = `${hh}:${mm}`;
    } else {
      dateStr = new Date(ts * 1000).toISOString().split("T")[0];
    }

    history.push({
      date:   dateStr,
      open:   round2(open),
      high:   round2(high),
      low:    round2(low),
      close:  round2(close),
      volume: volume ?? 0,
    });
  }

  return history;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
