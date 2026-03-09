"use client";

import React, { useState } from "react";
import { PieChart, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { PortfolioAllocationChart } from "@/components/charts/PortfolioAllocationChart";
import type { Holding } from "@/src/types";
import type { TableColumn } from "@/src/types";
import {
  formatCurrency,
  formatInteger,
  formatPercent,
} from "@/src/utils/formatters";
import { getChangeColor, cn } from "@/src/utils/helpers";

const columns: TableColumn<Holding & Record<string, unknown>>[] = [
  {
    key: "symbol",
    label: "Symbol",
    render: (_, row) => (
      <div>
        <p className="font-semibold text-slate-800">{row.symbol}</p>
        <p className="text-xs text-slate-500 max-w-[140px] truncate">{row.name}</p>
      </div>
    ),
  },
  {
    key: "sector",
    label: "Sector",
    render: (v) => (
      <Badge variant="default" className="text-xs whitespace-nowrap">
        {v as string}
      </Badge>
    ),
  },
  {
    key: "quantity",
    label: "Qty",
    align: "right",
    sortable: true,
    render: (v) => formatInteger(v as number),
  },
  {
    key: "avgCost",
    label: "Avg Cost",
    align: "right",
    sortable: true,
    render: (v) => `฿${(v as number).toFixed(2)}`,
  },
  {
    key: "currentPrice",
    label: "Price",
    align: "right",
    sortable: true,
    render: (v) => `฿${(v as number).toFixed(2)}`,
  },
  {
    key: "marketValue",
    label: "Market Value",
    align: "right",
    sortable: true,
    render: (v) => formatCurrency(v as number),
  },
  {
    key: "unrealizedPnL",
    label: "P&L",
    align: "right",
    sortable: true,
    render: (v, row) => (
      <div className="text-right">
        <p className={`font-semibold ${getChangeColor(v as number)}`}>
          {(v as number) >= 0 ? "+" : ""}
          {formatCurrency(v as number)}
        </p>
        <p className={`text-xs ${getChangeColor(row.unrealizedPnLPercent as number)}`}>
          {formatPercent(row.unrealizedPnLPercent as number)}
        </p>
      </div>
    ),
  },
  {
    key: "weight",
    label: "Weight",
    align: "right",
    sortable: true,
    render: (v, row) => (
      <div className="flex items-center justify-end gap-2">
        <span className="text-slate-600">{(v as number).toFixed(1)}%</span>
        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${Math.min(row.weight as number, 100)}%` }}
          />
        </div>
      </div>
    ),
  },
];

export default function PortfolioPage() {
  const { holdings, summary, performance, allocation } = useAppSelector(
    (s) => s.portfolio
  );
  const [tab, setTab] = useState<"overview" | "holdings">("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "holdings", label: "Holdings" },
  ] as const;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Value"
          value={formatCurrency(summary.totalValue)}
          icon={<Layers size={16} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Cost"
          value={formatCurrency(summary.totalCost)}
          icon={<PieChart size={16} className="text-slate-500" />}
          iconBg="bg-slate-50"
        />
        <StatCard
          title="Total Return"
          value={formatCurrency(summary.totalPnL)}
          change={summary.totalPnLPercent}
          icon={
            summary.totalPnL >= 0 ? (
              <TrendingUp size={16} className="text-emerald-600" />
            ) : (
              <TrendingDown size={16} className="text-red-600" />
            )
          }
          iconBg={summary.totalPnL >= 0 ? "bg-emerald-50" : "bg-red-50"}
          valueClassName={
            summary.totalPnL >= 0 ? "text-emerald-600" : "text-red-600"
          }
        />
        <StatCard
          title="Holdings"
          value={`${holdings.length} stocks`}
          icon={<Layers size={16} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
              tab === key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Portfolio Performance (30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-2 md:px-5">
              <PerformanceChart data={performance} height={220} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sector Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-1 md:px-5">
              <PortfolioAllocationChart data={allocation} height={260} />
            </CardContent>
          </Card>

          {/* Sector Summary */}
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Sector Breakdown</CardTitle>
            </CardHeader>
            {/* Mobile card layout */}
            <CardContent className="pt-3 md:hidden space-y-3">
              {allocation.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      <span className="text-sm font-semibold text-slate-800">{item.percent.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(item.value)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
            {/* Desktop table */}
            <CardContent className="hidden md:block pt-4 px-0 pb-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Sector", "Value", "Allocation", "Weight"].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          "px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                          h !== "Sector" ? "text-right" : "text-left"
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allocation.map((item) => (
                    <tr key={item.name} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-slate-700">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-slate-600">{formatCurrency(item.value)}</td>
                      <td className="px-5 py-3 text-right text-slate-600">{item.percent.toFixed(1)}%</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Mobile holdings cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {holdings.map((h) => (
              <Card key={h.symbol}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">{h.symbol}</p>
                        <Badge variant="default" className="text-xs">{h.sector}</Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{h.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="font-semibold text-slate-800">{formatCurrency(h.marketValue)}</p>
                      <p className="text-xs text-slate-500">{h.weight.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">Qty</p>
                      <p className="font-medium text-slate-700">{formatInteger(h.quantity)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Avg Cost</p>
                      <p className="font-medium text-slate-700">฿{h.avgCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Price</p>
                      <p className="font-medium text-slate-700">฿{h.currentPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={`mt-3 pt-3 border-t border-slate-100 flex items-center justify-between`}>
                    <span className="text-xs text-slate-500">Unrealized P&L</span>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${getChangeColor(h.unrealizedPnL)}`}>
                        {h.unrealizedPnL >= 0 ? "+" : ""}{formatCurrency(h.unrealizedPnL)}
                      </p>
                      <p className={`text-xs ${getChangeColor(h.unrealizedPnLPercent)}`}>
                        {formatPercent(h.unrealizedPnLPercent)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="px-0 pb-0 pt-0">
              <DataTable
                columns={columns}
                data={holdings as (Holding & Record<string, unknown>)[]}
                emptyMessage="No holdings found"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
