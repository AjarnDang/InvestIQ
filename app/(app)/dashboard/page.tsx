"use client";

import React from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Newspaper,
  ExternalLink,
  Globe,
  RefreshCw,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  formatCurrency,
  formatInteger,
  formatPercent,
  timeAgo,
} from "@/src/utils/formatters";
import { getChangeColor, getChangeBgColor, cn } from "@/src/utils/helpers";
import { GLOBAL_INDEX_META } from "@/src/data/globalIndices";

// Source color config for news badges
const SOURCE_CONFIG: Record<string, { bg: string; text: string }> = {
  "MarketWatch":   { bg: "bg-emerald-100",  text: "text-emerald-700"  },
  "CNBC":          { bg: "bg-red-100",       text: "text-red-700"      },
  "Reuters":       { bg: "bg-orange-100",    text: "text-orange-700"   },
  "Bangkok Post":  { bg: "bg-blue-100",      text: "text-blue-700"     },
};
function sourceBadgeClass(source: string) {
  const cfg = SOURCE_CONFIG[source];
  return cfg
    ? `${cfg.bg} ${cfg.text}`
    : "bg-slate-100 text-slate-600";
}

export default function DashboardPage() {
  const { summary, holdings } = useAppSelector((s) => s.portfolio);
  const {
    indices,
    globalIndices,
    news,
    loading: marketLoading,
    loadingGlobal,
    loadingNews,
  } = useAppSelector((s) => s.market);

  const topHoldings = [...holdings]
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 3);

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ── SET Index Banner ─────────────────────────────────────────────── */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {marketLoading && indices.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm animate-pulse space-y-1.5 min-w-[100px]">
                <div className="h-2.5 w-14 rounded bg-slate-200" />
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-2.5 w-10 rounded bg-slate-100" />
              </div>
            ))
          : indices.map((idx) => (
              <div
                key={idx.name}
                className="flex-shrink-0 flex items-center gap-2 md:gap-3 rounded-xl border border-slate-200 bg-white px-3 md:px-4 py-2 shadow-sm"
              >
                <div>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium whitespace-nowrap">{idx.name}</p>
                  <p className="text-sm md:text-base font-bold text-slate-800">{formatInteger(idx.value)}</p>
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${getChangeColor(idx.changePercent)}`}>
                  {idx.changePercent >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(idx.changePercent).toFixed(2)}%
                </div>
              </div>
            ))}
      </div>

      {/* ── US Market Indices ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe size={14} className="text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Global Markets</h2>
          {loadingGlobal && globalIndices.length > 0 && (
            <RefreshCw size={11} className="text-slate-400 animate-spin" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {loadingGlobal && globalIndices.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-3 md:p-4 space-y-2">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-5 w-24 rounded bg-slate-200" />
                    <div className="h-3 w-12 rounded bg-slate-100" />
                  </CardContent>
                </Card>
              ))
            : GLOBAL_INDEX_META.map((meta) => {
                const idx = globalIndices.find((g) => g.name === meta.displayName);
                return (
                  <Card key={meta.yahooSymbol} className="overflow-hidden">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base leading-none">{meta.flag}</span>
                        <p className="text-xs font-medium text-slate-500 truncate">{meta.displayName}</p>
                      </div>
                      {idx ? (
                        <>
                          <p className="text-base md:text-lg font-bold text-slate-900">
                            {meta.type === "forex"
                              ? idx.value.toFixed(2)
                              : formatInteger(idx.value)}
                          </p>
                          <div
                            className={cn(
                              "mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                              getChangeBgColor(idx.changePercent)
                            )}
                          >
                            {idx.changePercent >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            {formatPercent(idx.changePercent)}
                          </div>
                        </>
                      ) : (
                        <p className="text-base font-bold text-slate-300">—</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
        </div>
      </div>

      {/* ── Portfolio Summary Stats ──────────────────────────────────────── */}
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
          valueClassName={summary.totalPnL >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        <StatCard
          title="Daily P&L"
          value={formatCurrency(summary.dailyPnL)}
          change={summary.dailyPnLPercent}
          changeLabel="vs yesterday"
          icon={<Activity size={16} className="text-blue-600" />}
          iconBg="bg-blue-50"
          valueClassName={summary.dailyPnL >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        <StatCard
          title="Cash Balance"
          value={formatCurrency(summary.cashBalance)}
          icon={<Wallet size={16} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* ── Main Content: News + Top Holdings ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

        {/* News Feed — 2/3 width on desktop */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Newspaper size={15} className="text-slate-500" />
                  <CardTitle>Financial News</CardTitle>
                </div>
                {loadingNews && news.length === 0 && (
                  <span className="text-xs text-slate-400 animate-pulse">Loading...</span>
                )}
                {!loadingNews && (
                  <span className="text-xs text-slate-400">{news.length} articles</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0 pb-2">
              {/* Loading skeletons */}
              {loadingNews && news.length === 0 && (
                <div className="divide-y divide-slate-100">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-5 py-3 animate-pulse space-y-2">
                      <div className="flex gap-2">
                        <div className="h-4 w-16 rounded bg-slate-200" />
                        <div className="h-4 w-12 rounded bg-slate-100" />
                      </div>
                      <div className="h-4 w-full rounded bg-slate-200" />
                      <div className="h-3 w-3/4 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {/* News items */}
              {news.length > 0 && (
                <div className="divide-y divide-slate-100">
                  {news.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 px-4 md:px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                              sourceBadgeClass(item.source)
                            )}
                          >
                            {item.source}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {timeAgo(item.publishedAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-indigo-700 transition-colors leading-snug">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 hidden sm:block">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink
                        size={13}
                        className="flex-shrink-0 text-slate-300 group-hover:text-indigo-500 transition-colors mt-0.5"
                      />
                    </a>
                  ))}
                </div>
              )}

              {!loadingNews && news.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">
                  Unable to load news. Check your connection.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — Top Holdings quick view */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Top Holdings</CardTitle>
                <Link href="/portfolio" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-1 px-0 pb-3">
              {topHoldings.length === 0 ? (
                <div className="px-5 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between animate-pulse">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-12 rounded bg-slate-200" />
                        <div className="h-2.5 w-24 rounded bg-slate-100" />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <div className="h-3.5 w-16 rounded bg-slate-200 ml-auto" />
                        <div className="h-2.5 w-10 rounded bg-slate-100 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {topHoldings.map((h) => (
                    <div key={h.symbol} className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">{h.symbol}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[130px]">{h.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-sm font-medium text-slate-700">{formatCurrency(h.marketValue)}</p>
                        <p className={`text-xs font-semibold ${getChangeColor(h.unrealizedPnLPercent)}`}>
                          {formatPercent(h.unrealizedPnLPercent)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Market pulse summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Market Pulse</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3 space-y-2">
              {globalIndices.length === 0 ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-3 w-16 rounded bg-slate-200" />
                      <div className="h-3 w-20 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : (
                globalIndices.map((idx) => (
                  <div key={idx.name} className="flex items-center justify-between text-sm py-0.5">
                    <span className="text-slate-600 font-medium">{idx.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {idx.value > 1000
                          ? formatInteger(idx.value)
                          : idx.value.toFixed(2)}
                      </span>
                      <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded", getChangeBgColor(idx.changePercent))}>
                        {idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
