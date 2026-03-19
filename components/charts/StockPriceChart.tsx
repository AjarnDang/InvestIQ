"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PriceHistory } from "@/src/types";

interface Props {
  data: PriceHistory[];
  height?: number;
  currency?: string;
  intraday?: boolean;
  rangeLabel?: "1D" | "5D" | "1M" | "6M" | "YTD" | "1Y" | "5Y" | "MAX";
}

// Format a price for the Y-axis tick label
function fmtAxisPrice(v: number, currency: string): string {
  const sym = currency === "USD" ? "$" : "฿";
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${sym}${(v / 1_000).toFixed(0)}K`;
  return `${sym}${v.toFixed(v < 10 ? 2 : 0)}`;
}

// Format a price for the tooltip value
function fmtTooltipPrice(v: number, currency: string): string {
  const sym = currency === "USD" ? "$" : "฿";
  return `${sym}${v.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtTooltipDate(
  p: PriceHistory | undefined,
  intraday: boolean,
  showTime: boolean,
): string {
  if (!p) return "";

  // Prefer real ISO timestamp if present (intraday path).
  if (p.ts) {
    // p.ts is exchange-local (no TZ suffix). Use as local for display consistency.
    const d = new Date(p.ts);
    if (!isNaN(d.getTime())) {
      if (showTime) {
        return d.toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      }
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  if (!intraday) {
    const d = new Date(p.date + "T00:00:00");
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  // Fallback: whatever we have (HH:MM or YYYY-MM-DD)
  return p.date;
}

// Format the date/time label on the X-axis
// Intraday dates arrive as "HH:MM" — pass through as-is.
// Daily dates arrive as "YYYY-MM-DD" — format as "d MMM" (e.g. "10 Mar").
function fmtXLabel(tick: string, intraday: boolean): string {
  if (intraday) return tick; // already "HH:MM"

  const d = new Date(tick + "T00:00:00"); // force local midnight to avoid UTC shift
  if (isNaN(d.getTime())) return tick;

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function StockPriceChart({
  data,
  height = 220,
  currency = "THB",
  intraday = false,
  rangeLabel,
}: Props) {
  const safeData = useMemo(() => {
    // Recharts treats string X values as categories; if intraday has duplicates
    // (e.g., partial trading day) it can collapse into a single point.
    // We enforce uniqueness by keying on a full timestamp when available.
    if (!intraday) return data;
    const seen = new Map<string, PriceHistory>();
    for (const p of data) {
      const key = p.ts ?? p.date; // ts is unique across multi-day intraday ranges
      seen.set(key, p);
    }
    return Array.from(seen.values());
  }, [data, intraday]);

  const chartData = useMemo(() => {
    // Use a stable X key so multi-day intraday (5D) doesn't collapse.
    return safeData.map((p) => ({
      ...p,
      x: intraday ? (p.ts ?? p.date) : p.date,
    }));
  }, [safeData, intraday]);

  const isPositive = useMemo(
    () =>
      safeData.length >= 2 &&
      safeData[safeData.length - 1].close >= safeData[0].close,
    [safeData],
  );
  const lineColor  = isPositive ? "#10b981" : "#ef4444";
  const gradientId = "stock-chart-gradient";

  // Decide how many ticks to show on X-axis
  const tickCount = safeData.length;
  const tickInterval = tickCount <= 20 ? 0 : Math.floor(tickCount / 6);
  const showTimeInTooltip = rangeLabel === "1D";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={lineColor} stopOpacity={0.18} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

        <XAxis
          dataKey="x"
          tickFormatter={(tick) => {
            const s = String(tick);
            if (intraday && s.includes("T")) {
              const d = new Date(s);
              if (!isNaN(d.getTime())) {
                const hh = String(d.getHours()).padStart(2, "0");
                const mm = String(d.getMinutes()).padStart(2, "0");
                return `${hh}:${mm}`;
              }
            }
            return fmtXLabel(s, intraday);
          }}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval={tickInterval === 0 ? "preserveStartEnd" : tickInterval}
          minTickGap={40}
        />

        <YAxis
          tickFormatter={(v) => fmtAxisPrice(v as number, currency)}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={56}
          domain={["auto", "auto"]}
        />

        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || payload.length === 0) return null;
            const p = payload[0]?.payload as PriceHistory | undefined;
            const title = fmtTooltipDate(p, intraday, showTimeInTooltip);
            const price = p?.close;

            return (
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                <p className="text-[11px] font-semibold text-slate-600">
                  {title}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {fmtTooltipPrice(Number(price ?? 0), currency)}
                </p>
              </div>
            );
          }}
        />

        <Area
          type="monotone"
          dataKey="close"
          stroke={lineColor}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: lineColor }}
          isAnimationActive={safeData.length <= 200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
