import { NextRequest, NextResponse } from "next/server";
import { STOCK_META } from "@/src/data/sectorMap";
import { alphaVantageSymbolSearchUrl, yahooQuery2SearchUrl } from "@/src/config/externalUrls";

interface YahooSearchResult {
  symbol: string;
  longname?: string;
  shortname?: string;
  exchDisp?: string;
  typeDisp?: string;
  quoteType?: string;
}

interface AlphaSearchMatch {
  "1. symbol":   string;
  "2. name":     string;
  "3. type":     string;
  "4. region"?:  string;
  "8. currency"?: string;
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

/** Map Alpha Vantage type string to a compact badge type */
function normalizeAlphaType(raw: string | undefined): string {
  if (!raw) return "OTHER";
  const t = raw.toLowerCase();
  if (t.includes("etf")) return "ETF";
  if (t.includes("stock") || t.includes("equity")) return "EQUITY";
  if (t.includes("fund") || t.includes("mutual")) return "FUND";
  if (t.includes("index")) return "INDEX";
  if (t.includes("crypto")) return "CRYPTO";
  if (t.includes("bond")) return "BOND";
  if (t.includes("trust")) return "TRUST";
  if (t.includes("currency") || t.includes("forex") || t.includes("fx")) return "FX";
  if (t.includes("commodity") || t.includes("gold") || t.includes("silver")) return "COMMODITY";
  return raw.toUpperCase();
}

async function searchYahoo(query: string): Promise<SearchResultItem[]> {
  try {
    const url = yahooQuery2SearchUrl({
      q: query,
      quotesCount: 10,
      newsCount: 0,
      enableFuzzyQuery: true,
      quotesQueryId: "tss_match_phrase_query",
    });
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const quotes: YahooSearchResult[] = data?.finance?.result?.[0]?.quotes ?? [];
    return quotes
      .filter((q) => q.quoteType && q.quoteType !== "OPTION")
      .map((q) => ({
        symbol:   q.symbol,
        name:     q.longname ?? q.shortname ?? q.symbol,
        exchange: q.exchDisp ?? "—",
        type:     q.typeDisp ?? q.quoteType ?? "EQUITY",
      }));
  } catch {
    // Yahoo autocomplete is optional — silently fall back to local/Alpha results
    return [];
  }
}

async function searchAlpha(query: string): Promise<SearchResultItem[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return [];

  try {
    const url = alphaVantageSymbolSearchUrl(query, apiKey);
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      // Cache slightly to avoid hitting the free-tier rate limit too quickly
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const matches: AlphaSearchMatch[] = data?.bestMatches ?? [];

    return matches.slice(0, 10).map((m) => ({
      symbol:   m["1. symbol"],
      name:     m["2. name"],
      exchange: m["4. region"] || m["8. currency"] || "—",
      type:     normalizeAlphaType(m["3. type"]),
    }));
  } catch {
    // Alpha Vantage is optional — we still have local/Yahoo
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // 1. Local fast match first
  const local = searchLocal(query);

  // 2. Remote providers in parallel: Yahoo + Alpha Vantage
  const [yahoo, alpha] = await Promise.all([searchYahoo(query), searchAlpha(query)]);

  // Merge: local first, then yahoo, then alpha (deduplicate by symbol)
  const seen = new Set(local.map((r) => r.symbol.toUpperCase()));
  const merged: SearchResultItem[] = [...local];

  for (const r of yahoo) {
    const key = r.symbol.toUpperCase();
    if (!seen.has(key)) {
      merged.push(r);
      seen.add(key);
    }
    if (merged.length >= 20) break;
  }

  for (const r of alpha) {
    const key = r.symbol.toUpperCase();
    if (!seen.has(key)) {
      merged.push(r);
      seen.add(key);
    }
    if (merged.length >= 30) break;
  }

  return NextResponse.json({ results: merged });
}
