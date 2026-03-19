 "use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2,
  Newspaper,
  ExternalLink,
  LayoutDashboard,
  Flame,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatInteger, timeAgo } from "@/src/utils/formatters";
import { getChangeColor, getChangeBgColor, cn } from "@/src/utils/helpers";
import { GLOBAL_NAME_TO_META } from "@/src/data/globalIndices";
import { getIndexNavAlias } from "@/src/data/indexAliases";
import { SET_REGION } from "@/src/data/indices";
import { LEARN_TOPICS, LEARN_TOPICS_EN, MOCK_ARTICLES, MOCK_ARTICLES_EN } from "@/src/data/landingContent";
import { getSourceBadgeClass } from "@/src/data/newsConfig";
import { useTranslations } from "@/src/i18n/useTranslations";
import { StockScreenerTable } from "@/components/market/StockScreenerTable";
import { FearGreedCard } from "@/components/market/FearGreedCard";
import { GlobalMarketsCard } from "@/components/market/GlobalMarketsCard";
import { SectorLeadersCard } from "@/components/market/SectorLeadersCard";
import { MarketHoursCard } from "@/components/market/MarketHoursCard";

const NEWS_PREVIEW = 7;

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { t, locale } = useTranslations();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const {
    indices,
    globalIndices,
    trendingStocks,
    news,
    loading,
    loadingGlobal,
    loadingTrending,
    loadingNews,
  } = useAppSelector((s) => s.market);

  const [indicesTab, setIndicesTab] = useState<
    "all" | "asia" | "us" | "europe"
  >("all");

  function goToStock(symbol: string) {
    router.push(`/stocks/${encodeURIComponent(symbol.toUpperCase())}`);
  }
  function goToIndex(name: string) {
    const alias = getIndexNavAlias(name);
    if (alias) router.push(`/stocks/${alias}`);
  }

  const previewNews = news.slice(0, NEWS_PREVIEW);

  // ── Indices table data ────────────────────────────────────────────────────
  const allIndexRows = useMemo(() => {
    const thaiRows = indices.map((idx) => {
      const meta = SET_REGION[idx.name] ?? { flag: "🇹🇭", region: "ไทย" };
      return {
        ...idx,
        flag: meta.flag,
        region: meta.region,
        group: "asia" as const,
      };
    });
    const globalRows = globalIndices.map((idx) => {
      const meta = GLOBAL_NAME_TO_META[idx.name];
      return {
        ...idx,
        flag: meta?.flag ?? "🌍",
        region: meta?.region ?? "Global",
        group: (meta?.flag === "🇺🇸" || meta?.flag === "💵"
          ? "us"
          : meta?.region === "ฝรั่งเศส" ||
              meta?.region === "สหราชอาณาจักร" ||
              meta?.region === "เยอรมนี"
            ? "europe"
            : "asia") as "us" | "europe" | "asia",
      };
    });
    return [...thaiRows, ...globalRows];
  }, [indices, globalIndices]);

  const filteredRows = useMemo(() => {
    if (indicesTab === "all") return allIndexRows;
    return allIndexRows.filter((r) => r.group === indicesTab);
  }, [allIndexRows, indicesTab]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-14">
        {/* ── SET Status Bar ─────────────────────────────────────────── */}
        {/* <div className="bg-slate-900 text-white px-4 md:px-6 py-2.5">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-5 flex-wrap">
              {loading && indices.length === 0 ? (
                <div className="flex gap-4 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="h-4 w-12 rounded bg-slate-700" />
                      <div className="h-4 w-16 rounded bg-slate-700" />
                    </div>
                  ))}
                </div>
              ) : (
                indices.map((idx) => (
                  <div key={idx.name} className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">
                      {idx.name}
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      {formatInteger(idx.value)}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                        idx.changePercent >= 0
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400",
                      )}
                    >
                      {idx.changePercent >= 0 ? "+" : ""}
                      {idx.changePercent.toFixed(2)}%
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
        </div> */}

        {/* ── Global Index Strip ─────────────────────────────────────── */}
        {/* <div className="bg-white border-b border-slate-200 py-2.5 px-4 md:px-6">
          <div className="mx-auto max-w-7xl">
            <IndexBanner indices={[]} globalIndices={globalIndices} loading={false} loadingGlobal={loadingGlobal} />
          </div>
        </div> */}

        {/* ══ 1. MINI HERO ══════════════════════════════════════════ */}
        <section>
          <div className="relative overflow-hidden bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-lg">
            {/* Decorative background circles */}
            <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/5" />
            <div className="absolute top-10 right-32 h-24 w-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 right-16 h-40 w-40 rounded-full bg-white/5" />

            <div className="relative flex flex-col mx-auto max-w-7xl md:flex-row items-center justify-between gap-6 p-6 md:p-8">
              {/* Left: text + CTA */}
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white mb-3">
                  <Sparkles size={12} />
                  {locale === "th" ? "กองทุนแนะนำประจำสัปดาห์" : t("home.heroTitle")}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-2">
                  {locale === "th"
                    ? "สรุปทุกกลยุทธ์การลงทุนเด่น"
                    : t("home.heroSubtitle")}
                </h2>
                <p className="text-sm text-indigo-100 leading-relaxed mb-5">
                  {locale === "th"
                    ? "เพื่อให้คุณไม่พลาดในทุกโอกาสการลงทุน พร้อมบทวิเคราะห์จากผู้เชี่ยวชาญ อัปเดตทุกสัปดาห์"
                    : "So you never miss an opportunity, with updated expert insights every week."}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm">
                    {locale === "th" ? "คลิกเลย" : t("home.heroCta")} <ChevronRight size={14} />
                  </button>
                  <Link
                    href={isAuthenticated ? "/news" : "/login"}
                    className="text-sm text-white/80 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    {locale === "th" ? "ดูบทความทั้งหมด" : t("home.articles")}
                  </Link>
                </div>
              </div>

              {/* Right: mini stat cards */}
              <div className="hidden md:grid grid-cols-2 gap-3 shrink-0">
                {(locale === "th"
                  ? [
                      { label: "กองทุนแนะนำ",     value: "12 กองทุน", icon: "🏆" },
                      { label: "อัปเดตล่าสุด",     value: "วันนี้",     icon: "🔄" },
                      { label: "ผลตอบแทนเฉลี่ย", value: "+8.4%",     icon: "📈" },
                      { label: "ผู้ติดตาม",       value: "12,000+",   icon: "👥" },
                    ]
                  : [
                      { label: "Featured funds",     value: "12 funds",     icon: "🏆" },
                      { label: "Last updated",       value: "Today",        icon: "🔄" },
                      { label: "Average return",     value: "+8.4%",        icon: "📈" },
                      { label: "Followers",          value: "12,000+",      icon: "👥" },
                    ]
                ).map(({ label, value, icon }) => (
                  <div
                    key={`${label}-${value}`}
                    className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-3 text-center"
                  >
                    <p className="text-lg">{icon}</p>
                    <p className="text-sm font-bold text-white">{value}</p>
                    <p className="text-[10px] text-indigo-200">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 space-y-10">
          {/* ══ 2. ข่าว (NEWS) + SIDEBAR ══════════════════════════════ */}
          <section>
            <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-3">
              {/* News — 2/3 */}
              <div className="xl:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Newspaper size={15} className="text-slate-500" />
                    <h2 className="text-base font-bold text-slate-800">
                      {t("home.news")}
                    </h2>
                    {loadingNews && news.length === 0 && (
                      <span className="text-[10px] text-slate-400 animate-pulse">
                        {locale === "th" ? "กำลังโหลด..." : t("common.loading")}
                      </span>
                    )}
                  </div>
                  <Link
                    href={isAuthenticated ? "/news" : "/login"}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                  >
                    {t("home.newsViewAll")} <ArrowUpRight size={12} />
                  </Link>
                </div>

                {/* Loading skeletons */}
                {loadingNews && news.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse space-y-2"
                      >
                        <div className="h-3 w-16 rounded bg-slate-200" />
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-4/5 rounded bg-slate-100" />
                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {previewNews.map((item, i) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col",
                          i === 0 && "sm:col-span-2",
                        )}
                      >
                        <div
                          className={cn(
                            "w-full overflow-hidden",
                            i === 0 ? "h-32" : "h-24",
                          )}
                        >
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="w-full h-full object-cover rounded-t-xl"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-t-xl">
                              <Newspaper size={18} className="text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded",
                                  getSourceBadgeClass(item.source),
                                )}
                              >
                                {item.source}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <Clock size={9} /> {timeAgo(item.publishedAt)}
                              </span>
                            </div>
                            <ExternalLink
                              size={11}
                              className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                            />
                          </div>
                          <p
                            className={cn(
                              "font-medium text-slate-800 group-hover:text-indigo-700 transition-colors leading-snug",
                              i === 0
                                ? "text-sm line-clamp-2"
                                : "text-xs line-clamp-3",
                            )}
                          >
                            {item.title}
                          </p>
                          {item.description && i === 0 && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                    {!loadingNews && news.length === 0 && (
                      <p className="sm:col-span-2 py-10 text-center text-sm text-slate-400">
                        ไม่สามารถโหลดข่าวได้
                      </p>
                    )}
                  </div>
                )}

                {/* ══ 3. ดัชนีหลัก (MAIN INDICES TABLE) ════════════════════ */}
                <section>
                  <div className="flex items-center justify-between my-4 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={15} className="text-indigo-500" />
                      <h2 className="text-base font-bold text-slate-800">
                        {t("home.mainIndices")}
                      </h2>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {allIndexRows.length} {locale === "th" ? "ดัชนี" : "indices"}
                      </span>
                    </div>
                    {/* Region filter tabs */}
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                      {([
                        { key: "all",    label: locale === "th" ? "ทั้งหมด" : "All" },
                        { key: "asia",   label: locale === "th" ? "เอเชีย" : "Asia" },
                        { key: "us",     label: locale === "th" ? "สหรัฐ" : "US" },
                        { key: "europe", label: locale === "th" ? "ยุโรป" : "Europe" },
                      ] as const).map(({ key, label }, i) => (
                        <button
                          key={key}
                          onClick={() => setIndicesTab(key)}
                          className={cn(
                            "px-3 py-1.5 transition-colors",
                            i > 0 && "border-l border-slate-200",
                            indicesTab === key
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-slate-500 hover:bg-slate-50",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[28px_1fr_100px_100px_90px] gap-x-3 px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                      <span className="hidden md:block" />
                      <span>ดัชนี</span>
                      <span className="text-right hidden md:block">ราคา</span>
                      <span className="text-right">เปลี่ยนแปลง</span>
                      <span className="text-right hidden md:block">
                        %Change
                      </span>
                    </div>

                    {(loading || loadingGlobal) && allIndexRows.length === 0 ? (
                      <div className="divide-y divide-slate-50">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-5 py-3 animate-pulse"
                          >
                            <div className="h-4 w-4 rounded bg-slate-100 shrink-0 hidden md:block" />
                            <div className="flex-1 h-4 w-24 rounded bg-slate-200" />
                            <div className="h-4 w-16 rounded bg-slate-200" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {filteredRows.map((row) => (
                          <div
                            key={row.name}
                            onClick={() => goToIndex(row.name)}
                            className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[28px_1fr_100px_100px_90px] gap-x-3 px-5 py-2.5 items-center hover:bg-slate-50/60 transition-colors cursor-pointer group"
                          >
                            {/* Flag */}
                            <span className="text-base leading-none hidden md:block">
                              {row.flag}
                            </span>

                            {/* Name + region */}
                            <div>
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {row.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {row.region}
                              </p>
                            </div>

                            {/* Price */}
                            <span className="text-sm font-bold text-slate-800 tabular-nums text-right hidden md:block">
                              {row.value > 1000
                                ? formatInteger(row.value)
                                : row.value.toFixed(2)}
                            </span>

                            {/* Change amount + icon */}
                            <div className="flex items-center justify-end gap-1">
                              {row.changePercent >= 0 ? (
                                <TrendingUp
                                  size={11}
                                  className="text-emerald-500 shrink-0"
                                />
                              ) : (
                                <TrendingDown
                                  size={11}
                                  className="text-red-500 shrink-0"
                                />
                              )}
                              <span
                                className={cn(
                                  "text-xs font-semibold tabular-nums",
                                  getChangeColor(row.change),
                                )}
                              >
                                {row.change >= 0 ? "+" : ""}
                                {row.change.toFixed(row.value < 100 ? 4 : 2)}
                              </span>
                            </div>

                            {/* %Change badge */}
                            <div className="hidden md:flex justify-end">
                              <span
                                className={cn(
                                  "text-xs font-bold px-2 py-0.5 rounded tabular-nums",
                                  getChangeBgColor(row.changePercent),
                                )}
                              >
                                {row.changePercent >= 0 ? "+" : ""}
                                {row.changePercent.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        ))}

                        {filteredRows.length === 0 && (
                          <p className="py-10 text-center text-sm text-slate-400">
                            {locale === "th" ? "ไม่มีข้อมูล" : t("common.noData")}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {locale === "th" ? "อัปเดตทุก 60 วินาที" : "Updated every 60 seconds"}
                      </span>
                      <Link
                        href={isAuthenticated ? "/market" : "/login"}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                      >
                        {locale === "th" ? "ดูตลาดทั้งหมด" : "View all markets"} <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                </section>

                {/* Hot stocks — 2/3 */}
                <div className="xl:col-span-2">
                  <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-2">
                      <Flame size={15} className="text-orange-500" />
                      <h2 className="text-base font-bold text-slate-800">
                        {t("home.hotStocks")}
                      </h2>
                      <span className="text-[10px] font-medium text-white bg-slate-400 px-2 py-0.5 rounded-full hidden sm:inline">
                        {t("home.hotStocksUS")}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 hidden sm:block">
                      {locale === "th" ? "หุ้นเคลื่อนไหวมากที่สุด · อัปเดตทุก 2 นาที" : "Biggest movers · every 2 min"}
                    </span>
                  </div>

                  <StockScreenerTable
                    title={locale === "th" ? "Today's Hot Stocks" : "Today's Hot Stocks"}
                    rows={trendingStocks.map((s, i) => ({ ...s, rank: i + 1 }))}
                    loading={loadingTrending}
                    locale={locale}
                    emptyMessage={locale === "th" ? "ไม่มีข้อมูล" : "No data"}
                    getRowId={(r) => r.symbol}
                    onRowClick={(r) => goToStock(r.symbol)}
                    columns={[
                      {
                        key: "rank",
                        label: "#",
                        align: "left",
                        sortable: false,
                        render: (r) => (
                          <span className="text-xs text-slate-300 tabular-nums">{r.rank}</span>
                        ),
                        widthClassName: "w-10",
                      },
                      {
                        key: "symbol",
                        label: "Symbol",
                        align: "left",
                        sortable: true,
                        sortValue: (r) => r.symbol,
                        render: (r) => (
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {r.symbol}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {r.name}
                            </p>
                          </div>
                        ),
                      },
                      {
                        key: "price",
                        label: locale === "th" ? "ราคา (USD)" : "Price (USD)",
                        align: "right",
                        sortable: true,
                        sortValue: (r) => r.price,
                        render: (r) => (
                          <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">
                            $
                            {r.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        ),
                      },
                      {
                        key: "change",
                        label: locale === "th" ? "เปลี่ยนแปลง" : "Change",
                        align: "right",
                        sortable: true,
                        sortValue: (r) => r.change,
                        render: (r) => (
                          <span
                            className={cn(
                              "text-xs font-semibold text-right tabular-nums",
                              getChangeColor(r.change),
                            )}
                          >
                            {r.change >= 0 ? "+" : ""}$
                            {Math.abs(r.change).toFixed(2)}
                          </span>
                        ),
                      },
                      {
                        key: "changePercent",
                        label: "%Change",
                        align: "right",
                        sortable: true,
                        sortValue: (r) => Math.abs(r.changePercent),
                        render: (r) => (
                          <div className="flex justify-end">
                            <span
                              className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded tabular-nums",
                                r.changePercent >= 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600",
                              )}
                            >
                              {r.changePercent >= 0 ? "+" : ""}
                              {r.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        ),
                      },
                    ]}
                    renderMobileRow={(r) => (
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {r.symbol}
                            </p>
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                r.changePercent >= 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-red-50 text-red-600",
                              )}
                            >
                              {r.changePercent >= 0 ? "▲" : "▼"}
                              {Math.abs(r.changePercent).toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{r.name}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-base font-bold text-slate-900 tabular-nums">
                            $
                            {r.price.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <p
                            className={cn(
                              "text-xs font-semibold mt-0.5 tabular-nums",
                              getChangeColor(r.change),
                            )}
                          >
                            {r.change >= 0 ? "+" : ""}$
                            {Math.abs(r.change).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  />
                </div>

                {/* ══ 5. LEARN ══════════════════════════════════════════════ */}
                <section>
                  <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={15} className="text-indigo-500" />
                      <h2 className="text-base font-bold text-slate-800">
                        {t("home.learn")}
                      </h2>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {locale === "th" ? "สำหรับผู้เริ่มต้น" : t("home.learnSubtitle")}
                      </span>
                    </div>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                      {locale === "th" ? "ดูหลักสูตรทั้งหมด" : t("home.learn")} <ArrowUpRight size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(locale === "th" ? LEARN_TOPICS : LEARN_TOPICS_EN).map((topic) => (
                      <button
                        key={topic.title}
                        className="group text-left bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{topic.icon}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={9} /> {topic.time}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors mb-1.5">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {topic.desc}
                        </p>
                        <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {locale === "th" ? "อ่านเพิ่มเติม" : t("common.readMore")} <ChevronRight size={12} />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* ══ 6. บทความล่าสุด ═══════════════════════════════════════ */}
                <section>
                  <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-2">
                      <Newspaper size={15} className="text-slate-500" />
                      <h2 className="text-base font-bold text-slate-800">
                        {t("home.articles")}
                      </h2>
                    </div>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                      {locale === "th" ? "ดูบทความทั้งหมด" : t("home.newsViewAll")} <ArrowUpRight size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(locale === "th" ? MOCK_ARTICLES : MOCK_ARTICLES_EN).map((article) => (
                      <div
                        key={article.id}
                        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
                      >
                        {/* Cover gradient */}
                        <div
                          className={cn(
                            "h-32 bg-linear-to-br",
                            article.gradient,
                            "flex items-end p-4",
                          )}
                        >
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded-full",
                              article.tagColor,
                            )}
                          >
                            {article.tag}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={9} /> {article.readTime}
                            </span>
                            <span>{article.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Sidebar — 1/3 */}
              <div className="space-y-5 sticky top-0">

                {/* ── Fear & Greed Index ──────────────────────────────── */}
                <FearGreedCard />

                <GlobalMarketsCard indices={globalIndices} loading={loadingGlobal} />

                <div className="space-y-4">
                  <SectorLeadersCard />
                  <MarketHoursCard />
                </div>
              </div>
            </div>
          </section>

          {/* ══ 7. CTA SECTION ════════════════════════════════════════ */}
          <section>
            <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-slate-900 to-slate-800 shadow-lg">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-indigo-500 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-violet-500 blur-3xl" />
              </div>
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-10">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {isAuthenticated
                      ? (locale === "th"
                          ? `พร้อมลงทุนแล้ว, ${user?.name?.split(" ")[0] ?? "นักลงทุน"}?`
                          : `Ready to invest, ${user?.name?.split(" ")[0] ?? "Investor"}?`)
                      : (locale === "th" ? "เริ่มลงทุนอย่างชาญฉลาด" : t("home.ctaTitle"))}
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                    {isAuthenticated
                      ? (locale === "th"
                          ? "ไปดู Portfolio และตลาดของคุณได้เลย เพื่อไม่พลาดทุกโอกาสการลงทุน"
                          : "Jump into your dashboard and portfolio so you never miss an opportunity.")
                      : (locale === "th"
                          ? "ติดตามพอร์ต Real-time, วิเคราะห์หุ้น และรับ Price Alerts ฟรีตลอดชีพ"
                          : t("home.ctaSubtitle"))}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  {isAuthenticated ? (
                    <Link
                      href="/portfolio"
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-colors"
                    >
                      <LayoutDashboard size={15} /> {locale === "th" ? "ไปที่พอร์ต" : t("auth.portfolio")}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-colors"
                      >
                        {locale === "th" ? "สมัครฟรีทันที →" : t("home.ctaButton")}
                      </Link>
                      <Link
                        href="/login"
                        className="rounded-xl border border-slate-600 hover:border-slate-400 px-6 py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        {locale === "th" ? "ล็อกอิน" : t("auth.login")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </div>
  );
}
