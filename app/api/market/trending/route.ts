import { NextResponse } from "next/server";
import type { TrendingStock } from "@/src/types";

/**
 * Curated list of popular US stocks (CNN Business / market-buzz style).
 * Prices are fetched live from Yahoo Finance — sorted by biggest movers.
 */
const HOT_SYMBOLS: { symbol: string; name: string; sector: string }[] = [
  { symbol: "NVDA",  name: "NVIDIA",       sector: "Technology" },
  { symbol: "TSLA",  name: "Tesla",        sector: "Automotive" },
  { symbol: "AAPL",  name: "Apple",        sector: "Technology" },
  { symbol: "MSFT",  name: "Microsoft",    sector: "Technology" },
  { symbol: "AMZN",  name: "Amazon",       sector: "E-Commerce" },
  { symbol: "META",  name: "Meta",         sector: "Social" },
  { symbol: "GOOGL", name: "Alphabet",     sector: "Technology" },
  { symbol: "AMD",   name: "AMD",          sector: "Semiconductors" },
  { symbol: "NFLX",  name: "Netflix",      sector: "Streaming" },
  { symbol: "PLTR",  name: "Palantir",     sector: "AI/Data" },
  { symbol: "UBER",  name: "Uber",         sector: "Transportation" },
  { symbol: "COIN",  name: "Coinbase",     sector: "Crypto" },
  { symbol: "SMCI",  name: "Super Micro",  sector: "Servers" },
  { symbol: "ARM",   name: "Arm Holdings", sector: "Semiconductors" },
];

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
  Origin: "https://finance.yahoo.com",
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

async function fetchQuote(
  symbol: string,
  name: string,
  sector: string
): Promise<TrendingStock | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d&lang=en&region=US`;
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
    const changePct = (meta.regularMarketChangePercent ??
      (prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : 0)) as number;
    const volume    = (meta.regularMarketVolume ?? 0) as number;
    const marketCap = (meta.marketCap ?? 0) as number;

    return {
      symbol,
      name,
      sector,
      price:         round2(price),
      change:        round2(change),
      changePercent: round2(changePct),
      volume,
      marketCap,
    };
  } catch {
    return null;
  }
}

// GET /api/market/trending
export async function GET() {
  const settled = await Promise.allSettled(
    HOT_SYMBOLS.map((s) => fetchQuote(s.symbol, s.name, s.sector))
  );

  const stocks: TrendingStock[] = [];
  for (const result of settled) {
    if (result.status === "fulfilled" && result.value) {
      stocks.push(result.value);
    }
  }

  // Sort by absolute changePercent — biggest movers first
  stocks.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

  return NextResponse.json({ stocks });
}
