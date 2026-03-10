"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  Newspaper,
  ExternalLink,
  Flame,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PromoCarousel } from "@/components/ui/PromoCarousel";
import {
  formatCurrency,
  formatInteger,
  formatPercent,
  timeAgo,
} from "@/src/utils/formatters";
import { getChangeColor, getChangeBgColor, cn } from "@/src/utils/helpers";

// Source color config for news badges
const SOURCE_CONFIG: Record<string, { bg: string; text: string }> = {
  "MarketWatch":  { bg: "bg-emerald-100", text: "text-emerald-700" },
  "CNBC":         { bg: "bg-red-100",     text: "text-red-700"     },
  "Reuters":      { bg: "bg-orange-100",  text: "text-orange-700"  },
  "Bangkok Post": { bg: "bg-blue-100",    text: "text-blue-700"    },
};
function sourceBadgeClass(source: string) {
  const cfg = SOURCE_CONFIG[source];
  return cfg ? `${cfg.bg} ${cfg.text}` : "bg-slate-100 text-slate-600";
}

const INDEX_FLAG: Record<string, string> = {
  "S&P 500":   "🇺🇸",
  "NASDAQ":    "🇺🇸",
  "Dow Jones": "🇺🇸",
  "USD/THB":   "💵",
};

const NEWS_PREVIEW_COUNT = 5;

export default function DashboardPage() {
  const { summary, holdings } = useAppSelector((s) => s.portfolio);
  const {
    globalIndices,
    trendingStocks,
    news,
    loadingNews,
    loadingTrending,
  } = useAppSelector((s) => s.market);

  const topHoldings = useMemo(
    () => [...holdings].sort((a, b) => b.marketValue - a.marketValue).slice(0, 3),
    [holdings]
  );
  const previewNews = news.slice(0, NEWS_PREVIEW_COUNT);

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ── Promo / Ads Banner ──────────────────────────────────────────── */}
      <PromoCarousel />

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
          icon={summary.totalPnL >= 0 ? <TrendingUp size={16} className="text-emerald-600" /> : <TrendingDown size={16} className="text-red-600" />}
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

      {/* ── Today's Hot Stocks ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-orange-500" />
            <h2 className="text-sm font-semibold text-slate-700">Today&apos;s Hot Stocks</h2>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              US Markets
            </span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:block">Biggest movers · updated every 2 min</span>
        </div>

        {/* Horizontal scroll strip */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {loadingTrending && trendingStocks.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 w-[140px] animate-pulse space-y-2"
                >
                  <div className="h-3 w-10 rounded bg-slate-200" />
                  <div className="h-4 w-20 rounded bg-slate-200" />
                  <div className="h-3 w-16 rounded bg-slate-100" />
                  <div className="h-5 w-14 rounded bg-slate-200" />
                </div>
              ))
            : trendingStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white px-3.5 py-3 w-[148px] shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
                >
                  {/* Symbol + sector */}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-slate-800">{stock.symbol}</span>
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                        stock.changePercent >= 0
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                      )}
                    >
                      {stock.changePercent >= 0 ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate mb-2">{stock.name}</p>

                  {/* Price */}
                  <p className="text-base font-bold text-slate-900 tabular-nums">
                    ${stock.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>

                  {/* Change amount */}
                  <p className={`text-xs font-semibold mt-0.5 tabular-nums ${getChangeColor(stock.changePercent)}`}>
                    {stock.change >= 0 ? "+" : ""}${Math.abs(stock.change).toFixed(2)}
                  </p>
                </div>
              ))}

          {!loadingTrending && trendingStocks.length === 0 && (
            <p className="text-sm text-slate-400 py-4">Unable to load trending stocks.</p>
          )}
        </div>
      </div>

      {/* ── Main Content: News + Sidebar ────────────────────────────────── */}
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
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-0 pb-0">
              {/* Loading skeletons */}
              {loadingNews && news.length === 0 && (
                <div className="divide-y divide-slate-100">
                  {Array.from({ length: NEWS_PREVIEW_COUNT }).map((_, i) => (
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

              {previewNews.length > 0 && (
                <div className="divide-y divide-slate-100">
                  {previewNews.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 px-4 md:px-5 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold", sourceBadgeClass(item.source))}>
                            {item.source}
                          </span>
                          <span className="text-[10px] text-slate-400">{timeAgo(item.publishedAt)}</span>
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
                      <ExternalLink size={13} className="shrink-0 text-slate-300 group-hover:text-indigo-500 transition-colors mt-0.5" />
                    </a>
                  ))}
                </div>
              )}

              {!loadingNews && news.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  Unable to load news. Check your connection.
                </p>
              )}

              {/* "View all" button */}
              <div className="px-4 md:px-5 py-3 border-t border-slate-100">
                <Link
                  href="/news"
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                >
                  View all
                  <ArrowUpRight size={14} className="-rotate-45 opacity-60" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top Holdings */}
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
                      <div className="text-right shrink-0 ml-3">
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

          {/* Market Pulse */}
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
                    <span className="text-slate-600 font-medium">
                      {INDEX_FLAG[idx.name] ?? "🌍"} {idx.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {idx.value > 1000 ? formatInteger(idx.value) : idx.value.toFixed(2)}
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
