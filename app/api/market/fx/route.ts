import { NextResponse } from "next/server";
import { EXTERNAL_URLS, yahooChartUrl } from "@/src/config/externalUrls";

export const revalidate = 60;

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: EXTERNAL_URLS.yahooFinanceReferer,
  Origin: EXTERNAL_URLS.yahooFinanceOrigin,
};

// GET /api/market/fx  -> { fxUsdThb }
export async function GET() {
  // Yahoo Finance FX ticker: USDTHB=X (THB per 1 USD)
  const yahooSymbol = "USDTHB=X";
  const url = yahooChartUrl(encodeURIComponent(yahooSymbol), {
    interval: "1d",
    range: "2d",
    lang: "en",
    region: "US",
  });

  try {
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Yahoo Finance responded ${res.status}` },
        { status: 502 },
      );
    }

    const raw = await res.json();
    const meta = raw?.chart?.result?.[0]?.meta;
    const rate = Number(meta?.regularMarketPrice);
    if (!Number.isFinite(rate) || rate <= 0) {
      return NextResponse.json({ error: "Invalid FX rate" }, { status: 502 });
    }

    return NextResponse.json({ fxUsdThb: Math.round(rate * 10000) / 10000 });
  } catch (err) {
    console.error("[api/market/fx] error:", err);
    return NextResponse.json({ error: "Could not fetch FX rate" }, { status: 500 });
  }
}

