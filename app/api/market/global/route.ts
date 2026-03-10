import { NextResponse } from "next/server";
import { transformQuotesToGlobalIndices } from "@/src/functions/yahooTransform";
import { ALL_GLOBAL_SYMBOLS } from "@/src/data/globalIndices";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

const FIELDS = [
  "regularMarketPrice",
  "regularMarketChange",
  "regularMarketChangePercent",
].join(",");

// GET /api/market/global
export async function GET() {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(ALL_GLOBAL_SYMBOLS)}&fields=${FIELDS}&lang=en&region=US`;

    const res = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`);

    const raw = await res.json();
    const globalIndices = transformQuotesToGlobalIndices(raw);

    if (globalIndices.length === 0) throw new Error("No global index data returned");

    return NextResponse.json({ globalIndices });
  } catch (err) {
    console.error("[api/market/global] error:", err);
    // Return empty — UI will keep previous values or show dashes
    return NextResponse.json({ globalIndices: [], error: String(err) }, { status: 200 });
  }
}
