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
  Target,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { addItem, removeItem } from "@/src/slices/watchlistSlice";
import { cn } from "@/src/utils/helpers";
import { formatInteger, formatPercent } from "@/src/utils/formatters";
import { StockPriceChart } from "@/components/charts/StockPriceChart";
import type { StockDetail } from "@/app/api/market/detail/[symbol]/route";
import type { NewsItem, PriceHistory, Holding, AssetKey } from "@/src/types";
import { useTranslations } from "@/src/i18n/useTranslations";
import { NewsCard } from "@/components/ui/NewsCard";
import { Modal } from "@/components/ui/Modal";
import {
  fetchStockDetail,
  fetchStockHistory,
  fetchStockAnalysis,
} from "@/src/slices/marketSlice";
import type { StockAnalysis } from "@/src/types";
import {
  calculatePositionCostMetrics,
  type PositionCostMetrics,
} from "@/src/functions/portfolioFunctions";
import { SYMBOL_TO_META } from "@/src/data/sectorMap";
import { formatCurrency } from "@/src/utils/formatters";
import { addTransaction } from "@/src/slices/transactionSlice";
import {
  buyStock,
  sellStock,
  fetchFxUsdThb,
} from "@/src/slices/portfolioSlice";
import { generateId } from "@/src/utils/helpers";

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

function getAssetKeyForSymbol(symbol: string): AssetKey {
  const meta = SYMBOL_TO_META[symbol];
  if (meta?.type === "ETF") return "etf";
  if (meta?.type === "CRYPTO") return "crypto";
  if (meta?.sector === "Commodity") return "gold";
  const exch = (meta?.exchange ?? "").toUpperCase();
  if (exch === "SET") return "th";
  return "us";
}

function getAssetBadgeLabel(key: AssetKey, locale: "th" | "en") {
  if (locale === "th") {
    if (key === "us") return "อยู่ในพอร์ตหุ้นสหรัฐฯ";
    if (key === "th") return "อยู่ในพอร์ตหุ้นไทย";
    if (key === "etf") return "อยู่ในพอร์ต ETF";
    if (key === "crypto") return "อยู่ในพอร์ตคริปโต";
    if (key === "gold") return "อยู่ในพอร์ตทองคำ";
  } else {
    if (key === "us") return "In US stocks portfolio";
    if (key === "th") return "In Thai stocks portfolio";
    if (key === "etf") return "In ETF portfolio";
    if (key === "crypto") return "In Crypto portfolio";
    if (key === "gold") return "In Gold portfolio";
  }
  return "";
}

function getAssetBadgeClass(key: AssetKey) {
  switch (key) {
    case "us":
      return "bg-indigo-50 text-indigo-700 border border-indigo-100";
    case "th":
      return "bg-sky-50 text-sky-700 border border-sky-100";
    case "etf":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "crypto":
      return "bg-orange-50 text-orange-700 border border-orange-100";
    case "gold":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    default:
      return "bg-slate-50 text-slate-600 border border-slate-200";
  }
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

// ── Analyst Rating helpers ─────────────────────────────────────────────────
type RatingKey =
  | "strongBuy"
  | "buy"
  | "hold"
  | "sell"
  | "strongSell"
  | "unknown";

const RATING_CONFIG: Record<
  RatingKey,
  {
    label: string;
    labelTh: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
  }
> = {
  strongBuy: {
    label: "Strong Buy",
    labelTh: "แนะนำซื้ออย่างยิ่ง",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: <ThumbsUp className="w-4 h-4" />,
  },
  buy: {
    label: "Buy",
    labelTh: "แนะนำซื้อ",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  hold: {
    label: "Hold",
    labelTh: "ถือ",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <Minus className="w-4 h-4" />,
  },
  sell: {
    label: "Sell",
    labelTh: "แนะนำขาย",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: <TrendingDown className="w-4 h-4" />,
  },
  strongSell: {
    label: "Strong Sell",
    labelTh: "แนะนำขายอย่างยิ่ง",
    color: "text-red-700",
    bg: "bg-red-100 border-red-300",
    icon: <ThumbsDown className="w-4 h-4" />,
  },
  unknown: {
    label: "N/A",
    labelTh: "ไม่มีข้อมูล",
    color: "text-slate-500",
    bg: "bg-slate-50 border-slate-200",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
};

function normalizeRatingKey(key: string | null): RatingKey {
  if (!key) return "unknown";
  const k = key.toLowerCase().replace(/[\s_-]/g, "");
  if (k === "strongbuy" || k === "strongbuy") return "strongBuy";
  if (k === "buy") return "buy";
  if (k === "hold" || k === "neutral") return "hold";
  if (k === "sell") return "sell";
  if (k === "strongsell") return "strongSell";
  return "unknown";
}

function ratingMeanToKey(mean: number | null): RatingKey {
  if (mean == null) return "unknown";
  if (mean <= 1.5) return "strongBuy";
  if (mean <= 2.5) return "buy";
  if (mean <= 3.5) return "hold";
  if (mean <= 4.5) return "sell";
  return "strongSell";
}

function fmtPct(n: number | null): string {
  if (n == null) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function AnalysisSectionUI({
  analysis,
  currentPrice,
  locale,
  currency,
}: {
  analysis: StockAnalysis;
  currentPrice: number | null;
  locale: "th" | "en";
  currency: string;
}) {
  const ratingKey =
    normalizeRatingKey(analysis.recommendationKey) !== "unknown"
      ? normalizeRatingKey(analysis.recommendationKey)
      : ratingMeanToKey(analysis.recommendationMean);
  const cfg = RATING_CONFIG[ratingKey];
  const price = currentPrice ?? analysis.currentPrice;
  const ccy = currency === "USD" ? "$" : "฿";

  // Wall Street consensus total
  const trend = analysis.recommendationTrend[0];
  const total = trend
    ? trend.strongBuy + trend.buy + trend.hold + trend.sell + trend.strongSell
    : 0;
  const bullCount = trend ? trend.strongBuy + trend.buy : 0;

  // Upside from target mean
  const upside =
    price && analysis.targetMeanPrice
      ? ((analysis.targetMeanPrice - price) / price) * 100
      : null;

  const isUs = currency === "USD";

  return (
    <div className="space-y-4 px-5 py-3.5">
      {/* Consensus Badge + summary */}
      <div
        className={cn("flex items-start gap-3 rounded-xl border p-4", cfg.bg)}
      >
        <div className={cn("mt-0.5 shrink-0", cfg.color)}>{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-base font-bold", cfg.color)}>
              {locale === "th" ? cfg.labelTh : cfg.label}
            </span>
            {analysis.numberOfAnalysts != null && (
              <span className="text-xs text-slate-500">
                {locale === "th"
                  ? `(จาก ${analysis.numberOfAnalysts} นักวิเคราะห์)`
                  : `(${analysis.numberOfAnalysts} analysts)`}
              </span>
            )}
          </div>
          {total > 0 && bullCount > 0 && (
            <p className="text-xs text-slate-600 mt-1">
              {locale === "th"
                ? `นักวิเคราะห์ ${bullCount} จาก ${total} คน แนะนำให้ซื้อหรือซื้ออย่างยิ่ง`
                : `${bullCount} of ${total} analysts rate this as Buy or Strong Buy`}
            </p>
          )}
        </div>
        {analysis.recommendationMean != null && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-slate-400">
              {locale === "th" ? "คะแนนเฉลี่ย" : "Mean Score"}
            </p>
            <p className={cn("text-lg font-bold", cfg.color)}>
              {analysis.recommendationMean.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400">
              1=Strong Buy · 5=Strong Sell
            </p>
          </div>
        )}
      </div>

      {/* Price Targets */}
      {(analysis.targetMeanPrice ||
        analysis.targetHighPrice ||
        analysis.targetLowPrice) && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            {locale === "th"
              ? "ราคาเป้าหมาย (Wall Street)"
              : "Price Targets (Wall Street)"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.targetMeanPrice && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {locale === "th" ? "เป้าหมายเฉลี่ย" : "Mean Target"}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {ccy}
                  {analysis.targetMeanPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                {upside != null && (
                  <p
                    className={cn(
                      "text-[11px] font-semibold mt-0.5",
                      upside >= 0 ? "text-emerald-600" : "text-red-500",
                    )}
                  >
                    {upside >= 0 ? "+" : ""}
                    {upside.toFixed(1)}% upside
                  </p>
                )}
              </div>
            )}
            {analysis.targetMedianPrice && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {locale === "th" ? "เป้าหมายมัธยฐาน" : "Median Target"}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {ccy}
                  {analysis.targetMedianPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
            {analysis.targetHighPrice && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {locale === "th" ? "เป้าหมายสูงสุด" : "High Target"}
                </p>
                <p className="text-sm font-bold text-emerald-700">
                  {ccy}
                  {analysis.targetHighPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
            {analysis.targetLowPrice && (
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {locale === "th" ? "เป้าหมายต่ำสุด" : "Low Target"}
                </p>
                <p className="text-sm font-bold text-red-600">
                  {ccy}
                  {analysis.targetLowPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendation Breakdown bar chart */}
      {trend && total > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {locale === "th"
              ? "สัดส่วนคำแนะนำ (เดือนนี้)"
              : "Analyst Consensus (This Month)"}
          </h3>
          <div className="space-y-1.5">
            {(
              [
                {
                  key: "strongBuy",
                  labelTh: "ซื้ออย่างยิ่ง",
                  labelEn: "Strong Buy",
                  count: trend.strongBuy,
                  color: "bg-emerald-500",
                },
                {
                  key: "buy",
                  labelTh: "ซื้อ",
                  labelEn: "Buy",
                  count: trend.buy,
                  color: "bg-green-400",
                },
                {
                  key: "hold",
                  labelTh: "ถือ",
                  labelEn: "Hold",
                  count: trend.hold,
                  color: "bg-amber-400",
                },
                {
                  key: "sell",
                  labelTh: "ขาย",
                  labelEn: "Sell",
                  count: trend.sell,
                  color: "bg-red-400",
                },
                {
                  key: "strongSell",
                  labelTh: "ขายอย่างยิ่ง",
                  labelEn: "Strong Sell",
                  count: trend.strongSell,
                  color: "bg-red-600",
                },
              ] as const
            ).map((row) => (
              <div key={row.key} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-24 shrink-0 text-right">
                  {locale === "th" ? row.labelTh : row.labelEn}
                </span>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      row.color,
                    )}
                    style={{
                      width: `${total > 0 ? (row.count / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 w-6 shrink-0">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fundamentals */}
      {isUs &&
        (analysis.revenueGrowth != null ||
          analysis.earningsGrowth != null ||
          analysis.returnOnEquity != null ||
          analysis.currentRatio != null) && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {locale === "th" ? "ปัจจัยพื้นฐาน" : "Fundamentals"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {analysis.revenueGrowth != null && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {locale === "th" ? "การเติบโตรายได้" : "Revenue Growth"}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      analysis.revenueGrowth >= 0
                        ? "text-emerald-700"
                        : "text-red-600",
                    )}
                  >
                    {fmtPct(analysis.revenueGrowth)}
                  </p>
                </div>
              )}
              {analysis.earningsGrowth != null && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {locale === "th" ? "การเติบโตกำไร" : "Earnings Growth"}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      analysis.earningsGrowth >= 0
                        ? "text-emerald-700"
                        : "text-red-600",
                    )}
                  >
                    {fmtPct(analysis.earningsGrowth)}
                  </p>
                </div>
              )}
              {analysis.returnOnEquity != null && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    ROE
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      analysis.returnOnEquity >= 0.1
                        ? "text-emerald-700"
                        : "text-slate-700",
                    )}
                  >
                    {fmtPct(analysis.returnOnEquity)}
                  </p>
                </div>
              )}
              {analysis.currentRatio != null && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {locale === "th" ? "อัตราสภาพคล่อง" : "Current Ratio"}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      analysis.currentRatio >= 1.5
                        ? "text-emerald-700"
                        : analysis.currentRatio >= 1
                          ? "text-amber-700"
                          : "text-red-600",
                    )}
                  >
                    {analysis.currentRatio.toFixed(2)}x
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      <p className="text-[10px] text-slate-400 text-right">
        {locale === "th"
          ? "ข้อมูลจาก Yahoo Finance · ไม่ใช่คำแนะนำการลงทุน"
          : "Data via Yahoo Finance · Not investment advice"}
      </p>
    </div>
  );
}

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
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [detail, setDetail] = useState<StockDetail | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState<RangeLabel>("1D");
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const { t, locale } = useTranslations();
  const QUOTE_TYPE_LABEL =
    locale === "th" ? QUOTE_TYPE_LABEL_TH : QUOTE_TYPE_LABEL_EN;

  const sym = symbol?.toUpperCase() ?? "";
  const isWatched = watchlistItems.some((w) => w.symbol === sym);
  const isIntraday = activeRange === "1D" || activeRange === "5D";
  const holdings = useAppSelector((s) => s.portfolio.holdings);
  const holdingForSymbol: Holding | undefined = holdings.find(
    (h) => h.symbol === sym,
  );
  const cashBalances = useAppSelector((s) => s.portfolio.summary.cashBalances);
  const fxUsdThb = useAppSelector((s) => s.portfolio.summary.fxUsdThb);
  const positionMetrics: PositionCostMetrics | null =
    calculatePositionCostMetrics(
      holdingForSymbol ?? null,
      detail?.price ?? null,
    );

  type TradeSide = "BUY" | "SELL";
  type TradeMode = "THB" | "USD" | "SHARES";

  const [tradeSide, setTradeSide] = useState<TradeSide>("BUY");
  const [buyMode, setBuyMode] = useState<TradeMode>("SHARES");
  const [sellMode, setSellMode] = useState<TradeMode>("SHARES");
  const activeMode = tradeSide === "BUY" ? buyMode : sellMode;

  const [tradeInput, setTradeInput] = useState<number>(1);
  const [tradeBusy, setTradeBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<
    "success" | "error" | "info"
  >("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState<React.ReactNode>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function openModal(
    v: "success" | "error" | "info",
    title: string,
    desc?: React.ReactNode,
  ) {
    setModalVariant(v);
    setModalTitle(title);
    setModalDesc(desc ?? null);
    setModalOpen(true);
  }

  function isMobile() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 640px)").matches;
  }

  function getQuoteCurrency(): import("@/src/types").CashCurrency {
    return detail?.currency === "USD" ? "USD" : "THB";
  }

  function getSettlementCurrency(): import("@/src/types").CashCurrency {
    // Requirement: US stocks settle in USD; Thai/others settle in THB.
    // We approximate using quote currency.
    return getQuoteCurrency() === "USD" ? "USD" : "THB";
  }

  function getPayCurrency(side: TradeSide): import("@/src/types").CashCurrency {
    const mode = side === "BUY" ? buyMode : sellMode;
    if (mode === "THB") return "THB";
    if (mode === "USD") return "USD";
    // Shares mode: default to quote currency
    return getQuoteCurrency();
  }

  function getQtyFromInput(side: TradeSide): number {
    if (!detail?.price) return 0;
    const price = detail.price;
    const mode = side === "BUY" ? buyMode : sellMode;
    const input = Number.isFinite(tradeInput) ? tradeInput : 0;

    if (mode === "SHARES") return Math.max(1, Math.floor(input));
    // For amount-based modes, compute an integer share quantity.
    // Note: This is a UI-mode switch only; we treat THB/USD as "amount budget/target".
    if (mode === "THB" || mode === "USD") {
      return Math.max(1, Math.floor(input / price));
    }
    return Math.max(1, Math.floor(input));
  }

  function getModeLabel(mode: TradeMode) {
    if (locale === "th") {
      if (mode === "THB") return "ซื้อเงินบาท";
      if (mode === "USD") return "ซื้อเงิน USD";
      return "จำนวนหุ้น";
    }
    if (mode === "THB") return "Buy THB";
    if (mode === "USD") return "Buy USD";
    return "Shares";
  }

  function getInputLabel(side: TradeSide, mode: TradeMode) {
    if (locale === "th") {
      if (mode === "SHARES")
        return side === "BUY"
          ? "จำนวนหุ้นที่ต้องการซื้อ"
          : "จำนวนหุ้นที่ต้องการขาย";
      if (mode === "THB")
        return side === "BUY" ? "งบประมาณ (THB)" : "มูลค่าที่ต้องการขาย (THB)";
      return side === "BUY" ? "งบประมาณ (USD)" : "มูลค่าที่ต้องการขาย (USD)";
    }
    if (mode === "SHARES") return side === "BUY" ? "Buy shares" : "Sell shares";
    if (mode === "THB")
      return side === "BUY" ? "Budget (THB)" : "Target value (THB)";
    return side === "BUY" ? "Budget (USD)" : "Target value (USD)";
  }

  function openConfirm(side: TradeSide) {
    setTradeSide(side);
    if (isMobile()) setConfirmOpen(true);
  }

  async function executeBuy() {
    if (!isAuthenticated) {
      openModal(
        "info",
        locale === "th" ? "กรุณาเข้าสู่ระบบ" : "Login required",
        locale === "th"
          ? "เข้าสู่ระบบก่อนเพื่อใช้งานการซื้อ/ขายหุ้น"
          : "Please sign in to use trading features.",
      );
      router.push("/login");
      return;
    }
    if (!detail?.price || tradeBusy) return;
    const qty = getQtyFromInput("BUY");
    const price = detail.price;
    const feeRate = 0.0025;
    const fee = Math.round(qty * price * feeRate * 100) / 100;
    const quoteCurrency = getQuoteCurrency();
    const payCurrency = getPayCurrency("BUY");
    const totalInQuote = qty * price + fee;
    const fx = fxUsdThb || 35;
    const required =
      quoteCurrency === payCurrency
        ? totalInQuote
        : quoteCurrency === "USD"
          ? totalInQuote * fx
          : totalInQuote / fx;

    if ((cashBalances?.[payCurrency] ?? 0) < required) {
      openModal(
        "error",
        locale === "th" ? "ซื้อไม่สำเร็จ" : "Buy failed",
        locale === "th"
          ? `ยอดเงิน ${payCurrency} ไม่พอ (ต้องใช้ ${formatCurrency(required)})`
          : `Insufficient ${payCurrency} cash (need ${formatCurrency(required)})`,
      );
      return;
    }

    setTradeBusy(true);
    // Simulate async processing: check cash first, then update later.
    await new Promise((r) => setTimeout(r, 450));

    dispatch(
      buyStock({
        symbol: sym,
        name: detail.name,
        sector: (detail.sector ?? "Other") as import("@/src/types").StockSector,
        quantity: qty,
        price,
        fee,
        quoteCurrency,
        payCurrency,
      }),
    );
    dispatch(
      addTransaction({
        id: generateId("TXN"),
        type: "BUY",
        symbol: sym,
        name: detail.name,
        quantity: qty,
        price,
        amount: qty * price,
        fee,
        status: "COMPLETED",
        date: new Date().toISOString().slice(0, 10),
      }),
    );

    setTradeBusy(false);
    openModal(
      "success",
      locale === "th" ? "ซื้อสำเร็จ" : "Buy successful",
      locale === "th"
        ? `ซื้อ ${sym} จำนวน ${qty.toLocaleString()} หน่วย รวม ${formatCurrency(
            totalInQuote,
          )}`
        : `Bought ${qty.toLocaleString()} ${sym}. Total ${formatCurrency(totalInQuote)}`,
    );
  }

  async function executeSell() {
    if (!isAuthenticated) {
      openModal(
        "info",
        locale === "th" ? "กรุณาเข้าสู่ระบบ" : "Login required",
        locale === "th"
          ? "เข้าสู่ระบบก่อนเพื่อใช้งานการซื้อ/ขายหุ้น"
          : "Please sign in to use trading features.",
      );
      router.push("/login");
      return;
    }
    if (!detail?.price || tradeBusy || !holdingForSymbol) return;
    const qty = getQtyFromInput("SELL");
    if (qty > holdingForSymbol.quantity) {
      openModal(
        "error",
        locale === "th" ? "ขายไม่สำเร็จ" : "Sell failed",
        locale === "th"
          ? `จำนวนที่ขายมากกว่าที่มีอยู่ (มี ${holdingForSymbol.quantity.toLocaleString()})`
          : `Sell quantity exceeds holding (have ${holdingForSymbol.quantity.toLocaleString()})`,
      );
      return;
    }

    setTradeBusy(true);
    await new Promise((r) => setTimeout(r, 450));

    const price = detail.price;
    const feeRate = 0.0025;
    const fee = Math.round(qty * price * feeRate * 100) / 100;
    const quoteCurrency = getQuoteCurrency();
    const settlementCurrency = getSettlementCurrency();
    const total = qty * price - fee;

    dispatch(
      sellStock({
        symbol: sym,
        quantity: qty,
        price,
        fee,
        quoteCurrency,
        settlementCurrency,
      }),
    );
    dispatch(
      addTransaction({
        id: generateId("TXN"),
        type: "SELL",
        symbol: sym,
        name: detail.name,
        quantity: qty,
        price,
        amount: qty * price,
        fee,
        status: "COMPLETED",
        date: new Date().toISOString().slice(0, 10),
      }),
    );

    setTradeBusy(false);
    openModal(
      "success",
      locale === "th" ? "ขายสำเร็จ" : "Sell successful",
      locale === "th"
        ? `ขาย ${sym} จำนวน ${qty.toLocaleString()} หน่วย รับสุทธิ ${formatCurrency(
            total,
          )}`
        : `Sold ${qty.toLocaleString()} ${sym}. Net ${formatCurrency(total)}`,
    );
  }

  // ── Fetch price history for the given range ────────────────────────────
  async function fetchHistory(rangeLabel: RangeLabel) {
    const opt = RANGE_OPTIONS.find((r) => r.label === rangeLabel)!;
    setHistLoading(true);
    dispatch(
      fetchStockHistory({
        symbol: sym,
        range: opt.range,
        interval: opt.interval,
      }),
    )
      .unwrap()
      .then((h) => setHistory(h ?? []))
      .catch(() => {
        // non-fatal — chart shows empty
        setHistory([]);
      })
      .finally(() => setHistLoading(false));
  }

  // ── Fetch stock detail (hero section) ─────────────────────────────────
  async function loadDetail() {
    setLoading(true);
    setError(null);
    dispatch(fetchStockDetail({ symbol: sym }))
      .unwrap()
      .then((d) => {
        setDetail(d.detail ?? null);
        setNews(d.news ?? []);
      })
      .catch(() => {
        setError(
          locale === "th"
            ? "เกิดข้อผิดพลาดในการโหลดข้อมูล"
            : "Failed to load data",
        );
      })
      .finally(() => setLoading(false));
  }

  // Full refresh (used by the refresh button)
  function reload() {
    loadDetail();
    fetchHistory(activeRange);
  }

  // On symbol change: load detail + initial history + analyst analysis
  useEffect(() => {
    if (sym) {
      loadDetail();
      fetchHistory(activeRange);
      setAnalysis(null);
      setAnalysisLoading(true);
      dispatch(fetchStockAnalysis({ symbol: sym }))
        .unwrap()
        .then((a) => setAnalysis(a ?? null))
        .catch(() => setAnalysis(null))
        .finally(() => setAnalysisLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sym]);

  // Load live USD/THB FX rate (Yahoo Finance)
  useEffect(() => {
    dispatch(fetchFxUsdThb());
  }, [dispatch]);

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
    <div className="pb-24 sm:pb-0">
      <Modal
        open={modalOpen}
        variant={modalVariant}
        title={modalTitle}
        description={modalDesc ?? undefined}
        primaryLabel={locale === "th" ? "ตกลง" : "OK"}
        onClose={() => setModalOpen(false)}
        onPrimary={() => setModalOpen(false)}
        disableClose={tradeBusy}
      />

      <Modal
        open={confirmOpen}
        variant="info"
        title={locale === "th" ? "ยืนยันรายการ" : "Confirm trade"}
        description={
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {locale === "th" ? "สัญลักษณ์" : "Symbol"}
                </p>
                <p className="font-bold text-slate-800">{sym}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {locale === "th" ? "ราคาปัจจุบัน" : "Price"}
                </p>
                <p className="font-bold text-slate-800">
                  {detail?.currency === "THB" ? "฿" : "$"}
                  {fmt(detail?.price)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-800">
                  {tradeSide === "BUY"
                    ? locale === "th"
                      ? "ซื้อ"
                      : "Buy"
                    : locale === "th"
                      ? "ขาย"
                      : "Sell"}
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums">
                  {locale === "th" ? "เงินสดคงเหลือ" : "Cash"}:{" "}
                  <span className="font-semibold text-slate-700">
                    THB {formatCurrency(cashBalances?.THB ?? 0)} • USD{" "}
                    {formatCurrency(cashBalances?.USD ?? 0)}
                  </span>
                </p>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <select
                  value={activeMode}
                  onChange={(e) => {
                    const v = e.target.value as TradeMode;
                    if (tradeSide === "BUY") setBuyMode(v);
                    else setSellMode(v);
                  }}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Trade mode"
                >
                  <option value="THB">{getModeLabel("THB")}</option>
                  <option value="USD">{getModeLabel("USD")}</option>
                  <option value="SHARES">{getModeLabel("SHARES")}</option>
                </select>
                <input
                  type="number"
                  min={1}
                  step={activeMode === "SHARES" ? 1 : 10}
                  value={tradeInput}
                  onChange={(e) => setTradeInput(Number(e.target.value))}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Trade input"
                />
              </div>

              <div className="mt-2 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>{getInputLabel(tradeSide, activeMode)}</span>
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {Number.isFinite(tradeInput)
                      ? tradeInput.toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {locale === "th"
                      ? "จำนวนหุ้นประมาณการ"
                      : "Estimated shares"}
                  </span>
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {getQtyFromInput(tradeSide).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        }
        primaryLabel={locale === "th" ? "ยืนยัน" : "Confirm"}
        secondaryLabel={locale === "th" ? "ยกเลิก" : "Cancel"}
        onClose={() => setConfirmOpen(false)}
        onSecondary={() => setConfirmOpen(false)}
        onPrimary={async () => {
          setConfirmOpen(false);
          if (tradeSide === "BUY") await executeBuy();
          else await executeSell();
        }}
        disableClose={tradeBusy}
      />

      {/* ── Back nav ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
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
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 mb-5">
        {/* Left column: hero + sections (so right panel can sticky across the page) */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-5 md:px-6">
              <section>
                {/* Left: name + badges */}
                <div className="min-w-0">
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <p className="text-sm text-slate-500 truncate max-w-xs">
                        {detail.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-2xl font-black text-slate-900">
                          {sym}
                        </span>
                      </div>
                      <div className="mb-1">
                        <p className="md:text-3xl text-2xl font-black tabular-nums text-slate-900">
                          {detail.currency === "THB" ? "฿" : "$"}
                          {fmt(detail.price)}
                        </p>
                        {detail.currency === "USD" && (
                          <p className="text-[10px] text-slate-400 tabular-nums">
                            1 USD ≈ {(fxUsdThb ?? 35).toFixed(2)} THB
                          </p>
                        )}
                        <div
                          className={cn(
                            "flex items-center justify-start gap-1 text-sm font-bold tabular-nums",
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
                      </div>
                    </div>

                    {/* Right: price + watchlist */}
                    <div className="flex flex-col items-end justify-end gap-1 sm:gap-1 shrink-0 w-fit">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap max-w-48 md:max-w-full">
                        {detail.exchange && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {detail.exchange}
                          </span>
                        )}
                        {detail.quoteType && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {QUOTE_TYPE_LABEL[detail.quoteType] ??
                              detail.quoteType}
                          </span>
                        )}
                        {(detail.sector || detail.industry) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {detail.sector && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                                {detail.sector}
                              </span>
                            )}
                            {detail.industry && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                {detail.industry}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {(hasPre || hasPost) && (
                          <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                            {hasPre && (
                              <div className="flex items-center justify-end gap-2">
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                                  {locale === "th" ? "ก่อนเปิดตลาด" : "Pre"}
                                </span>
                                <span className="tabular-nums text-slate-700">
                                  {detail.currency === "THB" ? "฿" : "$"}
                                  {fmt(detail.preMarketPrice)}
                                </span>
                                {typeof detail.preMarketChangePercent ===
                                  "number" && (
                                  <span
                                    className={cn(
                                      "tabular-nums font-semibold",
                                      detail.preMarketChangePercent >= 0
                                        ? "text-emerald-600"
                                        : "text-red-500",
                                    )}
                                  >
                                    {detail.preMarketChangePercent >= 0
                                      ? "+"
                                      : ""}
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
                                {typeof detail.postMarketChangePercent ===
                                  "number" && (
                                  <span
                                    className={cn(
                                      "tabular-nums font-semibold",
                                      detail.postMarketChangePercent >= 0
                                        ? "text-emerald-600"
                                        : "text-red-500",
                                    )}
                                  >
                                    {detail.postMarketChangePercent >= 0
                                      ? "+"
                                      : ""}
                                    {fmt(detail.postMarketChangePercent)}%
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleWatch}
                          className={cn(
                            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors border",
                            isWatched
                              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200",
                          )}
                        >
                          {isWatched ? (
                            <StarOff size={13} />
                          ) : (
                            <Star size={13} />
                          )}
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
                        rangeLabel={activeRange}
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
              </section>
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

          {/* Analyst Analysis Section */}
          {(analysisLoading || analysis) && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 flex items-center justify-between px-5 py-3.5">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-indigo-500" />
                  {locale === "th"
                    ? "บทวิเคราะห์จากนักวิเคราะห์"
                    : "Analyst Analysis"}
                </h2>
                {!analysisLoading && (
                  <span className="text-[10px] text-slate-400">
                    {locale === "th"
                      ? "ข้อมูลจาก Yahoo Finance"
                      : "Powered by Yahoo Finance"}
                  </span>
                )}
              </div>
              {analysisLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-6 px-5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {locale === "th"
                    ? "กำลังโหลดบทวิเคราะห์..."
                    : "Loading analysis…"}
                </div>
              ) : analysis ? (
                <div className="p-5">
                  <AnalysisSectionUI
                    analysis={analysis}
                    currentPrice={detail?.price ?? null}
                    locale={locale}
                    currency={detail?.currency ?? "THB"}
                  />
                </div>
              ) : null}
            </div>
          )}

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

          {/* Recent News */}
          <div className="overflow-hidden mt-8">
            <div className="border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm mb-4 font-semibold text-slate-800">
                {locale === "th" ? "ข่าวล่าสุด" : "Recent News"}
              </h2>
              {news.length > 0 && (
                <span className="text-[10px] text-slate-400">
                  {locale === "th"
                    ? "อัปเดตจาก Yahoo Finance"
                    : "Powered by Yahoo Finance"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {news.slice(0, 6).map((n) => (
                  <NewsCard
                    key={n.id}
                    item={n}
                    locale={locale}
                    variant="stock"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: sticky across the whole page */}
        <div className="w-full max-w-full space-y-3 xl:sticky xl:top-16 xl:self-start">
          {isAuthenticated && positionMetrics && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
              <div className="block text-sm text-slate-500 space-y-2">
                {holdingForSymbol && (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full font-semibold",
                      getAssetBadgeClass(getAssetKeyForSymbol(sym)),
                    )}
                  >
                    {getAssetBadgeLabel(getAssetKeyForSymbol(sym), locale)}
                  </span>
                )}
                <div className="grid grid-cols-2 items-center gap-4 mt-2">
                  <div className="col-span-1 tabular-nums">
                    {locale === "th" ? "จำนวน" : "Shares"}:{" "}
                    <span className="font-semibold text-slate-700">
                      {positionMetrics.quantity.toLocaleString()}{" "}
                    </span>
                    {positionMetrics.quantity > 1 && (
                      <span className="text-slate-400">
                        {locale === "th" ? "หุ้น" : ""}
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 tabular-nums">
                    {locale === "th" ? "ต้นทุนเฉลี่ย" : "Avg cost"}:{" "}
                    <span className="font-semibold text-slate-700">
                      {detail.currency === "THB" ? "฿" : "$"}
                      {fmt(positionMetrics.avgCost)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                  <span className="col-span-1 tabular-nums">
                    {locale === "th" ? "มูลค่าต้นทุน" : "Cost basis"}:{" "}
                    <span className="font-semibold text-slate-700">
                      {detail.currency === "THB" ? "฿" : "$"}
                      {fmt(positionMetrics.costBasis)}
                    </span>
                  </span>
                  <span className="col-span-1 tabular-nums">
                    {locale === "th" ? "มูลค่าล่าสุด" : "Latest vs cost"}:{" "}
                    <span
                      className={cn(
                        "font-semibold",
                        positionMetrics.priceDiffPercent >= 0
                          ? "text-emerald-600"
                          : "text-red-500",
                      )}
                    >
                      {positionMetrics.priceDiffPercent >= 0 ? "+" : ""}
                      {fmt(Math.abs(positionMetrics.priceDiffPercent))}%
                    </span>
                  </span>
                </div>
                <span
                  className={cn(
                    "tabular-nums font-semibold",
                    positionMetrics.unrealizedPnL >= 0
                      ? "text-emerald-600"
                      : "text-red-500",
                  )}
                >
                  {locale === "th"
                    ? "กำไร/ขาดทุนที่ยังไม่รับรู้"
                    : "Unrealized P&L"}
                  : {positionMetrics.unrealizedPnL >= 0 ? "+" : ""}
                  {detail.currency === "THB" ? "฿" : "$"}
                  {fmt(Math.abs(positionMetrics.unrealizedPnL))} (
                  {positionMetrics.unrealizedPnLPercent >= 0 ? "+" : ""}
                  {fmt(Math.abs(positionMetrics.unrealizedPnLPercent))}%)
                </span>
              </div>
            </div>
          )}

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
          {/* Desktop trade panel */}
          <div className="hidden sm:block rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {!isAuthenticated ? (
              <>
                <p className="text-xs font-semibold text-slate-800">
                  {locale === "th"
                    ? "เข้าสู่ระบบเพื่อซื้อ/ขายหุ้น"
                    : "Login to trade"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {locale === "th"
                    ? "ฟีเจอร์ซื้อ/ขาย และข้อมูลพอร์ต (position metrics) ใช้ได้หลังเข้าสู่ระบบเท่านั้น"
                    : "Trading features and portfolio metrics are available after login."}
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="mt-3 h-9 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                >
                  {locale === "th" ? "เข้าสู่ระบบเพื่อซื้อ" : "Login to buy"}
                </button>
              </>
            ) : (
              <>
                {/* Side toggle + mode selector (desktop/tablet) */}
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {locale === "th" ? "ซื้อ/ขาย" : "Trade"}
                    </p>
                    <p className="text-[10px] text-slate-500 tabular-nums">
                      {locale === "th" ? "เงินสด" : "Cash"}:{" "}
                      <span className="font-semibold text-slate-700">
                        THB {formatCurrency(cashBalances?.THB ?? 0)} • USD{" "}
                        {formatCurrency(cashBalances?.USD ?? 0)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                      <button
                        onClick={() => setTradeSide("BUY")}
                        className={cn(
                          "h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
                          tradeSide === "BUY"
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        {locale === "th" ? "ซื้อ" : "Buy"}
                      </button>
                      {holdingForSymbol && (
                        <button
                          onClick={() => setTradeSide("SELL")}
                          className={cn(
                            "h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
                            tradeSide === "SELL"
                              ? "bg-red-600 text-white"
                              : "text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          {locale === "th" ? "ขาย" : "Sell"}
                        </button>
                      )}
                    </div>

                    <select
                      value={activeMode}
                      onChange={(e) => {
                        const v = e.target.value as TradeMode;
                        if (tradeSide === "BUY") setBuyMode(v);
                        else setSellMode(v);
                      }}
                      className="h-9 flex-1 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      title="Trade mode"
                    >
                      <option value="THB">{getModeLabel("THB")}</option>
                      <option value="USD">{getModeLabel("USD")}</option>
                      <option value="SHARES">{getModeLabel("SHARES")}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      step={activeMode === "SHARES" ? 1 : 10}
                      value={tradeInput}
                      onChange={(e) => setTradeInput(Number(e.target.value))}
                      className="h-9 w-32 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      aria-label="Trade input"
                    />
                    <div className="flex-1">
                      <button
                        onClick={() => {
                          if (tradeSide === "BUY") openConfirm("BUY");
                          else openConfirm("SELL");
                          if (!isMobile()) {
                            if (tradeSide === "BUY") void executeBuy();
                            else void executeSell();
                          }
                        }}
                        disabled={
                          tradeBusy ||
                          (tradeSide === "SELL" && !holdingForSymbol)
                        }
                        className={cn(
                          "h-9 w-full rounded-xl text-xs font-semibold text-white transition-colors",
                          tradeBusy
                            ? "bg-slate-300 cursor-not-allowed"
                            : tradeSide === "BUY"
                              ? "bg-indigo-600 hover:bg-indigo-500"
                              : "bg-red-600 hover:bg-red-500",
                        )}
                      >
                        {tradeSide === "BUY"
                          ? locale === "th"
                            ? "ยืนยันซื้อ"
                            : "Confirm buy"
                          : locale === "th"
                            ? "ยืนยันขาย"
                            : "Confirm sell"}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {getInputLabel(tradeSide, activeMode)} •{" "}
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {locale === "th" ? "ประมาณ" : "Est."}{" "}
                      {getQtyFromInput(tradeSide).toLocaleString()}{" "}
                      {locale === "th" ? "หุ้น" : "shares"}
                    </span>
                  </p>
                </div>

                {holdingForSymbol && (
                  <p className="mt-2 text-[11px] text-slate-500 tabular-nums text-right">
                    {locale === "th" ? "มีอยู่" : "Holding"}:{" "}
                    <span className="font-semibold text-slate-700">
                      {holdingForSymbol.quantity.toLocaleString()}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mobile: fixed bottom buy/sell buttons only */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3">
        {!isAuthenticated ? (
          <button
            onClick={() => router.push("/login")}
            className="h-11 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors"
          >
            {locale === "th" ? "เข้าสู่ระบบเพื่อซื้อ" : "Login to buy"}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openConfirm("BUY")}
              disabled={tradeBusy}
              className={cn(
                "h-11 flex-1 rounded-2xl text-sm font-semibold text-white transition-colors",
                tradeBusy
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500",
              )}
            >
              {locale === "th" ? "ซื้อ" : "Buy"}
            </button>
            <button
              onClick={() => holdingForSymbol && openConfirm("SELL")}
              disabled={tradeBusy || !holdingForSymbol}
              className={cn(
                "h-11 flex-1 rounded-2xl text-sm font-semibold transition-colors border",
                tradeBusy || !holdingForSymbol
                  ? "bg-white text-slate-300 border-slate-200 cursor-not-allowed"
                  : "bg-white text-red-600 border-red-200 hover:bg-red-50",
              )}
            >
              {locale === "th" ? "ขาย" : "Sell"}
            </button>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 tabular-nums">
          <span>
            {locale === "th" ? "เงินสด" : "Cash"}: THB{" "}
            {formatCurrency(cashBalances?.THB ?? 0)} • USD{" "}
            {formatCurrency(cashBalances?.USD ?? 0)}
          </span>
          {holdingForSymbol && (
            <span>
              {locale === "th" ? "มีอยู่" : "Holding"}:{" "}
              {holdingForSymbol.quantity.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Recent News moved into the left column above */}
    </div>
  );
}
