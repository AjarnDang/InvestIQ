"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart2,
  SlidersHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { IndexBanner } from "@/components/ui/IndexBanner";
import { useAppSelector } from "@/src/store/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Stock } from "@/src/types";
import {
  formatMarketCap,
  formatVolume,
  formatPercent,
} from "@/src/utils/formatters";
import { getGainersAndLosers } from "@/src/functions/marketFunctions";
import { getChangeColor, getChangeBgColor, cn } from "@/src/utils/helpers";
import { useTranslations } from "@/src/i18n/useTranslations";

const SECTORS = ["ALL", "Energy", "Banking", "Technology", "Industrial", "Consumer", "Finance"];

export default function MarketPage() {
  const router = useRouter();
  const { t, locale } = useTranslations();
  const { stocks, indices, globalIndices, loading, loadingGlobal } = useAppSelector((s) => s.market);

  const [search,      setSearch]      = useState("");
  const [sector,      setSector]      = useState("ALL");
  const [sortField,   setSortField]   = useState<keyof Stock>("changePercent");
  const [sortDir,     setSortDir]     = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const { gainers, losers } = useMemo(() => getGainersAndLosers(stocks), [stocks]);

  const filtered = useMemo(() => {
    let result = [...stocks];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
      );
    }
    if (sector !== "ALL") result = result.filter((s) => s.sector === sector);
    return result.sort((a, b) => {
      const av = a[sortField] as number;
      const bv = b[sortField] as number;
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [stocks, search, sector, sortField, sortDir]);

  function handleSort(field: keyof Stock) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  }

  function goToDetail(symbol: string) {
    router.push(`/stocks/${symbol.toUpperCase()}`);
  }

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ── Live status bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">SET Market</span>
        <div className="flex items-center gap-1.5">
          {loading ? (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              {locale === "th" ? "กำลังรีเฟรช..." : "Refreshing..."}
            </>
          ) : (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {locale === "th" ? "ข้อมูลสด · อัปเดตทุก 60 วิ" : "Live · updates every 60s"}
            </>
          )}
        </div>
      </div>

      {/* ── Index Banner (SET + Global) ─────────────────────────────────── */}
      <IndexBanner
        indices={indices}
        globalIndices={globalIndices}
        loading={loading}
        loadingGlobal={loadingGlobal}
      />

      {/* ── Gainers & Losers ────────────────────────────────────────────── */}
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2",
          loading && stocks.length === 0 && "opacity-50 pointer-events-none",
        )}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-500" />
              <CardTitle>{t("market.topGainers")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-1">
            {gainers.map((s) => (
              <div
                key={s.symbol}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors group"
                onClick={() => goToDetail(s.symbol)}
              >
                <div className="min-w-0 flex items-center gap-1.5">
                  <div>
                    <span className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                      {s.symbol}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 hidden sm:inline truncate">
                      {s.name}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">฿{s.price.toFixed(2)}</p>
                    <span className="text-xs font-medium text-emerald-600">
                      +{s.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <ArrowUpRight size={13} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown size={15} className="text-red-500" />
              <CardTitle>{t("market.topLosers")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-1">
            {losers.map((s) => (
              <div
                key={s.symbol}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors group"
                onClick={() => goToDetail(s.symbol)}
              >
                <div className="min-w-0 flex items-center gap-1.5">
                  <div>
                    <span className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                      {s.symbol}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 hidden sm:inline truncate">
                      {s.name}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">฿{s.price.toFixed(2)}</p>
                    <span className="text-xs font-medium text-red-600">
                      {s.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <ArrowUpRight size={13} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Stock Screener Table ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={15} className="text-slate-500" />
                <CardTitle>{locale === "th" ? "คัดกรองหุ้น" : "Stock Screener"}</CardTitle>
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors md:hidden",
                  showFilters
                    ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                <SlidersHorizontal size={13} />
                {t("common.filter")}
              </button>
            </div>

            {/* Mobile: collapsible filters */}
            <div className={cn("space-y-2 md:hidden", !showFilters && "hidden")}>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("market.searchStocks")}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {SECTORS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                      sector === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop filters (always visible) */}
            <div className="hidden md:flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("common.search")}
                  className="h-8 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {SECTORS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
                      sector === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0 pt-2">
          {/* Mobile: card list */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filtered.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 active:bg-slate-100 cursor-pointer group transition-colors"
                onClick={() => goToDetail(stock.symbol)}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {stock.symbol}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold",
                        getChangeBgColor(stock.changePercent),
                      )}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">{stock.name}</p>
                </div>
                <div className="text-right shrink-0 ml-3 flex items-center gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">฿{stock.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Vol: {formatVolume(stock.volume)}</p>
                  </div>
                  <ArrowUpRight size={13} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
              </div>
            ))}
            {loading && stocks.length === 0 && (
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 animate-pulse">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-16 rounded bg-slate-200" />
                      <div className="h-2.5 w-32 rounded bg-slate-100" />
                    </div>
                    <div className="space-y-1.5 text-right">
                      <div className="h-3.5 w-14 rounded bg-slate-200 ml-auto" />
                      <div className="h-2.5 w-10 rounded bg-slate-100 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-400">{t("market.noResults")}</p>
            )}
          </div>

          {/* Desktop: full table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {[
                    { key: "symbol",        label: locale === "th" ? "สัญลักษณ์" : "Symbol", align: "left"  },
                    { key: "price",         label: t("common.price"),          align: "right" },
                    { key: "change",        label: t("common.change"),         align: "right" },
                    { key: "changePercent", label: t("common.changePercent"),  align: "right" },
                    { key: "volume",        label: t("common.volume"),         align: "right" },
                    { key: "marketCap",     label: t("market.marketCap"),      align: "right" },
                    { key: "peRatio",       label: t("market.peRatio"),        align: "right" },
                    { key: "dividendYield", label: t("market.dividend"),       align: "right" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none whitespace-nowrap",
                        col.align === "right" ? "text-right" : "text-left",
                      )}
                      onClick={() => handleSort(col.key as keyof Stock)}
                    >
                      {col.label}
                      {sortField === col.key && (
                        <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((stock) => (
                  <tr
                    key={stock.symbol}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() => goToDetail(stock.symbol)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-slate-500 max-w-[180px] truncate">{stock.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      ฿{stock.price.toFixed(2)}
                    </td>
                    <td className={cn("px-4 py-3 text-right font-medium", getChangeColor(stock.change))}>
                      {stock.change >= 0 ? "+" : ""}฿{stock.change.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          getChangeBgColor(stock.changePercent),
                        )}
                      >
                        {formatPercent(stock.changePercent)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatVolume(stock.volume)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{formatMarketCap(stock.marketCap)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {stock.peRatio?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {stock.dividendYield ? `${stock.dividendYield.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ArrowUpRight
                        size={13}
                        className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                      />
                    </td>
                  </tr>
                ))}
                {loading && stocks.length === 0 &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-16 rounded bg-slate-200" />
                          <div className="h-2.5 w-28 rounded bg-slate-100" />
                        </div>
                      </td>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-3 text-right">
                          <div className="h-3.5 w-14 rounded bg-slate-200 ml-auto" />
                        </td>
                      ))}
                    </tr>
                  ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-slate-400">
                      {t("market.noResults")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
