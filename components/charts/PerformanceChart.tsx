"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PortfolioPerformance } from "@/src/types";
import { formatCurrency, formatDateShort } from "@/src/utils/formatters";

interface Props {
  data: PortfolioPerformance[];
  height?: number;
  color?: string;
}

export function PerformanceChart({ data, height = 220, color = "#6366f1" }: Props) {
  const isPositive =
    data.length >= 2 && data[data.length - 1].value >= data[0].value;
  const lineColor = isPositive ? "#10b981" : "#ef4444";
  const gradientId = `perf-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}K`}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          width={60}
          domain={["auto", "auto"]}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(value as number), "Portfolio Value"]}
          labelFormatter={(label) => formatDateShort(String(label))}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
