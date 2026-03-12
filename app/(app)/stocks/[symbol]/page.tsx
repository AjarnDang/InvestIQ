"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  StarOff,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Globe,
  Building2,
  Users,
  BarChart2,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { addItem, removeItem } from "@/src/slices/watchlistSlice";
import { cn } from "@/src/utils/helpers";
import { formatInteger, formatPercent } from "@/src/utils/formatters";
import { StockPriceChart } from "@/components/charts/StockPriceChart";
import type { StockDetail } from "@/app/api/market/detail/[symbol]/route";
import type { NewsItem, PriceHistory } from "@/src/types";
import { useTranslations } from "@/src/i18n/useTranslations";

// ── Range selector ─────────────────────────────────────────────────────────
const RANGE_OPTIONS = [
  { label: "1D", range: "1d", interval: "5m" },
  { label: "5D", range: "5d", interval: "1h" },
  { label: "1M", range: "1mo", interval: "1d" },
  { label: "6M", range: "6mo", interval: "1d" },
  { label: "YTD", range: "ytd", interval: "1d" },
  { label: "1Y", range: "1y", interval: "1d" },
  { label: "5Y", range: "5y", interval: "1wk" },
  { label: "MAX", range: "max", interval: "1mo" },
] as const;

type RangeLabel = (typeof RANGE_OPTIONS)[number]["label"];

// ── helpers ────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
function fmtBig(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}
function fmtVol(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

// ── Stat tile ──────────────────────────────────────────────────────────────
function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl px-4 py-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── QUOTE_TYPE label maps ─────────────────────────────────────────────────
const QUOTE_TYPE_LABEL_TH: Record<string, string> = {
  EQUITY: "หุ้นสามัญ",
  ETF: "กองทุน ETF",
  MUTUALFUND: "กองทุนรวม",
  INDEX: "ดัชนี",
  CURRENCY: "สกุลเงิน",
  FUTURE: "สัญญาซื้อขายล่วงหน้า",
  OPTION: "ออปชัน",
};
const QUOTE_TYPE_LABEL_EN: Record<string, string> = {
  EQUITY: "Common Stock",
  ETF: "ETF",
  MUTUALFUND: "Mutual Fund",
  INDEX: "Index",
  CURRENCY: "Currency",
  FUTURE: "Futures",
  OPTION: "Option",
};

// ── Page ───────────────────────────────────────────────────────────────────
export default function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const watchlistItems = useAppSelector((s) => s.watchlist.items);

  const [detail, setDetail] = useState<StockDetail | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState<RangeLabel>("1D");

  const { t, locale } = useTranslations();
  const QUOTE_TYPE_LABEL =
    locale === "th" ? QUOTE_TYPE_LABEL_TH : QUOTE_TYPE_LABEL_EN;

  const sym = symbol?.toUpperCase() ?? "";
  const isWatched = watchlistItems.some((w) => w.symbol === sym);
  const isIntraday = activeRange === "1D" || activeRange === "5D";

  // ── Fetch price history for the given range ────────────────────────────
  async function fetchHistory(rangeLabel: RangeLabel) {
    const opt = RANGE_OPTIONS.find((r) => r.label === rangeLabel)!;
    setHistLoading(true);
    try {
      const res = await fetch(
        `/api/market/history?symbol=${sym}&range=${opt.range}&interval=${opt.interval}`,
      );
      if (res.ok) {
        const h = await res.json();
        setHistory(h.history ?? []);
      }
    } catch {
      // non-fatal — chart shows empty
    } finally {
      setHistLoading(false);
    }
  }

  // ── Fetch stock detail (hero section) ─────────────────────────────────
  async function loadDetail() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/market/detail/${sym}`);
      if (res.ok) {
        const d = await res.json();
        setDetail(d.detail ?? null);
        setNews(d.news ?? []);
      } else {
        setError(locale === "th" ? "ไม่พบข้อมูลหุ้นนี้" : "Stock not found");
      }
    } catch {
      setError(
        locale === "th"
          ? "เกิดข้อผิดพลาดในการโหลดข้อมูล"
          : "Failed to load data",
      );
    } finally {
      setLoading(false);
    }
  }

  // Full refresh (used by the refresh button)
  function reload() {
    loadDetail();
    fetchHistory(activeRange);
  }

  // On symbol change: load detail + initial history
  useEffect(() => {
    if (sym) {
      loadDetail();
      fetchHistory(activeRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sym]);

  // On range change: only re-fetch history
  useEffect(() => {
    if (sym) fetchHistory(activeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRange]);

  function toggleWatch() {
    if (!detail) return;
    if (isWatched) {
      dispatch(removeItem(sym));
    } else {
      dispatch(
        addItem({
          symbol: sym,
          name: detail.name,
          sector: (detail.sector ??
            "Other") as import("@/src/types").StockSector,
          price: detail.price,
          change: detail.change,
          changePercent: detail.changePercent,
          alertPrice: undefined,
          alertEnabled: false,
          addedAt: new Date().toISOString(),
        }),
      );
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={14} /> {locale === "th" ? "กลับ" : t("common.back")}
        </button>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-xl bg-slate-200" />
          <div className="h-12 w-32 rounded-xl bg-slate-200" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────
  if (error || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <BarChart2 size={22} className="text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">
          {error ?? (locale === "th" ? "ไม่พบข้อมูล" : "Not found")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reload}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            <RefreshCw size={13} />{" "}
            {locale === "th" ? "ลองใหม่" : t("common.retry")}
          </button>
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {locale === "th" ? "กลับ" : t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  const positive = detail.changePercent >= 0;
  const hasPre =
    typeof detail.preMarketPrice === "number" && detail.preMarketPrice > 0;
  const hasPost =
    typeof detail.postMarketPrice === "number" && detail.postMarketPrice > 0;

  return (
    <div className="space-y-5">
      {/* ── Back nav ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={14} /> {locale === "th" ? "กลับ" : t("common.back")}
        </button>
        <span className="text-slate-300">/</span>
        <Link
          href="/market"
          className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          {t("nav.market")}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-800">{sym}</span>
      </div>

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-5 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left: name + badges */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-2xl font-black text-slate-900">
                  {sym}
                </span>
                {detail.exchange && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {detail.exchange}
                  </span>
                )}
                {detail.quoteType && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {QUOTE_TYPE_LABEL[detail.quoteType] ?? detail.quoteType}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate max-w-xs">
                {detail.name}
              </p>
              {(detail.sector || detail.industry) && (
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {detail.sector && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                      {detail.sector}
                    </span>
                  )}
                  {detail.industry && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {detail.industry}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right: price + watchlist */}
            <div className="flex flex-row sm:flex-col items-end gap-3 sm:gap-1 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-black tabular-nums text-slate-900">
                  {detail.currency === "THB" ? "฿" : "$"}
                  {fmt(detail.price)}
                </p>
                <div
                  className={cn(
                    "flex items-center justify-end gap-1 text-sm font-bold tabular-nums",
                    positive ? "text-emerald-600" : "text-red-500",
                  )}
                >
                  {positive ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {positive ? "+" : ""}
                  {fmt(detail.change)} ({positive ? "+" : ""}
                  {fmt(detail.changePercent)}%)
                </div>

                {(hasPre || hasPost) && (
                  <div className="mt-2 flex flex-col gap-1 text-[11px] text-slate-500">
                    {hasPre && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                          {locale === "th" ? "ก่อนเปิดตลาด" : "Pre"}
                        </span>
                        <span className="tabular-nums text-slate-700">
                          {detail.currency === "THB" ? "฿" : "$"}
                          {fmt(detail.preMarketPrice)}
                        </span>
                        {typeof detail.preMarketChangePercent === "number" && (
                          <span
                            className={cn(
                              "tabular-nums font-semibold",
                              detail.preMarketChangePercent >= 0
                                ? "text-emerald-600"
                                : "text-red-500",
                            )}
                          >
                            {detail.preMarketChangePercent >= 0 ? "+" : ""}
                            {fmt(detail.preMarketChangePercent)}%
                          </span>
                        )}
                      </div>
                    )}
                    {hasPost && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                          {locale === "th" ? "หลังปิดตลาด" : "Post"}
                        </span>
                        <span className="tabular-nums text-slate-700">
                          {detail.currency === "THB" ? "฿" : "$"}
                          {fmt(detail.postMarketPrice)}
                        </span>
                        {typeof detail.postMarketChangePercent === "number" && (
                          <span
                            className={cn(
                              "tabular-nums font-semibold",
                              detail.postMarketChangePercent >= 0
                                ? "text-emerald-600"
                                : "text-red-500",
                            )}
                          >
                            {detail.postMarketChangePercent >= 0 ? "+" : ""}
                            {fmt(detail.postMarketChangePercent)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={toggleWatch}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors border",
                    isWatched
                      ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200",
                  )}
                >
                  {isWatched ? <StarOff size={13} /> : <Star size={13} />}
                  {isWatched
                    ? locale === "th"
                      ? "ยกเลิกติดตาม"
                      : "Unwatch"
                    : t("watchlist.title")}
                </button>
                <button
                  onClick={reload}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                  aria-label="Refresh data"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Day range bar */}
        {detail.dayLow != null &&
          detail.dayHigh != null &&
          detail.dayLow !== detail.dayHigh && (
            <div className="px-5 md:px-6 pb-4">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="tabular-nums">{fmt(detail.dayLow)}</span>
                <div className="relative flex-1 h-1.5 rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      positive ? "bg-emerald-400" : "bg-red-400",
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, ((detail.price - detail.dayLow) / (detail.dayHigh - detail.dayLow)) * 100))}%`,
                    }}
                  />
                </div>
                <span className="tabular-nums">{fmt(detail.dayHigh)}</span>
                <span className="text-slate-400 hidden sm:block">
                  {locale === "th" ? "วันนี้" : "Today"}
                </span>
              </div>
            </div>
          )}
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* ── Left: chart + key stats ──────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-5">
          {/* Price chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Chart header: title + range buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-800">
                  {t("stocks.chart")}
                </h2>
                {histLoading && (
                  <RefreshCw
                    size={11}
                    className="animate-spin text-slate-400"
                  />
                )}
              </div>

              {/* Range filter buttons */}
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setActiveRange(opt.label)}
                    className={cn(
                      "shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                      activeRange === opt.label
                        ? "bg-indigo-600 text-white"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              {histLoading && history.length === 0 ? (
                <div
                  className="animate-pulse bg-slate-100 rounded-xl"
                  style={{ height: 220 }}
                />
              ) : history.length > 0 ? (
                <StockPriceChart
                  data={history}
                  height={220}
                  currency={detail.currency ?? "THB"}
                  intraday={isIntraday}
                />
              ) : (
                <div
                  className="flex items-center justify-center text-sm text-slate-400"
                  style={{ height: 220 }}
                >
                  {locale === "th"
                    ? "ไม่มีข้อมูลกราฟ"
                    : "No chart data available"}
                </div>
              )}
            </div>
          </div>

          {/* Key stats grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
              <BarChart2 size={14} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">
                {t("stocks.keyStats")}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
              <StatTile
                label={locale === "th" ? "มูลค่าตลาด" : "Market Cap"}
                value={fmtBig(detail.marketCap)}
              />
              <StatTile
                label={t("common.volume")}
                value={fmtVol(detail.volume)}
                sub={`${locale === "th" ? "เฉลี่ย" : "Avg"} ${fmtVol(detail.avgVolume)}`}
              />
              <StatTile
                label="P/E Ratio"
                value={detail.pe ? fmt(detail.pe) : "—"}
              />
              <StatTile
                label="EPS"
                value={detail.eps ? fmt(detail.eps) : "—"}
              />
              <StatTile
                label="52W High"
                value={detail.high52 ? fmt(detail.high52) : "—"}
              />
              <StatTile
                label="52W Low"
                value={detail.low52 ? fmt(detail.low52) : "—"}
              />
              <StatTile
                label="Beta"
                value={detail.beta ? fmt(detail.beta) : "—"}
                sub={locale === "th" ? "ความผันผวนเทียบ S&P500" : "vs S&P 500"}
              />
              <StatTile
                label={locale === "th" ? "เงินปันผล" : "Dividend"}
                value={
                  detail.dividendYield
                    ? formatPercent(detail.dividendYield * 100)
                    : "—"
                }
                sub={locale === "th" ? "อัตราเงินปันผล" : "Yield"}
              />
              <StatTile
                label={t("common.open")}
                value={detail.open ? fmt(detail.open) : "—"}
              />
              <StatTile
                label={t("market.prevClose")}
                value={detail.prevClose ? fmt(detail.prevClose) : "—"}
              />
              <StatTile
                label={t("common.high")}
                value={detail.dayHigh ? fmt(detail.dayHigh) : "—"}
              />
              <StatTile
                label={t("common.low")}
                value={detail.dayLow ? fmt(detail.dayLow) : "—"}
              />
            </div>
          </div>
        </div>

        {/* ── Right: company info ──────────────────────────────────────── */}
        <div className="space-y-5">
          {/* General info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100">
              <Building2 size={14} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800">
                {locale === "th" ? "ข้อมูลทั่วไป" : t("stocks.overview")}
              </h2>
            </div>
            <div className="divide-y divide-slate-50 text-xs">
              {[
                {
                  label: locale === "th" ? "ชื่อเต็ม" : "Full Name",
                  value: detail.name,
                },
                { label: locale === "th" ? "ตัวย่อ" : "Symbol", value: sym },
                {
                  label: locale === "th" ? "ตลาด" : "Exchange",
                  value: detail.exchange,
                },
                {
                  label: locale === "th" ? "ประเภทหลักทรัพย์" : "Type",
                  value:
                    QUOTE_TYPE_LABEL[detail.quoteType ?? ""] ??
                    detail.quoteType,
                },
                {
                  label: locale === "th" ? "สกุลเงิน" : "Currency",
                  value: detail.currency,
                },
                {
                  label: locale === "th" ? "ประเทศ" : "Country",
                  value: detail.country,
                },
                {
                  label: locale === "th" ? "อุตสาหกรรม" : "Industry",
                  value: detail.industry,
                },
                {
                  label: locale === "th" ? "กลุ่มธุรกิจ" : "Sector",
                  value: detail.sector,
                },
              ].map(({ label, value }) =>
                value ? (
                  <div
                    key={label}
                    className="flex items-start justify-between px-4 py-2.5 gap-2"
                  >
                    <span className="text-slate-500 shrink-0">{label}</span>
                    <span className="text-slate-800 font-medium text-right">
                      {value}
                    </span>
                  </div>
                ) : null,
              )}
              {detail.employees && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Users size={11} />{" "}
                    {locale === "th" ? "พนักงาน" : "Employees"}
                  </span>
                  <span className="text-slate-800 font-medium">
                    {formatInteger(detail.employees)}
                  </span>
                </div>
              )}
              {detail.website && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Globe size={11} />{" "}
                    {locale === "th" ? "เว็บไซต์" : "Website"}
                  </span>
                  <a
                    href={
                      detail.website.startsWith("http")
                        ? detail.website
                        : `https://${detail.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    {locale === "th" ? "เยี่ยมชม" : "Visit"}{" "}
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* About */}
          {detail.description && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">
                  {locale === "th" ? "เกี่ยวกับบริษัท" : "About"}
                </h2>
              </div>
              <div className="px-4 py-4">
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-8">
                  {detail.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent News */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            {locale === "th" ? "ข่าวล่าสุด" : "Recent News"}
          </h2>
          {news.length > 0 && (
            <span className="text-[10px] text-slate-400">
              {locale === "th" ? "อัปเดตจาก Yahoo Finance" : "Powered by Yahoo Finance"}
            </span>
          )}
        </div>
        {news.length === 0 ? (
          <p className="px-4 py-6 text-xs text-slate-500 text-center">
            {locale === "th"
              ? "ยังไม่มีข่าวที่เกี่ยวข้อง"
              : "No related news found"}
          </p>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {news.slice(0, 6).map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden"
              >
                {n.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.imageUrl}
                    alt=""
                    className="h-24 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {n.source}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {new Date(n.publishedAt).toLocaleString(
                        locale === "th" ? "th-TH" : "en-US",
                        { dateStyle: "medium", timeStyle: "short" },
                      )}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-3 group-hover:text-indigo-700 transition-colors">
                    {n.title}
                  </p>
                  {n.description && (
                    <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                      {n.description}
                    </p>
                  )}
                  <div className="mt-auto pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{locale === "th" ? "อ่านต่อ" : "Read more"}</span>
                    <ExternalLink
                      size={10}
                      className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                    />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
