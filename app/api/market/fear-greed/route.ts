import { NextResponse } from "next/server";

/**
 * Fear & Greed Index from Alternative.me (crypto market sentiment).
 * CNN-style stock market Fear & Greed is proprietary; this provides a real 0–100
 * sentiment API with historical data. Same scale: 0 = Extreme Fear, 100 = Extreme Greed.
 */
const FNG_URL = "https://api.alternative.me/fng/?limit=400";

type FngItem = {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update?: string;
};

type FngResponse = {
  data: FngItem[];
  metadata?: { error: string | null };
};

function parseItem(item: FngItem) {
  return {
    value: Math.min(100, Math.max(0, parseInt(item.value, 10) || 0)),
    classification: item.value_classification || "Unknown",
    timestamp: item.timestamp,
  };
}

export async function GET() {
  try {
    const res = await fetch(FNG_URL, {
      next: { revalidate: 60 * 60 }, // 1 hour
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("FNG fetch failed");
    const json = (await res.json()) as FngResponse;
    const data = json?.data;
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "No Fear & Greed data" },
        { status: 502 },
      );
    }

    const current = parseItem(data[0]);
    const prevClose = data[1] ? parseItem(data[1]) : null;
    const weekAgo = data[7] ? parseItem(data[7]) : null;
    const monthAgo = data[30] ? parseItem(data[30]) : null;
    const yearAgo = data[365] ? parseItem(data[365]) : null;

    return NextResponse.json({
      value: current.value,
      classification: current.classification,
      timestamp: current.timestamp,
      previousClose: prevClose?.value ?? null,
      weekAgo: weekAgo?.value ?? null,
      monthAgo: monthAgo?.value ?? null,
      yearAgo: yearAgo?.value ?? null,
      source: "alternative.me",
    });
  } catch (err) {
    console.error("[fear-greed]", err);
    return NextResponse.json(
      { error: "Failed to fetch Fear & Greed Index" },
      { status: 502 },
    );
  }
}
