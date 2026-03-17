import { NextRequest, NextResponse } from "next/server";
import { SYMBOL_TO_META } from "@/src/data/sectorMap";
import { resolveAliasToYahoo } from "@/src/data/indexAliases";

export const revalidate = 300;

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://finance.yahoo.com/",
  Origin: "https://finance.yahoo.com",
};

export interface AnalystRecommendation {
  period: string;    // "0m" = current month, "-1m" = last month …
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface StockAnalysis {
  symbol: string;
  // Consensus recommendation from Yahoo
  recommendationKey: string | null;   // "strongBuy" | "buy" | "hold" | "sell" | "strongSell"
  recommendationMean: number | null;  // 1 (strong buy) – 5 (strong sell)
  numberOfAnalysts: number | null;
  // Price targets (Wall Street consensus)
  targetMeanPrice: number | null;
  targetHighPrice: number | null;
  targetLowPrice: number | null;
  targetMedianPrice: number | null;
  // Current market price (for % upside calculation)
  currentPrice: number | null;
  // Monthly recommendation breakdown
  recommendationTrend: AnalystRecommendation[];
  // Fundamental data
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  returnOnEquity: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
}

function resolveYahooSymbol(sym: string): string {
  const upper = sym.toUpperCase();
  const indexYahoo = resolveAliasToYahoo(upper);
  if (indexYahoo) return indexYahoo;
  const meta = SYMBOL_TO_META[upper];
  if (meta) return meta.yahooSymbol;
  return upper;
}

async function fetchQuoteSummary(yahooSymbol: string): Promise<StockAnalysis | null> {
  const modules = [
    "financialData",
    "recommendationTrend",
    "defaultKeyStatistics",
  ].join(",");

  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
    yahooSymbol,
  )}?modules=${modules}`;

  const res = await fetch(url, {
    headers: YAHOO_HEADERS,
    next: { revalidate },
  });
  // Yahoo Finance frequently returns 401 "Invalid Crumb" from server environments.
  // In that case we fall back to scraping a public Wall Street consensus page.
  if (!res.ok) return null;

  const data = await res.json();
  const result = data?.quoteSummary?.result?.[0];
  if (!result) return null;

  const fd = result.financialData ?? {};
  const rt = result.recommendationTrend ?? {};
  const ks = result.defaultKeyStatistics ?? {};

  const trend: AnalystRecommendation[] = (rt.trend ?? [])
    .map((t: Record<string, { raw?: number } | string>) => ({
      period: t.period as string,
      strongBuy: Number((t.strongBuy as { raw?: number })?.raw ?? 0),
      buy:       Number((t.buy       as { raw?: number })?.raw ?? 0),
      hold:      Number((t.hold      as { raw?: number })?.raw ?? 0),
      sell:      Number((t.sell      as { raw?: number })?.raw ?? 0),
      strongSell:Number((t.strongSell as { raw?: number })?.raw ?? 0),
    }))
    .slice(0, 4);

  const raw = <T>(field: { raw?: T } | undefined): T | null =>
    field?.raw ?? null;

  return {
    symbol: yahooSymbol,
    recommendationKey:  fd.recommendationKey  ?? null,
    recommendationMean: raw<number>(fd.recommendationMean),
    numberOfAnalysts:   raw<number>(fd.numberOfAnalystOpinions),
    targetMeanPrice:    raw<number>(fd.targetMeanPrice),
    targetHighPrice:    raw<number>(fd.targetHighPrice),
    targetLowPrice:     raw<number>(fd.targetLowPrice),
    targetMedianPrice:  raw<number>(fd.targetMedianPrice),
    currentPrice:       raw<number>(fd.currentPrice),
    recommendationTrend: trend,
    revenueGrowth:  raw<number>(fd.revenueGrowth),
    earningsGrowth: raw<number>(fd.earningsGrowth),
    returnOnEquity: raw<number>(fd.returnOnEquity),
    debtToEquity:   raw<number>(ks.debtToEquity),
    currentRatio:   raw<number>(fd.currentRatio),
  };
}

function parseLastTdNumber(rowHtml: string): number {
  const nums = Array.from(rowHtml.matchAll(/<td[^>]*>\s*([0-9]+)\s*<\/td>/gi)).map(
    (m) => Number(m[1]),
  );
  return nums.length ? nums[nums.length - 1] : 0;
}

async function fetchFromStockAnalysis(sym: string): Promise<StockAnalysis | null> {
  // Public page with Wall Street consensus targets + rating breakdown.
  // Example: https://stockanalysis.com/stocks/aapl/forecast/
  const lower = sym.toLowerCase();
  const url = `https://stockanalysis.com/stocks/${encodeURIComponent(lower)}/forecast/`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate },
  });
  if (!res.ok) return null;
  const html = await res.text();

  // Parse the summary sentence:
  // "... average price target of $297.1 ... The lowest target is $200 and the highest is $350."
  const sentence =
    html.match(
      /average price target of\s*\$([0-9]+(?:\.[0-9]+)?)\b[\s\S]{0,180}?lowest target is\s*\$([0-9]+(?:\.[0-9]+)?)\b[\s\S]{0,120}?highest is\s*\$([0-9]+(?:\.[0-9]+)?)\b/i,
    ) ?? null;

  const targetMeanPrice = sentence ? Number(sentence[1]) : null;
  const targetLowPrice = sentence ? Number(sentence[2]) : null;
  const targetHighPrice = sentence ? Number(sentence[3]) : null;

  // Parse the consensus table (use the latest column values).
  const pickRow = (label: string) => {
    const re = new RegExp(
      `<tr[^>]*>[\\s\\S]*?<td[^>]*>\\s*${label}\\s*<\\/td>[\\s\\S]*?<\\/tr>`,
      "i",
    );
    const m = html.match(re);
    return m ? m[0] : "";
  };

  const strongBuy = parseLastTdNumber(pickRow("Strong Buy"));
  const buy = parseLastTdNumber(pickRow("Buy"));
  const hold = parseLastTdNumber(pickRow("Hold"));
  const sell = parseLastTdNumber(pickRow("Sell"));
  const strongSell = parseLastTdNumber(pickRow("Strong Sell"));
  const total = strongBuy + buy + hold + sell + strongSell;

  // Derive a recommendationKey from the largest bucket.
  const buckets = [
    { k: "strongBuy", v: strongBuy },
    { k: "buy", v: buy },
    { k: "hold", v: hold },
    { k: "sell", v: sell },
    { k: "strongSell", v: strongSell },
  ] as const;
  const max = buckets.reduce((a, b) => (b.v > a.v ? b : a), buckets[0]);

  return {
    symbol: sym,
    recommendationKey: total > 0 ? max.k : null,
    recommendationMean: null,
    numberOfAnalysts: total > 0 ? total : null,
    targetMeanPrice,
    targetHighPrice,
    targetLowPrice,
    targetMedianPrice: null,
    currentPrice: null,
    recommendationTrend: [
      {
        period: "0m",
        strongBuy,
        buy,
        hold,
        sell,
        strongSell,
      },
    ],
    revenueGrowth: null,
    earningsGrowth: null,
    returnOnEquity: null,
    debtToEquity: null,
    currentRatio: null,
  };
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

  const yahooSymbol = resolveYahooSymbol(sym);

  try {
    const yahoo = await fetchQuoteSummary(yahooSymbol);
    if (yahoo) return NextResponse.json({ analysis: { ...yahoo, symbol: sym } });

    // Fallback: scrape a public Wall Street consensus source when Yahoo is blocked (401 Invalid Crumb).
    const fallback = await fetchFromStockAnalysis(sym);
    if (fallback) return NextResponse.json({ analysis: { ...fallback, symbol: sym } });

    return NextResponse.json({ error: "No analyst data" }, { status: 404 });
  } catch (err) {
    console.error(`[api/market/analysis] error for ${sym}:`, err);
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}
