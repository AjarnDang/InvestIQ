import { NextRequest, NextResponse } from "next/server";
import {
  transformQuotesToStocks,
  transformQuotesToIndices,
} from "@/src/functions/yahooTransform";
import {
  ALL_YAHOO_STOCK_SYMBOLS,
  ALL_YAHOO_INDEX_SYMBOLS,
} from "@/src/data/sectorMap";
import { MOCK_STOCKS } from "@/src/data/stocks";
import { MOCK_INDICES } from "@/src/data/indices";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

const YAHOO_FIELDS = [
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

async function fetchYahooQuotes(symbols: string) {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=${YAHOO_FIELDS}&lang=en&region=US`;
  const res = await fetch(url, {
    headers: YAHOO_HEADERS,
    next: { revalidate: 60 }, // cache for 60 seconds
  });
  if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`);
  return res.json();
}

// GET /api/market/quotes
export async function GET(_req: NextRequest) {
  try {
    // fetch stocks and indices in parallel
    const [stockRaw, indexRaw] = await Promise.all([
      fetchYahooQuotes(ALL_YAHOO_STOCK_SYMBOLS),
      fetchYahooQuotes(ALL_YAHOO_INDEX_SYMBOLS),
    ]);

    const stocks  = transformQuotesToStocks(stockRaw);
    const indices = transformQuotesToIndices(indexRaw);

    // Fill any missing stocks/indices with mock data as fallback
    const finalStocks = stocks.length > 0 ? stocks : MOCK_STOCKS;

    // For indices, only replace what Yahoo returned (some may be unavailable)
    const finalIndices =
      indices.length > 0
        ? MOCK_INDICES.map(
            (mock) => indices.find((idx) => idx.name === mock.name) ?? mock
          )
        : MOCK_INDICES;

    return NextResponse.json({ stocks: finalStocks, indices: finalIndices });
  } catch (err) {
    console.error("[api/market/quotes] error:", err);
    // Graceful fallback — return mock data so the UI never breaks
    return NextResponse.json(
      { stocks: MOCK_STOCKS, indices: MOCK_INDICES, fromCache: true },
      { status: 200 }
    );
  }
}
