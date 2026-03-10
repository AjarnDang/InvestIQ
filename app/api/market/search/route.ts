import { NextRequest, NextResponse } from "next/server";
import { STOCK_META } from "@/src/data/sectorMap";

const YAHOO_SEARCH_URL = "https://query2.finance.yahoo.com/v1/finance/search";

interface YahooSearchResult {
  symbol: string;
  longname?: string;
  shortname?: string;
  exchDisp?: string;
  typeDisp?: string;
  quoteType?: string;
}

interface SearchResultItem {
  symbol:    string;
  name:      string;
  exchange:  string;
  type:      string;
  sector?:   string;
  keywords?: string[];
}

/** Normalize a query string for fuzzy matching */
function normalize(s: string) {
  return s.toLowerCase().replace(/[\s._-]/g, "");
}

/** Search STOCK_META for local matches */
function searchLocal(query: string): SearchResultItem[] {
  const q = normalize(query);
  return STOCK_META.filter((m) => {
    const sym = normalize(m.symbol);
    const name = normalize(m.name ?? "");
    const kw = (m.searchKeywords ?? []).map(normalize);
    return sym.startsWith(q) || name.includes(q) || kw.some((k) => k.includes(q));
  })
    .slice(0, 8)
    .map((m) => ({
      symbol:    m.symbol,
      name:      m.name ?? m.symbol,
      exchange:  m.exchange ?? "—",
      type:      m.type ?? "STOCK",
      sector:    m.sector,
      keywords:  m.searchKeywords,
    }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // 1. Local fast match first
  const local = searchLocal(query);

  // 2. Fetch from Yahoo Finance (unauthenticated autocomplete endpoint)
  let yahoo: SearchResultItem[] = [];
  try {
    const url = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=true&quotesQueryId=tss_match_phrase_query`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const data = await res.json();
      const quotes: YahooSearchResult[] = data?.finance?.result?.[0]?.quotes ?? [];
      yahoo = quotes
        .filter((q) => q.quoteType && q.quoteType !== "OPTION")
        .map((q) => ({
          symbol:   q.symbol,
          name:     q.longname ?? q.shortname ?? q.symbol,
          exchange: q.exchDisp ?? "—",
          type:     q.typeDisp ?? q.quoteType ?? "EQUITY",
        }));
    }
  } catch {
    // Yahoo autocomplete is optional — silently fall back to local results
  }

  // Merge: local first, then yahoo (deduplicate by symbol)
  const seen = new Set(local.map((r) => r.symbol.toUpperCase()));
  const merged: SearchResultItem[] = [...local];
  for (const r of yahoo) {
    if (!seen.has(r.symbol.toUpperCase())) {
      merged.push(r);
      seen.add(r.symbol.toUpperCase());
    }
    if (merged.length >= 10) break;
  }

  return NextResponse.json({ results: merged });
}
