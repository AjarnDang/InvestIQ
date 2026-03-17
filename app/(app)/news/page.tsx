"use client";

import React, { useMemo, useState } from "react";
import {
  Newspaper,
  RefreshCw,
  Filter,
  BarChart2,
  Activity,
  Globe2,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import {
  fetchMarketNews,
  fetchGlobalMarket,
  fetchTrendingStocks,
} from "@/src/slices/marketSlice";
import { formatInteger } from "@/src/utils/formatters";
import { cn } from "@/src/utils/helpers";
import { getSourceAccentClass } from "@/src/data/newsConfig";
import { useTranslations } from "@/src/i18n/useTranslations";
import { NewsCard } from "@/components/ui/NewsCard";
import { useRouter } from "next/navigation";
import { getChangeBgColor, getChangeColor } from "@/src/utils/helpers";
import type { MarketIndex, TrendingStock } from "@/src/types";

const ALL_SOURCES = ["All", "MarketWatch", "CNBC", "Reuters", "Bangkok Post"];

export default function NewsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t, locale } = useTranslations();
  const {
    news,
    loadingNews,
    indices,
    globalIndices,
    loading,
    loadingGlobal,
    trendingStocks,
    loadingTrending,
  } = useAppSelector((s) => s.market);
  const [activeSource, setActiveSource] = useState("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  const filtered = useMemo(
    () =>
      activeSource === "All"
        ? news
        : news.filter((n) => n.source === activeSource),
    [news, activeSource],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pagedNews = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE,
  );

  if (page !== pageSafe) {
    // keep state in sync if filtered size shrinks
    setPage(pageSafe);
  }

  React.useEffect(() => {
    if (!indices.length || !globalIndices.length) {
      dispatch(fetchGlobalMarket());
    }
    if (!trendingStocks.length) {
      dispatch(fetchTrendingStocks());
    }
  }, [dispatch, indices.length, globalIndices.length, trendingStocks.length]);

  React.useEffect(() => {
    setPage(1);
  }, [activeSource]);

  const allIndexRows = useMemo(() => {
    const local: MarketIndex[] = indices;
    const global: MarketIndex[] = globalIndices;
    return [...local, ...global];
  }, [indices, globalIndices]);

  const hotStocks: TrendingStock[] = trendingStocks.slice(0, 6);

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {t("news.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {locale === "th"
              ? "ข่าวการเงินล่าสุดจากตลาดทั่วโลก"
              : "Latest financial news from global markets"}
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchMarketNews())}
          disabled={loadingNews}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loadingNews ? "animate-spin" : ""} />
          {locale === "th" ? "รีเฟรช" : "Refresh"}
        </button>
      </div>

      {/* ── Layout: Left (news) 2/3, Right (sidebar) 1/3 ────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: News list + pagination */}
        <div className="space-y-4 xl:col-span-2">
          {/* Source Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <Filter size={13} className="text-slate-400 shrink-0" />
            {ALL_SOURCES.map((src) => (
              <button
                key={src}
                onClick={() => setActiveSource(src)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeSource === src
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {src}
                {src !== "All" && (
                  <span className="ml-1.5 opacity-60">
                    {news.filter((n) => n.source === src).length}
                  </span>
                )}
              </button>
            ))}
            <span className="ml-auto shrink-0 text-xs text-slate-400">
              {filtered.length} {locale === "th" ? "บทความ" : "articles"}
            </span>
          </div>

          {/* Loading skeletons */}
          {loadingNews && news.length === 0 && (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-3 animate-pulse space-y-2"
                >
                  <div className="flex gap-2">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="h-4 w-16 rounded bg-slate-100" />
                  </div>
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-3 w-5/6 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* News list (compact rows) */}
          {!loadingNews && filtered.length > 0 && (
            <>
              {pagedNews.map((item) => {
                const accentBorder = getSourceAccentClass(item.source);
                return (
                  <NewsCard
                    key={item.id}
                    item={item}
                    locale={locale}
                    variant="compact"
                    className={cn(
                      "border-0 rounded-none py-2",
                      accentBorder,
                    )}
                  />
                );
              })}
            </>
          )}

          {/* Pagination */}
          {!loadingNews && filtered.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {locale === "th"
                  ? `หน้า ${pageSafe} จาก ${totalPages}`
                  : `Page ${pageSafe} of ${totalPages}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe <= 1}
                  className={cn(
                    "px-3 py-1 rounded-lg border text-xs font-medium",
                    pageSafe <= 1
                      ? "border-slate-200 text-slate-300 cursor-not-allowed"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {locale === "th" ? "ก่อนหน้า" : "Prev"}
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageSafe >= totalPages}
                  className={cn(
                    "px-3 py-1 rounded-lg border text-xs font-medium",
                    pageSafe >= totalPages
                      ? "border-slate-200 text-slate-300 cursor-not-allowed"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {locale === "th" ? "ถัดไป" : "Next"}
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loadingNews && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Newspaper size={22} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 text-center">
                {news.length === 0
                  ? locale === "th"
                    ? "ไม่สามารถโหลดข่าวได้ กรุณาตรวจสอบการเชื่อมต่อ"
                    : "Could not load news. Please check your connection."
                  : locale === "th"
                    ? `ไม่มีบทความจาก ${activeSource}`
                    : `No articles from ${activeSource}`}
              </p>
            </div>
          )}
        </div>

        {/* Right: indices + hot stocks (sidebar) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100">
              <Globe2 size={14} className="text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">
                {t("home.globalMarkets")}
              </h3>
            </div>
            {globalIndices.length === 0 ? (
              <div className="px-4 py-4 space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3.5 w-20 rounded bg-slate-200" />
                    <div className="flex gap-2">
                      <div className="h-3.5 w-14 rounded bg-slate-200" />
                      <div className="h-5 w-14 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {globalIndices.map((idx) => (
                  <div
                    key={idx.name}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Activity size={10} className="text-slate-400" />
                      <span className="text-xs text-slate-700 font-medium">
                        {idx.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 tabular-nums">
                        {idx.value > 1000
                          ? formatInteger(idx.value)
                          : idx.value.toFixed(2)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums",
                          getChangeBgColor(idx.changePercent),
                        )}
                      >
                        {idx.changePercent >= 0 ? "+" : ""}
                        {idx.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hot stocks (trending) */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-800">
                  {locale === "th" ? "หุ้นเด่นวันนี้" : "Today's Hot Stocks"}
                </h2>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
              {loadingTrending && hotStocks.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 animate-pulse"
                  >
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-3 w-12 rounded bg-slate-100" />
                  </div>
                ))
              ) : hotStocks.length > 0 ? (
                hotStocks.map((s) => (
                  <div
                    key={s.symbol}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() =>
                      router.push(`/stocks/${encodeURIComponent(s.symbol)}`)
                    }
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {s.symbol}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[120px] hidden md:inline">
                          {s.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {s.price.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          getChangeColor(s.changePercent),
                        )}
                      >
                        {s.changePercent >= 0 ? "+" : ""}
                        {s.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-xs text-slate-500 text-center">
                  {locale === "th"
                    ? "ไม่มีข้อมูลหุ้นเด่น"
                    : "No hot stocks data"}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
