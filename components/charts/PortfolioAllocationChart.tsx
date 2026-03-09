"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AllocationData } from "@/src/types";
import type { PieLabelRenderProps } from "recharts";
import { formatCurrency } from "@/src/utils/formatters";

interface Props {
  data: AllocationData[];
  height?: number;
}

const renderCustomLabel = (props: PieLabelRenderProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
  if ((percent as number) < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const ir = innerRadius as number;
  const or = outerRadius as number;
  const ma = midAngle as number;
  const radius = ir + (or - ir) * 0.5;
  const x = (cx as number) + radius * Math.cos(-ma * RADIAN);
  const y = (cy as number) + radius * Math.sin(-ma * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${((percent as number) * 100).toFixed(0)}%`}
    </text>
  );
};

export function PortfolioAllocationChart({ data, height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [
            formatCurrency(value as number),
            "",
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px" }}
          formatter={(value, entry) => {
            const item = data.find((d) => d.name === value);
            return (
              <span style={{ color: "#475569" }}>
                {value}{" "}
                <span style={{ color: "#94a3b8" }}>
                  {item ? `${item.percent.toFixed(1)}%` : ""}
                </span>
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
