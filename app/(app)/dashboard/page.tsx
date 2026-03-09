"use client";

import React from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { PortfolioAllocationChart } from "@/components/charts/PortfolioAllocationChart";
import {
  formatCurrency,
  formatInteger,
  formatPercent,
  formatDate,
} from "@/src/utils/formatters";
import {
  getChangeColor,
  TRANSACTION_TYPE_CONFIG,
  STATUS_CONFIG,
} from "@/src/utils/helpers";

export default function DashboardPage() {
  const { summary, holdings, performance, allocation } = useAppSelector(
    (s) => s.portfolio
  );
  const { indices } = useAppSelector((s) => s.market);
  const { transactions } = useAppSelector((s) => s.transactions);

  const recentTxns = transactions.slice(0, 5);
  const topHoldings = [...holdings]
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Market Indices Banner — horizontal scroll on mobile */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {indices.map((idx) => (
          <div
            key={idx.name}
            className="flex-shrink-0 flex items-center gap-2 md:gap-3 rounded-xl border border-slate-200 bg-white px-3 md:px-4 py-2 shadow-sm"
          >
            <div>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium whitespace-nowrap">
                {idx.name}
              </p>
              <p className="text-sm md:text-base font-bold text-slate-800">
                {formatInteger(idx.value)}
              </p>
            </div>
            <div
              className={`flex items-center gap-0.5 text-xs font-semibold ${getChangeColor(idx.changePercent)}`}
            >
              {idx.changePercent >= 0 ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {Math.abs(idx.changePercent).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Portfolio"
          value={formatCurrency(summary.totalValue)}
          change={summary.dailyPnLPercent}
          changeLabel="today"
          icon={<Wallet size={16} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Return"
          value={formatCurrency(summary.totalPnL)}
          change={summary.totalPnLPercent}
          changeLabel="all time"
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
          title="Daily P&L"
          value={formatCurrency(summary.dailyPnL)}
          change={summary.dailyPnLPercent}
          changeLabel="vs yesterday"
          icon={<Activity size={16} className="text-blue-600" />}
          iconBg="bg-blue-50"
          valueClassName={
            summary.dailyPnL >= 0 ? "text-emerald-600" : "text-red-600"
          }
        />
        <StatCard
          title="Cash Balance"
          value={formatCurrency(summary.cashBalance)}
          icon={<Wallet size={16} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts Row — stack on mobile, side-by-side on large */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-2 md:px-5">
            <PerformanceChart data={performance} height={200} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-1 md:px-5">
            <PortfolioAllocationChart data={allocation} height={240} />
          </CardContent>
        </Card>
      </div>

      {/* Holdings + Transactions — stack on mobile */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Top Holdings */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Top Holdings</CardTitle>
              <a
                href="/portfolio"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all →
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-1 px-0 pb-0">
            {/* Mobile card list */}
            <div className="divide-y divide-slate-100 md:hidden">
              {topHoldings.map((h) => (
                <div key={h.symbol} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{h.symbol}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{h.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-medium text-slate-700">
                      {formatCurrency(h.marketValue)}
                    </p>
                    <p className={`text-xs font-semibold ${getChangeColor(h.unrealizedPnLPercent)}`}>
                      {formatPercent(h.unrealizedPnLPercent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="px-5 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">P&L</th>
                </tr>
              </thead>
              <tbody>
                {topHoldings.map((h) => (
                  <tr key={h.symbol} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{h.symbol}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">{h.name}</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="font-medium text-slate-700">{formatCurrency(h.marketValue)}</p>
                      <p className="text-xs text-slate-400">{h.weight.toFixed(1)}%</p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className={`font-semibold ${getChangeColor(h.unrealizedPnL)}`}>
                        {h.unrealizedPnL >= 0 ? "+" : ""}{formatCurrency(h.unrealizedPnL)}
                      </p>
                      <p className={`text-xs ${getChangeColor(h.unrealizedPnLPercent)}`}>
                        {formatPercent(h.unrealizedPnLPercent)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <a href="/transactions" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                View all →
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-1 pb-3 px-3 md:px-5">
            {recentTxns.map((txn) => {
              const cfg = TRANSACTION_TYPE_CONFIG[txn.type];
              const statusCfg = STATUS_CONFIG[txn.status];
              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-lg p-2 md:p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${cfg.color} flex-shrink-0`}>
                      {cfg.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium text-slate-700 truncate">
                        {txn.symbol ? `${txn.symbol}` : txn.type}
                      </p>
                      <p className="text-[10px] md:text-xs text-slate-400">{formatDate(txn.date)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`text-xs md:text-sm font-semibold ${cfg.sign > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {cfg.sign > 0 ? "+" : "-"}{formatCurrency(txn.amount)}
                    </p>
                    <Badge variant={txn.status === "COMPLETED" ? "success" : txn.status === "PENDING" ? "warning" : "danger"}>
                      {statusCfg.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
