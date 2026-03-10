"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart2,
  Newspaper,
  ExternalLink,
  LayoutDashboard,
  Flame,
  Activity,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Clock,
  ChevronRight,
  Sparkles,
  Globe2,
  Gauge,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IndexBanner } from "@/components/ui/IndexBanner";
import { formatInteger, timeAgo } from "@/src/utils/formatters";
import { getChangeColor, getChangeBgColor, cn } from "@/src/utils/helpers";
import { GLOBAL_NAME_TO_META } from "@/src/data/globalIndices";

// ── Constants ─────────────────────────────────────────────────────────────────
const SOURCE_CONFIG: Record<string, { bg: string; text: string }> = {
  MarketWatch: { bg: "bg-emerald-100", text: "text-emerald-700" },
  CNBC: { bg: "bg-red-100", text: "text-red-700" },
  Reuters: { bg: "bg-orange-100", text: "text-orange-700" },
  "Bangkok Post": { bg: "bg-blue-100", text: "text-blue-700" },
};
function sourceBadge(src: string) {
  const cfg = SOURCE_CONFIG[src];
  return cfg ? `${cfg.bg} ${cfg.text}` : "bg-slate-100 text-slate-600";
}

// Thai SET region metadata
const SET_REGION: Record<string, { flag: string; region: string }> = {
  "SET Index": { flag: "🇹🇭", region: "ไทย" },
  SET50: { flag: "🇹🇭", region: "ไทย" },
  SET100: { flag: "🇹🇭", region: "ไทย" },
  MAI: { flag: "🇹🇭", region: "ไทย" },
};

// Learn topics (static)
const LEARN_TOPICS = [
  {
    icon: "📖",
    title: "หุ้นคืออะไร?",
    desc: "เรียนรู้พื้นฐานการลงทุนในตลาดหุ้น ตั้งแต่การซื้อขายไปจนถึงการเลือกหุ้นที่ดี",
    time: "5 นาที",
  },
  {
    icon: "📊",
    title: "อ่านงบการเงินอย่างง่าย",
    desc: "เข้าใจงบกำไรขาดทุน งบดุล และกระแสเงินสด ในแบบที่ทุกคนเข้าใจได้",
    time: "10 นาที",
  },
  {
    icon: "🔍",
    title: "Technical Analysis",
    desc: "เรียนรู้การวิเคราะห์กราฟ แนวรับ-แนวต้าน และ Indicators ยอดนิยม",
    time: "15 นาที",
  },
  {
    icon: "🏦",
    title: "กองทุนรวมคืออะไร?",
    desc: "เปรียบเทียบประเภทกองทุน LTF, RMF, SSF พร้อมแนวทางการเลือกลงทุน",
    time: "7 นาที",
  },
  {
    icon: "⚖️",
    title: "บริหารความเสี่ยง",
    desc: "Portfolio Diversification, Stop Loss และ Position Sizing เพื่อจำกัดความเสียหาย",
    time: "8 นาที",
  },
  {
    icon: "🌍",
    title: "ลงทุนต่างประเทศ",
    desc: "วิธีเข้าถึงหุ้นสหรัฐ ETF Global และ DR ผ่านโบรกเกอร์ไทยอย่างง่ายดาย",
    time: "12 นาที",
  },
];

// Mock articles (latest blog posts style)
const MOCK_ARTICLES = [
  {
    id: "a1",
    tag: "วิเคราะห์หุ้น",
    tagColor: "bg-indigo-100 text-indigo-700",
    title: "10 หุ้น SET ที่น่าจับตาในไตรมาส 2 ปี 2026",
    excerpt:
      "สรุปหุ้นที่มีปัจจัยพื้นฐานแข็งแกร่ง กำไรเติบโต และ Valuation น่าสนใจ",
    readTime: "8 นาที",
    date: "9 มี.ค. 2026",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "a2",
    tag: "กองทุน",
    tagColor: "bg-emerald-100 text-emerald-700",
    title: "เปรียบเทียบกองทุน SSF vs RMF ปี 2026 เลือกแบบไหนดี?",
    excerpt:
      "ลดหย่อนภาษีได้สูงสุด พร้อม Flow การลงทุนที่เหมาะสมกับแต่ละช่วงวัย",
    readTime: "6 นาที",
    date: "7 มี.ค. 2026",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "a3",
    tag: "US Market",
    tagColor: "bg-red-100 text-red-700",
    title: "Fed Rate Decision: ผลกระทบต่อตลาดหุ้นไทยและสหรัฐ",
    excerpt: "วิเคราะห์ทิศทางดอกเบี้ย Fed และผลต่อการลงทุนในหุ้นและพันธบัตร",
    readTime: "10 นาที",
    date: "5 มี.ค. 2026",
    gradient: "from-orange-500 to-red-500",
  },
];

const NEWS_PREVIEW = 8;

// ── Fear & Greed Gauge ────────────────────────────────────────────────────
type TrendingStockItem = { changePercent: number };

const FG_ZONES = [
  { max: 25,  label: "Extreme Fear", color: "#ef4444", bg: "bg-red-50",    text: "text-red-500"     },
  { max: 45,  label: "Fear",         color: "#f97316", bg: "bg-orange-50", text: "text-orange-500"  },
  { max: 55,  label: "Neutral",      color: "#eab308", bg: "bg-yellow-50", text: "text-yellow-600"  },
  { max: 75,  label: "Greed",        color: "#22c55e", bg: "bg-emerald-50",text: "text-emerald-600" },
  { max: 100, label: "Extreme Greed",color: "#16a34a", bg: "bg-green-50",  text: "text-green-700"   },
] as const;

function getFGZone(value: number) {
  return FG_ZONES.find((z) => value <= z.max) ?? FG_ZONES[FG_ZONES.length - 1];
}

function FearGreedCard({ trendingStocks }: { trendingStocks: TrendingStockItem[] }) {
  const value = useMemo(() => {
    if (trendingStocks.length === 0) return 42;
    const gainers = trendingStocks.filter((s) => s.changePercent > 0).length;
    const ratio   = gainers / trendingStocks.length;
    // weight by average magnitude for more sensitivity
    const avgMagnitude = trendingStocks.reduce((sum, s) => sum + Math.abs(s.changePercent), 0) / trendingStocks.length;
    const momentumBoost = Math.min((avgMagnitude / 5) * 10, 20); // max ±20 pts
    const raw = ratio * 100 + (ratio > 0.5 ? momentumBoost : -momentumBoost);
    return Math.max(5, Math.min(95, Math.round(raw)));
  }, [trendingStocks]);

  const zone = getFGZone(value);
  // needle rotation: value 0→-90°, value 100→+90°
  const rotation = (value / 100) * 180 - 90;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100">
        <Gauge size={14} className="text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-800">Fear &amp; Greed Index</h3>
        <span className="ml-auto text-[10px] text-slate-400">US Market</span>
      </div>

      <div className="px-4 py-4">
        {/* Semicircle gauge */}
        <div className="relative mx-auto w-40 h-20 overflow-hidden mb-3">
          {/* Rainbow arc (conic-gradient half circle) */}
          <div className="absolute inset-0 rounded-t-full"
            style={{ background: "conic-gradient(from 270deg at 50% 100%, #ef4444 0deg, #f97316 36deg, #eab308 72deg, #22c55e 108deg, #16a34a 144deg, #16a34a 180deg, transparent 180deg)" }}
          />
          {/* White inner cutout */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full bg-white"
            style={{ width: "68%", height: "68%" }}
          />
          {/* Needle */}
          <div
            className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-700"
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)`, width: "2px", height: "50%", background: "#1e293b", borderRadius: "2px 2px 0 0" }}
          />
          {/* Center dot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-3 w-3 rounded-full bg-slate-800 border-2 border-white z-10" />
        </div>

        {/* Value + label */}
        <div className="text-center mb-3">
          <span className={cn("text-3xl font-black tabular-nums", zone.text)}>
            {value}
          </span>
          <p className={cn("text-xs font-bold mt-0.5", zone.text)}>{zone.label}</p>
        </div>

        {/* Gradient bar */}
        <div className="relative h-2.5 rounded-full overflow-hidden"
          style={{ background: "linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #16a34a)" }}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md transition-all duration-700"
            style={{ left: `calc(${value}% - 8px)`, background: zone.color }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
          <span>Fear</span>
          <span>Neutral</span>
          <span>Greed</span>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
          คำนวณจาก US Trending Stocks · อัปเดตทุก 2 นาที
        </p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
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
        <div className="bg-slate-900 text-white px-4 md:px-6 py-2.5">
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
        </div>

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
                  กองทุนแนะนำประจำสัปดาห์
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-2">
                  สรุปทุกกลยุทธ์การลงทุนเด่น
                </h2>
                <p className="text-sm text-indigo-100 leading-relaxed mb-5">
                  เพื่อให้คุณไม่พลาดในทุกโอกาสการลงทุน
                  พร้อมบทวิเคราะห์จากผู้เชี่ยวชาญ อัปเดตทุกสัปดาห์
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm">
                    คลิกเลย <ChevronRight size={14} />
                  </button>
                  <Link
                    href={isAuthenticated ? "/news" : "/login"}
                    className="text-sm text-white/80 hover:text-white underline underline-offset-2 transition-colors"
                  >
                    ดูบทความทั้งหมด
                  </Link>
                </div>
              </div>

              {/* Right: mini stat cards */}
              <div className="hidden md:grid grid-cols-2 gap-3 shrink-0">
                {[
                  { label: "กองทุนแนะนำ", value: "12 กองทุน", icon: "🏆" },
                  { label: "อัปเดตล่าสุด", value: "วันนี้", icon: "🔄" },
                  { label: "ผลตอบแทนเฉลี่ย", value: "+8.4%", icon: "📈" },
                  { label: "ผู้ติดตาม", value: "12,000+", icon: "👥" },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
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
                      ข่าวการเงินล่าสุด
                    </h2>
                    {loadingNews && news.length === 0 && (
                      <span className="text-[10px] text-slate-400 animate-pulse">
                        กำลังโหลด...
                      </span>
                    )}
                  </div>
                  <Link
                    href={isAuthenticated ? "/news" : "/login"}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                  >
                    ดูทั้งหมด <ArrowUpRight size={12} />
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
                          "group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col gap-2",
                          i === 0 && "sm:col-span-2",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-2 py-0.5 rounded",
                                sourceBadge(item.source),
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
                        ดัชนีหลัก
                      </h2>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {allIndexRows.length} ดัชนี
                      </span>
                    </div>
                    {/* Region filter tabs */}
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                      {(
                        [
                          { key: "all", label: "ทั้งหมด" },
                          { key: "asia", label: "เอเชีย" },
                          { key: "us", label: "สหรัฐ" },
                          { key: "europe", label: "ยุโรป" },
                        ] as const
                      ).map(({ key, label }, i) => (
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
                            className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[28px_1fr_100px_100px_90px] gap-x-3 px-5 py-2.5 items-center hover:bg-slate-50/60 transition-colors"
                          >
                            {/* Flag */}
                            <span className="text-base leading-none hidden md:block">
                              {row.flag}
                            </span>

                            {/* Name + region */}
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
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
                            ไม่มีข้อมูล
                          </p>
                        )}
                      </div>
                    )}

                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        อัปเดตทุก 60 วินาที
                      </span>
                      <Link
                        href={isAuthenticated ? "/market" : "/login"}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
                      >
                        ดูตลาดทั้งหมด <ArrowUpRight size={12} />
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
                        Today&apos;s Hot Stocks
                      </h2>
                      <span className="text-[10px] font-medium text-white bg-slate-400 px-2 py-0.5 rounded-full hidden sm:inline">
                        US Markets
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 hidden sm:block">
                      Biggest movers · every 2 min
                    </span>
                  </div>

                  {/* Desktop: table layout */}
                  <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-[20px_1fr_90px_90px_90px] gap-x-3 px-5 py-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                      <span>#</span>
                      <span>Symbol</span>
                      <span className="text-right">Price (USD)</span>
                      <span className="text-right">Change</span>
                      <span className="text-right">%Change</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {loadingTrending && trendingStocks.length === 0
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 px-5 py-3 animate-pulse"
                            >
                              <div className="h-3 w-4 rounded bg-slate-100 shrink-0" />
                              <div className="flex-1 space-y-1">
                                <div className="h-3.5 w-14 rounded bg-slate-200" />
                                <div className="h-3 w-20 rounded bg-slate-100" />
                              </div>
                              <div className="h-4 w-16 rounded bg-slate-200" />
                              <div className="h-4 w-16 rounded bg-slate-100" />
                              <div className="h-5 w-16 rounded bg-slate-200" />
                            </div>
                          ))
                        : trendingStocks.map((stock, i) => (
                            <div
                              key={stock.symbol}
                              className="grid grid-cols-[20px_1fr_90px_90px_90px] gap-x-3 px-5 py-2.5 items-center hover:bg-slate-50/60 transition-colors group"
                            >
                              <span className="text-xs text-slate-300 tabular-nums">
                                {i + 1}
                              </span>
                              <div>
                                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                  {stock.symbol}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                  {stock.name}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-slate-700 text-right tabular-nums">
                                $
                                {stock.price.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-semibold text-right tabular-nums",
                                  getChangeColor(stock.change),
                                )}
                              >
                                {stock.change >= 0 ? "+" : ""}$
                                {Math.abs(stock.change).toFixed(2)}
                              </span>
                              <div className="flex justify-end">
                                <span
                                  className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded tabular-nums",
                                    stock.changePercent >= 0
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-red-50 text-red-600",
                                  )}
                                >
                                  {stock.changePercent >= 0 ? "+" : ""}
                                  {stock.changePercent.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          ))}
                    </div>
                  </div>

                  {/* Mobile: horizontal scroll cards */}
                  <div className="sm:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {loadingTrending && trendingStocks.length === 0
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-3 w-[140px] animate-pulse space-y-2"
                          >
                            <div className="h-3.5 w-10 rounded bg-slate-200" />
                            <div className="h-3 w-16 rounded bg-slate-100" />
                            <div className="h-5 w-14 rounded bg-slate-200 mt-1" />
                            <div className="h-3 w-12 rounded bg-slate-100" />
                          </div>
                        ))
                      : trendingStocks.map((stock) => (
                          <div
                            key={stock.symbol}
                            className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white px-3.5 py-3 w-[148px]"
                          >
                            <div className="flex justify-between mb-0.5">
                              <span className="text-sm font-bold text-slate-800">
                                {stock.symbol}
                              </span>
                              <span
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                  stock.changePercent >= 0
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600",
                                )}
                              >
                                {stock.changePercent >= 0 ? "▲" : "▼"}
                                {Math.abs(stock.changePercent).toFixed(2)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mb-2">
                              {stock.name}
                            </p>
                            <p className="text-base font-bold text-slate-900 tabular-nums">
                              $
                              {stock.price.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                            <p
                              className={cn(
                                "text-xs font-semibold mt-0.5 tabular-nums",
                                getChangeColor(stock.changePercent),
                              )}
                            >
                              {stock.change >= 0 ? "+" : ""}$
                              {Math.abs(stock.change).toFixed(2)}
                            </p>
                          </div>
                        ))}
                  </div>
                </div>

                {/* ══ 5. LEARN ══════════════════════════════════════════════ */}
                <section>
                  <div className="flex items-center justify-between my-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={15} className="text-indigo-500" />
                      <h2 className="text-base font-bold text-slate-800">
                        เรียนรู้การลงทุน
                      </h2>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        สำหรับผู้เริ่มต้น
                      </span>
                    </div>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                      ดูหลักสูตรทั้งหมด <ArrowUpRight size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {LEARN_TOPICS.map((topic) => (
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
                          อ่านเพิ่มเติม <ChevronRight size={12} />
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
                        บทความล่าสุด
                      </h2>
                    </div>
                    <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                      ดูบทความทั้งหมด <ArrowUpRight size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MOCK_ARTICLES.map((article) => (
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
                <FearGreedCard trendingStocks={trendingStocks} />

                {/* Global Markets */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100">
                    <Globe2 size={14} className="text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      Global Markets
                    </h3>
                  </div>
                  {globalIndices.length === 0 ? (
                    <div className="px-4 py-4 space-y-3 animate-pulse">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center"
                        >
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

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                      Sector Leaders
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { sector: "Technology", pct: "+2.8%", positive: true },
                        { sector: "Energy", pct: "+1.4%", positive: true },
                        { sector: "Healthcare", pct: "+0.9%", positive: true },
                        {
                          sector: "Real Estate",
                          pct: "-0.6%",
                          positive: false,
                        },
                        { sector: "Utilities", pct: "-1.1%", positive: false },
                      ].map(({ sector, pct, positive }) => (
                        <div
                          key={sector}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-slate-600">
                            {sector}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-bold tabular-nums",
                              positive ? "text-emerald-600" : "text-red-500",
                            )}
                          >
                            {pct}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">
                      Market Hours (ET)
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      New York Stock Exchange
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pre-Market</span>
                        <span className="text-slate-700 font-medium">
                          04:00 – 09:30
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Regular</span>
                        <span className="text-emerald-600 font-bold">
                          09:30 – 16:00
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">After Hours</span>
                        <span className="text-slate-700 font-medium">
                          16:00 – 20:00
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1">
                        UTC+7: +11 ชั่วโมง (ฤดูหนาว)
                      </p>
                    </div>
                  </div>
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
                      ? `พร้อมลงทุนแล้ว, ${user?.name?.split(" ")[0] ?? "Investor"}?`
                      : "เริ่มลงทุนอย่างชาญฉลาด"}
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                    {isAuthenticated
                      ? "ไปดู Portfolio และตลาดของคุณได้เลย เพื่อไม่พลาดทุกโอกาสการลงทุน"
                      : "ติดตามพอร์ต Real-time, วิเคราะห์หุ้น และรับ Price Alerts ฟรีตลอดชีพ"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-colors"
                    >
                      <LayoutDashboard size={15} /> ไปที่ Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-colors"
                      >
                        สมัครฟรีทันที →
                      </Link>
                      <Link
                        href="/login"
                        className="rounded-xl border border-slate-600 hover:border-slate-400 px-6 py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        ล็อกอิน
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
