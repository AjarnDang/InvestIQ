import { NextResponse } from "next/server";
import { transformChartToQuote } from "@/src/functions/yahooTransform";
import { GLOBAL_INDEX_META } from "@/src/data/globalIndices";
import type { MarketIndex } from "@/src/types";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
  Origin: "https://finance.yahoo.com",
};

/**
 * Fetch one symbol using the v8/finance/chart endpoint.
 * This endpoint requires no authentication and is not blocked like v7/quote.
 */
async function fetchIndexChart(
  yahooSymbol: string,
  displayName: string
): Promise<MarketIndex | null> {
  const encoded = encodeURIComponent(yahooSymbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=2d&lang=en&region=US`;

  const res = await fetch(url, {
    headers: YAHOO_HEADERS,
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${yahooSymbol}`);

  const raw = await res.json();
  return transformChartToQuote(raw, displayName);
}

// GET /api/market/global
export async function GET() {
  // Fetch all 4 symbols in parallel; gracefully handle individual failures
  const settled = await Promise.allSettled(
    GLOBAL_INDEX_META.map((m) => fetchIndexChart(m.yahooSymbol, m.displayName))
  );

  const globalIndices: MarketIndex[] = [];
  const errors: string[] = [];

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    if (result.status === "fulfilled" && result.value) {
      globalIndices.push(result.value);
    } else if (result.status === "rejected") {
      errors.push(String(result.reason));
    }
  }

  if (errors.length > 0) {
    console.warn("[api/market/global] partial errors:", errors);
  }

  return NextResponse.json({ globalIndices });
}
