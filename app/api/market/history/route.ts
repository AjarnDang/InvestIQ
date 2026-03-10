import { NextRequest, NextResponse } from "next/server";
import { transformChartToPriceHistory } from "@/src/functions/yahooTransform";
import { SYMBOL_TO_META } from "@/src/data/sectorMap";
import { generatePriceHistory } from "@/src/functions/marketFunctions";
import { MOCK_STOCKS } from "@/src/data/stocks";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

// Intervals that represent intraday (sub-daily) data
const INTRADAY_INTERVALS = new Set(["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h"]);

// GET /api/market/history?symbol=PTT&range=1mo&interval=1d
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol   = searchParams.get("symbol") ?? "";
  const range    = searchParams.get("range")    ?? "1mo";
  const interval = searchParams.get("interval") ?? "1d";

  const isIntraday = INTRADAY_INTERVALS.has(interval);

  // Resolve Yahoo Finance ticker: use SYMBOL_TO_META for SET stocks,
  // fall back to the raw symbol for US stocks (NVDA, AAPL, etc.)
  const meta = SYMBOL_TO_META[symbol.toUpperCase()];
  const yahooTicker = meta ? meta.yahooSymbol : symbol.toUpperCase();

  if (!yahooTicker) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  try {
    const encoded = encodeURIComponent(yahooTicker);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=${interval}&range=${range}&lang=en&region=TH`;

    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      // Intraday data changes frequently — short cache; daily+ data is stable
      next: { revalidate: isIntraday ? 60 : 300 },
    });
    if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`);

    const raw = await res.json();
    const history = transformChartToPriceHistory(raw, isIntraday);

    if (history.length === 0) throw new Error("Empty history from Yahoo Finance");

    return NextResponse.json({ symbol, history });
  } catch (err) {
    console.error(`[api/market/history] error for ${symbol}:`, err);

    // Fallback: generate synthetic history from mock price (only for known SET stocks)
    if (meta) {
      const mockStock = MOCK_STOCKS.find((s) => s.symbol === symbol);
      const fallbackHistory = generatePriceHistory(mockStock?.price ?? 100, 30, 0.015);
      return NextResponse.json({ symbol, history: fallbackHistory, fromCache: true });
    }

    return NextResponse.json({ symbol, history: [] });
  }
}
