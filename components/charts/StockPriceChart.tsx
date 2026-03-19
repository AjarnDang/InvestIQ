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
}: Props) {
  const safeData = useMemo(() => {
    // Recharts treats string X values as categories; if intraday has duplicates
    // (e.g., partial trading day) it can collapse into a single point.
    // We enforce uniqueness by keeping the latest candle per label.
    if (!intraday) return data;
    const seen = new Map<string, PriceHistory>();
    for (const p of data) seen.set(p.date, p);
    return Array.from(seen.values());
  }, [data, intraday]);

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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={safeData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={lineColor} stopOpacity={0.18} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

        <XAxis
          dataKey="date"
          tickFormatter={(tick) => fmtXLabel(tick, intraday)}
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
          formatter={(value) => [fmtTooltipPrice(value as number, currency), "ราคา"]}
          labelFormatter={(label) => fmtXLabel(String(label), intraday)}
          contentStyle={{
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
            boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.1)",
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
