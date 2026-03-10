"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart2,
  Newspaper,
  ExternalLink,
  LayoutDashboard,
  Flame,
  Globe,
  Activity,
  ArrowUpRight,
  User,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IndexBanner } from "@/components/ui/IndexBanner";
import {
  formatInteger,
  formatVolume,
  formatMarketCap,
  timeAgo,
} from "@/src/utils/formatters";
import { getChangeColor, getChangeBgColor, cn } from "@/src/utils/helpers";

// ── Types & constants ─────────────────────────────────────────────────────────
type MarketTab = "active" | "gainers" | "losers";

const SOURCE_CONFIG: Record<string, { bg: string; text: string }> = {
  "MarketWatch":  { bg: "bg-emerald-100", text: "text-emerald-700" },
  "CNBC":         { bg: "bg-red-100",     text: "text-red-700"     },
  "Reuters":      { bg: "bg-orange-100",  text: "text-orange-700"  },
  "Bangkok Post": { bg: "bg-blue-100",    text: "text-blue-700"    },
};
function sourceBadge(src: string) {
  const cfg = SOURCE_CONFIG[src];
  return cfg ? `${cfg.bg} ${cfg.text}` : "bg-slate-100 text-slate-600";
}

const NEWS_PREVIEW = 7;

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const {
    indices,
    globalIndices,
    stocks,
    trendingStocks,
    news,
    loading,
    loadingGlobal,
    loadingTrending,
    loadingNews,
  } = useAppSelector((s) => s.market);

  const [marketTab, setMarketTab] = useState<MarketTab>("active");

  // ── Computed market lists ─────────────────────────────────────────────────
  const mostActive = useMemo(
    () => [...stocks].sort((a, b) => b.volume * b.price - a.volume * a.price).slice(0, 10),
    [stocks]
  );
  const topGainers = useMemo(
    () => [...stocks].filter((s) => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 10),
    [stocks]
  );
  const topLosers = useMemo(
    () => [...stocks].filter((s) => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 10),
    [stocks]
  );

  const activeStocks =
    marketTab === "active"  ? mostActive  :
    marketTab === "gainers" ? topGainers  :
    topLosers;

  const previewNews = news.slice(0, NEWS_PREVIEW);

  // ── Tab style helper ──────────────────────────────────────────────────────
  function tabClass(tab: MarketTab) {
    const active = marketTab === tab;
    if (!active) return "text-slate-500 hover:bg-slate-100 hover:text-slate-700";
    if (tab === "gainers") return "bg-emerald-50 text-emerald-700 font-semibold";
    if (tab === "losers")  return "bg-red-50 text-red-600 font-semibold";
    return "bg-indigo-50 text-indigo-700 font-semibold";
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Shared Navbar (auth-aware, all menu items) ─────────────────── */}
      <Navbar />

      {/* ── Body offset by fixed navbar h-14 = 56px ────────────────────── */}
      <div className="pt-14">

        {/* ── SET Status Bar ─────────────────────────────────────────── */}
        <div className="bg-slate-900 text-white px-4 md:px-6 py-2.5">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5 flex-wrap">
              {loading && indices.length === 0 ? (
                <div className="flex gap-4 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="h-4 w-12 rounded bg-slate-700" />
                      <div className="h-4 w-16 rounded bg-slate-700" />
                      <div className="h-5 w-14 rounded bg-slate-700" />
                    </div>
                  ))}
                </div>
              ) : (
                indices.map((idx) => (
                  <div key={idx.name} className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">{idx.name}</span>
                    <span className="text-sm font-bold tabular-nums">{formatInteger(idx.value)}</span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                        idx.changePercent >= 0
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Real-time · Yahoo Finance
            </div>
          </div>
        </div>

        {/* ── Global Index Strip ─────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-200 py-2.5 px-4 md:px-6" id="markets">
          <div className="mx-auto max-w-7xl">
            <IndexBanner
              indices={[]}
              globalIndices={globalIndices}
              loading={false}
              loadingGlobal={loadingGlobal}
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

            {/* ── LEFT / CENTER (2/3) ──────────────────────────────── */}
            <div className="xl:col-span-2 space-y-5">

              {/* SET Market Overview */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={15} className="text-indigo-500" />
                    <h2 className="text-sm font-semibold text-slate-800">SET Market</h2>
                    {loading && stocks.length === 0 && (
                      <span className="text-[10px] text-slate-400 animate-pulse">กำลังโหลด...</span>
                    )}
                  </div>

                  {/* Tab toggle */}
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                    {(["active", "gainers", "losers"] as const).map((tab, idx) => (
                      <button
                        key={tab}
                        onClick={() => setMarketTab(tab)}
                        className={cn(
                          "px-3 py-1.5 transition-colors",
                          idx > 0 && "border-l border-slate-200",
                          tabClass(tab)
                        )}
                      >
                        {tab === "active"  ? "Most Active" :
                         tab === "gainers" ? "▲ Gainers"   : "▼ Losers"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skeleton */}
                {loading && stocks.length === 0 ? (
                  <div className="divide-y divide-slate-50">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center px-5 py-3 gap-3 animate-pulse">
                        <div className="h-3 w-4 rounded bg-slate-100 shrink-0" />
                        <div className="h-4 w-14 rounded bg-slate-200" />
                        <div className="flex-1 h-3 rounded bg-slate-100" />
                        <div className="h-4 w-16 rounded bg-slate-200" />
                        <div className="h-5 w-16 rounded bg-slate-100" />
                        <div className="h-3 w-14 rounded bg-slate-100 hidden md:block" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Column headers */}
                    <div className="grid grid-cols-[20px_1fr_auto_auto] md:grid-cols-[20px_1fr_80px_90px_80px_80px] gap-x-3 px-5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-50 bg-slate-50/50">
                      <span>#</span>
                      <span>Symbol</span>
                      <span className="text-right hidden md:block">Price (฿)</span>
                      <span className="text-right">%Change</span>
                      <span className="text-right hidden md:block">Volume</span>
                      <span className="text-right hidden md:block">Mkt Cap</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-50">
                      {activeStocks.map((stock, i) => (
                        <div
                          key={stock.symbol}
                          className="grid grid-cols-[20px_1fr_auto_auto] md:grid-cols-[20px_1fr_80px_90px_80px_80px] gap-x-3 px-5 py-2.5 items-center hover:bg-slate-50/60 transition-colors group"
                        >
                          <span className="text-xs text-slate-300 tabular-nums font-medium">{i + 1}</span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{stock.symbol}</p>
                              <span className="text-[10px] text-slate-400 truncate hidden sm:block max-w-[100px]">{stock.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 sm:hidden truncate">{stock.name}</p>
                          </div>

                          <span className="text-sm font-semibold text-slate-700 text-right hidden md:block tabular-nums">
                            {stock.price.toFixed(2)}
                          </span>

                          <div className="flex flex-col items-end gap-0.5">
                            <span className={cn(
                              "text-xs font-bold px-1.5 py-0.5 rounded tabular-nums",
                              stock.changePercent >= 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            )}>
                              {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                            </span>
                            <span className={cn("text-[10px] tabular-nums", getChangeColor(stock.change))}>
                              {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}
                            </span>
                          </div>

                          <span className="text-xs text-slate-500 text-right hidden md:block tabular-nums">
                            {formatVolume(stock.volume)}
                          </span>
                          <span className="text-xs text-slate-500 text-right hidden md:block tabular-nums">
                            {formatMarketCap(stock.marketCap)}
                          </span>
                        </div>
                      ))}

                      {activeStocks.length === 0 && (
                        <p className="py-10 text-center text-sm text-slate-400">No data available</p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                      <span className="text-[10px] text-slate-400">{stocks.length} หลักทรัพย์</span>
                      <Link
                        href={isAuthenticated ? "/market" : "/login"}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 transition-colors"
                      >
                        ดูทั้งหมด <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Today's Hot Stocks (US) */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm" id="hot">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-orange-500" />
                    <h2 className="text-sm font-semibold text-slate-800">Today&apos;s Hot Stocks</h2>
                    <span className="text-[10px] font-medium text-white bg-slate-400 px-2 py-0.5 rounded-full hidden sm:inline">
                      US Markets
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:block">Biggest movers · every 2 min</span>
                </div>

                <div className="flex gap-3 overflow-x-auto px-5 py-4 scrollbar-hide">
                  {loadingTrending && trendingStocks.length === 0
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 w-[140px] animate-pulse space-y-2">
                          <div className="flex justify-between">
                            <div className="h-3.5 w-10 rounded bg-slate-200" />
                            <div className="h-4 w-14 rounded bg-slate-200" />
                          </div>
                          <div className="h-3 w-16 rounded bg-slate-100" />
                          <div className="h-5 w-14 rounded bg-slate-200 mt-2" />
                          <div className="h-3 w-12 rounded bg-slate-100" />
                        </div>
                      ))
                    : trendingStocks.map((stock) => (
                        <div
                          key={stock.symbol}
                          className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white px-3.5 py-3 w-[152px] hover:shadow-md hover:border-indigo-200 transition-all"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-bold text-slate-800">{stock.symbol}</span>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                              stock.changePercent >= 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            )}>
                              {stock.changePercent >= 0 ? "▲" : "▼"}{Math.abs(stock.changePercent).toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mb-2.5">{stock.name}</p>
                          <p className="text-base font-bold text-slate-900 tabular-nums leading-none">
                            ${stock.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className={cn("text-xs font-semibold mt-1 tabular-nums", getChangeColor(stock.changePercent))}>
                            {stock.change >= 0 ? "+" : ""}${Math.abs(stock.change).toFixed(2)}
                          </p>
                        </div>
                      ))}
                </div>
              </div>

              {/* Compact promo strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { gradient: "from-indigo-600 to-violet-600", badge: "InvestIQ Pro",    title: "AI Portfolio Analysis · 30 วันฟรี",          cta: "ลองเลย →"    },
                  { gradient: "from-emerald-500 to-teal-600",  badge: "0% Commission",   title: "ซื้อขายหุ้น US ไม่มีค่าธรรมเนียม",           cta: "เปิดบัญชี →" },
                ].map((ad) => (
                  <div
                    key={ad.badge}
                    className={cn("rounded-xl bg-linear-to-r p-4 flex items-center justify-between gap-3", ad.gradient)}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-wide">{ad.badge}</span>
                      <p className="text-sm font-bold text-white mt-0.5">{ad.title}</p>
                    </div>
                    <Link
                      href="/login"
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      {ad.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT SIDEBAR (1/3) ──────────────────────────────── */}
            <div className="space-y-5">

              {/* Global Markets */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
                  <Globe size={14} className="text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-800">Global Markets</h3>
                </div>
                {globalIndices.length === 0 ? (
                  <div className="px-5 py-4 space-y-3 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-3.5 w-20 rounded bg-slate-200" />
                        <div className="flex gap-2">
                          <div className="h-3.5 w-16 rounded bg-slate-200" />
                          <div className="h-5 w-14 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {globalIndices.map((idx) => (
                      <div key={idx.name} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Activity size={11} className="text-slate-400 shrink-0" />
                          <span className="text-sm text-slate-700 font-medium">{idx.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 tabular-nums">
                            {idx.value > 1000 ? formatInteger(idx.value) : idx.value.toFixed(2)}
                          </span>
                          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded tabular-nums", getChangeBgColor(idx.changePercent))}>
                            {idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial News */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="news">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Newspaper size={14} className="text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-800">Financial News</h3>
                  </div>
                  {loadingNews && news.length === 0 && (
                    <span className="text-[10px] text-slate-400 animate-pulse">กำลังโหลด...</span>
                  )}
                </div>

                {loadingNews && news.length === 0 ? (
                  <div className="divide-y divide-slate-100">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="px-5 py-3 animate-pulse space-y-1.5">
                        <div className="h-3 w-16 rounded bg-slate-200" />
                        <div className="h-3.5 w-full rounded bg-slate-200" />
                        <div className="h-3.5 w-4/5 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {previewNews.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", sourceBadge(item.source))}>
                              {item.source}
                            </span>
                            <span className="text-[10px] text-slate-400">{timeAgo(item.publishedAt)}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-700 line-clamp-2 group-hover:text-indigo-700 transition-colors leading-relaxed">
                            {item.title}
                          </p>
                        </div>
                        <ExternalLink size={11} className="shrink-0 text-slate-300 group-hover:text-indigo-400 transition-colors mt-1" />
                      </a>
                    ))}
                  </div>
                )}

                {!loadingNews && news.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-400">ไม่สามารถโหลดข่าวได้</p>
                )}

                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30">
                  <Link
                    href={isAuthenticated ? "/news" : "/login"}
                    className="flex items-center justify-center gap-1 w-full text-xs font-medium text-indigo-600 hover:text-indigo-700 py-0.5 transition-colors"
                  >
                    ดูข่าวทั้งหมด <ArrowUpRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Auth CTA card */}
              {!isAuthenticated ? (
                <div className="rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📈</span>
                    <h3 className="font-bold text-sm">เริ่มต้นลงทุนกับ InvestIQ</h3>
                  </div>
                  <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                    ติดตามพอร์ตแบบ Real-time, ดู P&amp;L และรับ Smart Price Alerts ฟรี
                  </p>
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-white text-indigo-700 font-bold text-sm py-2.5 hover:bg-indigo-50 transition-colors"
                  >
                    สมัครใช้งานฟรี →
                  </Link>
                  <p className="text-center text-[10px] text-indigo-200 mt-2">
                    demo@investiq.com / demo1234
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 p-5 text-white shadow-sm">
                  <h3 className="font-bold text-sm mb-1">
                    สวัสดี, {user?.name?.split(" ")[0] ?? "Investor"} 👋
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    ดูพอร์ตและผลตอบแทนล่าสุดของคุณ
                  </p>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 transition-colors"
                  >
                    <LayoutDashboard size={13} />
                    View My Dashboard
                  </Link>
                </div>
              )}

              {/* Quick stats (guest only) */}
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "สมาชิก",    value: "12,000+", icon: User      },
                    { label: "Uptime",     value: "99.9%",   icon: Activity  },
                    { label: "หุ้น SET",  value: "500+",    icon: BarChart2 },
                    { label: "US Stocks", value: "7,000+",  icon: Globe     },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
                      <Icon size={14} className="text-indigo-500 mx-auto mb-1" />
                      <p className="text-base font-black text-slate-800">{value}</p>
                      <p className="text-[10px] text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
