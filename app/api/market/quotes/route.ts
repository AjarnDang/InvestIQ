import { NextRequest, NextResponse } from "next/server";
import {
  transformQuotesToStocks,
  transformQuotesToIndices,
} from "@/src/functions/yahooTransform";
import {
  chunkYahooSymbols,
  ALL_YAHOO_INDEX_SYMBOLS,
} from "@/src/data/sectorMap";
import { MOCK_STOCKS } from "@/src/data/stocks";
import { MOCK_INDICES } from "@/src/data/indices";
import type { Stock } from "@/src/types";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
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
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Yahoo Finance v7 responded ${res.status}`);
  return res.json();
}

// GET /api/market/quotes
export async function GET(_req: NextRequest) {
  try {
    // Split the symbol list into chunks of 25 to stay well within Yahoo's limits.
    // Each chunk is fetched in parallel, results are merged.
    const chunks = chunkYahooSymbols(25);

    const [chunkResults, indexRaw] = await Promise.all([
      Promise.allSettled(chunks.map((chunk) => fetchYahooQuotes(chunk.join(",")))),
      fetchYahooQuotes(ALL_YAHOO_INDEX_SYMBOLS),
    ]);

    // Merge all successful chunk results into one stocks array
    const stocks: Stock[] = [];
    for (const result of chunkResults) {
      if (result.status === "fulfilled") {
        stocks.push(...transformQuotesToStocks(result.value));
      }
    }

    const indices = transformQuotesToIndices(indexRaw);

    // Use API data when available; fall back to mock skeleton for missing entries
    const finalStocks = stocks.length > 0 ? stocks : MOCK_STOCKS;

    const finalIndices =
      indices.length > 0
        ? MOCK_INDICES.map(
            (mock) => indices.find((idx) => idx.name === mock.name) ?? mock,
          )
        : MOCK_INDICES;

    return NextResponse.json({ stocks: finalStocks, indices: finalIndices });
  } catch (err) {
    console.error("[api/market/quotes] error:", err);
    return NextResponse.json(
      { stocks: MOCK_STOCKS, indices: MOCK_INDICES, fromCache: true },
      { status: 200 },
    );
  }
}
