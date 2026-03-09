"use client";

import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  data: number[];
  positive?: boolean;
  height?: number;
}

export function MiniSparkline({ data, positive = true, height = 40 }: Props) {
  const chartData = data.map((v, i) => ({ i, v }));
  const color = positive ? "#10b981" : "#ef4444";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
        <Tooltip
          contentStyle={{ display: "none" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
