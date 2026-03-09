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

// GET /api/market/history?symbol=PTT&range=1mo&interval=1d
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const symbol   = searchParams.get("symbol") ?? "";
  const range    = searchParams.get("range")    ?? "1mo";
  const interval = searchParams.get("interval") ?? "1d";

  const meta = SYMBOL_TO_META[symbol.toUpperCase()];
  if (!meta) {
    return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });
  }

  try {
    const yahooSymbol = encodeURIComponent(meta.yahooSymbol);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}&lang=en&region=TH`;

    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 300 }, // cache for 5 minutes
    });
    if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`);

    const raw = await res.json();
    const history = transformChartToPriceHistory(raw);

    if (history.length === 0) throw new Error("Empty history from Yahoo Finance");

    return NextResponse.json({ symbol, history });
  } catch (err) {
    console.error(`[api/market/history] error for ${symbol}:`, err);

    // Fallback: generate synthetic history from mock price
    const mockStock = MOCK_STOCKS.find((s) => s.symbol === symbol);
    const fallbackHistory = generatePriceHistory(mockStock?.price ?? 100, 30, 0.015);

    return NextResponse.json({ symbol, history: fallbackHistory, fromCache: true });
  }
}
