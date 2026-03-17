"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { fetchFxUsdThb } from "@/src/slices/portfolioSlice";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { PortfolioAllocationChart } from "@/components/charts/PortfolioAllocationChart";
import type { Holding, AssetKey } from "@/src/types";
import {
  formatCurrency,
  formatInteger,
  formatPercent,
} from "@/src/utils/formatters";
import { getChangeColor, cn } from "@/src/utils/helpers";
import { ProfileTabsBar } from "@/components/layout/ProfileTabsBar";
import { useTranslations } from "@/src/i18n/useTranslations";
import { StockScreenerTable } from "@/components/market/StockScreenerTable";
import { SYMBOL_TO_META } from "@/src/data/sectorMap";

type AssetTabKey = AssetKey;
type ViewMode = "sector" | "asset";

const ASSET_TABS: { key: AssetTabKey; labelTH: string; labelEN: string }[] = [
  { key: "us", labelTH: "หุ้นสหรัฐฯ", labelEN: "US Stocks" },
  { key: "th", labelTH: "หุ้นไทย", labelEN: "Thai Stocks" },
  { key: "etf", labelTH: "ETF", labelEN: "ETFs" },
  { key: "crypto", labelTH: "คริปโต", labelEN: "Crypto" },
  { key: "gold", labelTH: "ทองคำ", labelEN: "Gold" },
  { key: "all", labelTH: "ทั้งหมด", labelEN: "All" },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, locale } = useTranslations();
  const { summary, holdings, performance, allocation } = useAppSelector((s) => s.portfolio);
  const [viewMode, setViewMode] = useState<ViewMode>("sector");
  const [activeAsset, setActiveAsset] = useState<AssetTabKey>("all");

  const cashThb = summary.cashBalances?.THB ?? 0;
  const cashUsd = summary.cashBalances?.USD ?? 0;
  const fxUsdThb = summary.fxUsdThb ?? 35;

  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const summaryDragging = useRef(false);
  const summaryDragStartX = useRef(0);
  const summaryDragScrollL = useRef(0);

  function getAssetKeyForHolding(h: Holding): AssetTabKey {
    const meta = SYMBOL_TO_META[h.symbol];
    if (meta?.type === "ETF") return "etf";
    if (meta?.type === "CRYPTO") return "crypto";
    if (meta?.sector === "Commodity") return "gold";
    const exch = (meta?.exchange ?? "").toUpperCase();
    if (exch === "SET") return "th";
    return "us";
  }

  function isUsSymbol(symbol: string) {
    const meta = SYMBOL_TO_META[symbol];
    const exch = (meta?.exchange ?? "").toUpperCase();
    return exch !== "SET" && symbol.toUpperCase() in SYMBOL_TO_META;
  }

  const filteredHoldings = useMemo(() => {
    if (activeAsset === "all") return holdings;
    return holdings.filter((h) => getAssetKeyForHolding(h) === activeAsset);
  }, [holdings, activeAsset]);

  const assetAllocation = useMemo(() => {
    const buckets: Record<AssetTabKey, { key: AssetTabKey; value: number }> = {
      us: { key: "us", value: 0 },
      th: { key: "th", value: 0 },
      etf: { key: "etf", value: 0 },
      crypto: { key: "crypto", value: 0 },
      gold: { key: "gold", value: 0 },
      all: { key: "all", value: 0 },
    };
    holdings.forEach((h) => {
      const k = getAssetKeyForHolding(h);
      buckets[k].value += h.marketValue;
      buckets.all.value += h.marketValue;
    });
    const total = buckets.all.value || holdings.reduce((s, h) => s + h.marketValue, 0) || 1;
    const colorMap: Record<AssetTabKey, string> = {
      us: "#6366F1",
      th: "#0EA5E9",
      etf: "#22C55E",
      crypto: "#F97316",
      gold: "#EAB308",
      all: "#94A3B8",
    };
    return (["us", "th", "etf", "crypto", "gold"] as AssetTabKey[])
      .map((k) => {
        const tab = ASSET_TABS.find((t) => t.key === k)!;
        const value = buckets[k].value;
        if (value <= 0) return null;
        return {
          name: locale === "th" ? tab.labelTH : tab.labelEN,
          value,
          percent: (value / total) * 100,
          color: colorMap[k],
        };
      })
      .filter(Boolean);
  }, [holdings, locale]);

  const updateSummaryArrows = useCallback(() => {
    const el = summaryRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const t = setTimeout(updateSummaryArrows, 120);
    return () => clearTimeout(t);
  }, [updateSummaryArrows, summary.totalValue, summary.totalPnL, summary.dailyPnL, holdings.length]);

  useEffect(() => {
    dispatch(fetchFxUsdThb());
  }, [dispatch]);

  const scrollSummaryBy = useCallback((dir: "left" | "right") => {
    summaryRef.current?.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });
  }, []);

  const onSummaryMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = summaryRef.current;
    if (!el) return;
    summaryDragging.current = true;
    summaryDragStartX.current = e.pageX - el.getBoundingClientRect().left;
    summaryDragScrollL.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const onSummaryMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!summaryDragging.current || !summaryRef.current) return;
    e.preventDefault();
    const x = e.pageX - summaryRef.current.getBoundingClientRect().left;
    const diff = x - summaryDragStartX.current;
    summaryRef.current.scrollLeft = summaryDragScrollL.current - diff * 1.4;
  }, []);

  const stopSummaryDrag = useCallback(() => {
    summaryDragging.current = false;
    if (summaryRef.current) {
      summaryRef.current.style.cursor = "grab";
      summaryRef.current.style.userSelect = "";
    }
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      <ProfileTabsBar />

      {/* ── Portfolio Summary Stats (horizontal scroll + arrows) ──────────── */}
      <div className="relative -mx-4 md:mx-0">
        {/* Left arrow — desktop only */}
        <button
          onClick={() => scrollSummaryBy("left")}
          aria-label="Scroll left"
          title="Scroll left"
          className={cn(
            "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10",
            "h-7 w-7 items-center justify-center rounded-full",
            "bg-white shadow-md border border-slate-200 text-slate-500",
            "hover:text-indigo-600 hover:border-indigo-300 transition-all duration-150",
            showLeft ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Scrollable strip */}
        <div
          ref={summaryRef}
          onScroll={updateSummaryArrows}
          onMouseDown={onSummaryMouseDown}
          onMouseMove={onSummaryMouseMove}
          onMouseUp={stopSummaryDrag}
          onMouseLeave={stopSummaryDrag}
          className="flex gap-2 overflow-x-auto pb-1 px-4 md:px-0 scrollbar-hide md:cursor-grab"
        >
          <div className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[100px] cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <StatCard
              title={t("dashboard.totalValue")}
              value={formatCurrency(summary.totalValue)}
              change={summary.dailyPnLPercent}
              changeLabel={t("common.today")}
              icon={<Wallet size={16} className="text-indigo-600" />}
              iconBg="bg-indigo-50"
            />
          </div>
          <div className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[100px] cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <StatCard
              title={locale === "th" ? "ต้นทุนรวม" : "Total Cost"}
              value={formatCurrency(summary.totalCost)}
              icon={<PieChartIcon size={16} className="text-slate-500" />}
              iconBg="bg-slate-50"
            />
          </div>
          <div className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[100px] cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <StatCard
              title={t("dashboard.totalReturn")}
              value={formatCurrency(summary.totalPnL)}
              change={summary.totalPnLPercent}
              changeLabel={locale === "th" ? "ทั้งหมด" : "all time"}
              icon={
                summary.totalPnL >= 0
                  ? <TrendingUp size={16} className="text-emerald-600" />
                  : <TrendingDown size={16} className="text-red-600" />
              }
              iconBg={summary.totalPnL >= 0 ? "bg-emerald-50" : "bg-red-50"}
              valueClassName={summary.totalPnL >= 0 ? "text-emerald-600" : "text-red-600"}
            />
          </div>
          <div className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[100px] cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <StatCard
              title={t("dashboard.dayChange")}
              value={formatCurrency(summary.dailyPnL)}
              change={summary.dailyPnLPercent}
              changeLabel={locale === "th" ? "เทียบเมื่อวาน" : "vs yesterday"}
              icon={<Activity size={16} className="text-blue-600" />}
              iconBg="bg-blue-50"
              valueClassName={summary.dailyPnL >= 0 ? "text-emerald-600" : "text-red-600"}
            />
          </div>
          <div className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[100px] cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <StatCard
              title={t("dashboard.holdings")}
              value={`${holdings.length} ${locale === "th" ? "หุ้น" : "stocks"}`}
              icon={<Layers size={16} className="text-blue-600" />}
              iconBg="bg-blue-50"
            />
          </div>
          <div className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[100px] cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <StatCard
              title={locale === "th" ? "เงินสด (THB)" : "Cash (THB)"}
              value={formatCurrency(cashThb)}
              icon={<Wallet size={16} className="text-amber-600" />}
              iconBg="bg-amber-50"
            />
          </div>
          <div className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[120px] cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
            <StatCard
              title={locale === "th" ? "เงินสด (USD)" : "Cash (USD)"}
              value={`$${cashUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<Wallet size={16} className="text-indigo-600" />}
              iconBg="bg-indigo-50"
            />
            <p className="mt-1 text-[10px] text-slate-400 tabular-nums">
              1 USD ≈ {fxUsdThb.toLocaleString("en-US", { maximumFractionDigits: 4 })} THB
            </p>
          </div>
        </div>

        {/* Right arrow — desktop only */}
        <button
          onClick={() => scrollSummaryBy("right")}
          aria-label="Scroll right"
          title="Scroll right"
          className={cn(
            "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10",
            "h-7 w-7 items-center justify-center rounded-full",
            "bg-white shadow-md border border-slate-200 text-slate-500",
            "hover:text-indigo-600 hover:border-indigo-300 transition-all duration-150",
            showRight ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="space-y-4">
          {/* Performance + Allocation charts */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>{t("dashboard.performance")} (30 {locale === "th" ? "วัน" : "Days"})</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-2 md:px-5">
                <PerformanceChart data={performance} height={220} />
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
                <CardTitle>{t("dashboard.allocation")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 px-1 md:px-5">
                <PortfolioAllocationChart data={allocation} height={260} />
              </CardContent>
            </Card>
          </div>

          {/* Sector / Asset Breakdown table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>
                  {viewMode === "sector"
                    ? locale === "th"
                      ? "สรุปตามกลุ่มอุตสาหกรรม"
                      : "Sector Breakdown"
                    : locale === "th"
                      ? "สรุปตามประเภทสินทรัพย์"
                      : "Asset Class Breakdown"}
                </CardTitle>
                <div className="flex rounded-full border border-slate-200 text-[11px] overflow-hidden">
                  {(["sector", "asset"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={cn(
                        "px-2.5 py-1 font-semibold",
                        viewMode === mode
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-500",
                      )}
                    >
                      {mode === "sector"
                        ? "Sector"
                        : "Asset"}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            {viewMode === "sector" ? (
              <>
                {/* Mobile: card list */}
            <CardContent className="pt-3 md:hidden space-y-3">
              {allocation.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
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
            {/* Desktop: table */}
            <CardContent className="hidden md:block pt-4 px-0 pb-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[t("dashboard.sector"), locale === "th" ? "มูลค่า" : "Value", t("dashboard.allocation"), t("dashboard.weight")].map((h) => (
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
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
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
              </>
            ) : (
              <>
                <CardContent className="pt-3 md:hidden space-y-3">
                  {assetAllocation.map((item) => (
                    <div key={item!.name} className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: item!.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">
                            {item!.name}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {item!.percent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item!.percent}%`,
                              backgroundColor: item!.color,
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatCurrency(item!.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardContent className="hidden md:block pt-4 px-0 pb-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {[
                          locale === "th" ? "ประเภทสินทรัพย์" : "Asset Class",
                          locale === "th" ? "มูลค่า" : "Value",
                          locale === "th" ? "สัดส่วน" : "Allocation",
                          t("dashboard.weight"),
                        ].map((h) => (
                          <th
                            key={h}
                            className={cn(
                              "px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                              h !== "Asset Class" ? "text-right" : "text-left",
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {assetAllocation.map((item) => (
                        <tr
                          key={item!.name}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full shrink-0"
                                style={{ backgroundColor: item!.color }}
                              />
                              <span className="font-medium text-slate-700">
                                {item!.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600">
                            {formatCurrency(item!.value)}
                          </td>
                          <td className="px-5 py-3 text-right text-slate-600">
                            {item!.percent.toFixed(1)}%
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${item!.percent}%`,
                                    backgroundColor: item!.color,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* ── Holdings with asset filters ───────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-1.5">
              {ASSET_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveAsset(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                    activeAsset === tab.key
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                  )}
                >
                  {locale === "th" ? tab.labelTH : tab.labelEN}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {locale === "th"
                ? `ถือครอง ${filteredHoldings.length} รายการ`
                : `Holding ${filteredHoldings.length} positions`}
            </p>
          </div>

          <StockScreenerTable
            title={t("dashboard.holdings")}
            rows={filteredHoldings}
            loading={false}
            locale={locale}
            emptyMessage={locale === "th" ? "ไม่พบหุ้น" : "No holdings found"}
            getRowId={(r) => r.symbol}
            onRowClick={(r) => router.push(`/stocks/${encodeURIComponent(r.symbol)}`)}
            columns={[
              {
                key: "symbol",
                label: locale === "th" ? "สัญลักษณ์" : "Symbol",
                align: "left",
                sortable: true,
                sortValue: (r) => r.symbol,
                render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {r.symbol}
                    </p>
                    <p className="text-xs text-slate-500 max-w-[160px] truncate">{r.name}</p>
                  </div>
                ),
              },
              {
                key: "sector",
                label: t("dashboard.sector"),
                align: "left",
                sortable: true,
                sortValue: (r) => r.sector,
                render: (r) => (
                  <Badge variant="default" className="text-xs whitespace-nowrap">
                    {r.sector}
                  </Badge>
                ),
              },
              {
                key: "qty",
                label: locale === "th" ? "จำนวน" : "Qty",
                align: "right",
                sortable: true,
                sortValue: (r) => r.quantity,
                render: (r) => formatInteger(r.quantity),
              },
              {
                key: "avgCost",
                label: t("dashboard.avgCost"),
                align: "right",
                sortable: true,
                sortValue: (r) => r.avgCost,
                render: (r) => (
                  <div className="text-right">
                    <div className="text-slate-800 font-semibold">
                      {isUsSymbol(r.symbol) ? "$" : "฿"}
                      {r.avgCost.toFixed(2)}
                    </div>
                    {isUsSymbol(r.symbol) && (
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        1 USD ≈ {fxUsdThb.toFixed(2)} THB
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "price",
                label: t("dashboard.currentPrice"),
                align: "right",
                sortable: true,
                sortValue: (r) => r.currentPrice,
                render: (r) => (
                  <div className="text-right">
                    <div className="text-slate-800 font-semibold">
                      {isUsSymbol(r.symbol) ? "$" : "฿"}
                      {r.currentPrice.toFixed(2)}
                    </div>
                    {isUsSymbol(r.symbol) && (
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        1 USD ≈ {fxUsdThb.toFixed(2)} THB
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: "marketValue",
                label: locale === "th" ? "มูลค่าตลาด" : "Market Value",
                align: "right",
                sortable: true,
                sortValue: (r) => r.marketValue,
                render: (r) => formatCurrency(r.marketValue),
              },
              {
                key: "pnl",
                label: "P&L",
                align: "right",
                sortable: true,
                sortValue: (r) => r.unrealizedPnL,
                render: (r) => (
                  <div className="text-right">
                    <p className={cn("font-semibold", getChangeColor(r.unrealizedPnL))}>
                      {r.unrealizedPnL >= 0 ? "+" : ""}
                      {formatCurrency(r.unrealizedPnL)}
                    </p>
                    <p className={cn("text-xs", getChangeColor(r.unrealizedPnLPercent))}>
                      {formatPercent(r.unrealizedPnLPercent)}
                    </p>
                  </div>
                ),
              },
              {
                key: "weight",
                label: t("dashboard.weight"),
                align: "right",
                sortable: true,
                sortValue: (r) => r.weight,
                render: (r) => (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-slate-600">{r.weight.toFixed(1)}%</span>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(r.weight, 100)}%` }}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
            renderMobileRow={(h) => (
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {h.symbol}
                    </p>
                    <Badge variant="default" className="text-xs">
                      {h.sector}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{h.name}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">{locale === "th" ? "จำนวน" : "Qty"}</p>
                      <p className="font-medium text-slate-700">{formatInteger(h.quantity)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">{t("dashboard.avgCost")}</p>
                      <p className="font-medium text-slate-700">
                        {isUsSymbol(h.symbol) ? "$" : "฿"}
                        {h.avgCost.toFixed(2)}
                      </p>
                      {isUsSymbol(h.symbol) && (
                        <p className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                          1 USD ≈ {fxUsdThb.toFixed(2)} THB
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-400">{t("common.price")}</p>
                      <p className="font-medium text-slate-700">
                        {isUsSymbol(h.symbol) ? "$" : "฿"}
                        {h.currentPrice.toFixed(2)}
                      </p>
                      {isUsSymbol(h.symbol) && (
                        <p className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                          1 USD ≈ {fxUsdThb.toFixed(2)} THB
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-semibold text-slate-800">{formatCurrency(h.marketValue)}</p>
                  <p className="text-xs text-slate-500">{h.weight.toFixed(1)}%</p>
                  <div className="mt-2">
                    <p className={cn("text-sm font-bold", getChangeColor(h.unrealizedPnL))}>
                      {h.unrealizedPnL >= 0 ? "+" : ""}
                      {formatCurrency(h.unrealizedPnL)}
                    </p>
                    <p className={cn("text-xs", getChangeColor(h.unrealizedPnLPercent))}>
                      {formatPercent(h.unrealizedPnLPercent)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          />
      </div>
    </div>
  );
}
