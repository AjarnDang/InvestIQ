"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Search,
  X,
} from "lucide-react";
import { IndexBanner } from "@/components/ui/IndexBanner";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Stock } from "@/src/types";
import { formatMarketCap, formatPercent, formatVolume } from "@/src/utils/formatters";
import { getGainersAndLosers } from "@/src/functions/marketFunctions";
import { cn, getChangeBgColor, getChangeColor } from "@/src/utils/helpers";
import { useTranslations } from "@/src/i18n/useTranslations";
import { MarketSearch } from "@/components/market/MarketSearch";
import { StockScreenerTable } from "@/components/market/StockScreenerTable";
import { fetchAssetQuotes, fetchTrendingStocks } from "@/src/slices/marketSlice";
import { SYMBOL_TO_META } from "@/src/data/sectorMap";

const ASSET_TABS = [
  { key: "us", labelTH: "หุ้นสหรัฐฯ", labelEN: "US Stocks" },
  { key: "th", labelTH: "หุ้นไทย", labelEN: "Thai Stocks" },
  { key: "etf", labelTH: "ETF", labelEN: "ETFs" },
  { key: "crypto", labelTH: "คริปโต", labelEN: "Crypto" },
  { key: "all", labelTH: "ทั้งหมด", labelEN: "All" },
] as const;

export default function MarketPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t, locale } = useTranslations();
  const fxUsdThb = useAppSelector((s) => s.portfolio.summary.fxUsdThb) ?? 35;
  const { stocks, indices, globalIndices, loading, loadingGlobal } =
    useAppSelector((s) => s.market);
  const trendingStocks = useAppSelector((s) => s.market.trendingStocks);
  const loadingTrending = useAppSelector((s) => s.market.loadingTrending);

  const [activeAsset, setActiveAsset] = useState<(typeof ASSET_TABS)[number]["key"]>("us");
  const [assetStocks, setAssetStocks] = useState<Stock[]>([]);
  const [assetLoading, setAssetLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { gainers, losers } = useMemo(
    () => getGainersAndLosers(assetStocks.length ? assetStocks : stocks),
    [assetStocks, stocks],
  );

  const visibleStocks = assetStocks.length ? assetStocks : stocks;

  function isUsSymbol(symbol: string) {
    const exch = (SYMBOL_TO_META[symbol]?.exchange ?? "").toUpperCase();
    return exch !== "SET" && symbol.toUpperCase() in SYMBOL_TO_META;
  }

  function getCurrencyPrefix(symbol: string) {
    return isUsSymbol(symbol) ? "$" : "฿";
  }

  function goToDetail(symbol: string) {
    router.push(`/stocks/${symbol.toUpperCase()}`);
  }

  useEffect(() => {
    let cancelled = false;
    // Schedule state updates to avoid sync setState-in-effect warnings.
    queueMicrotask(() => {
      if (!cancelled) setAssetLoading(true);
    });
    dispatch(fetchAssetQuotes({ asset: activeAsset, limit: 30 }))
      .unwrap()
      .then((r) => {
        if (!cancelled) setAssetStocks(r.stocks);
      })
      .catch(() => {
        if (!cancelled) setAssetStocks([]);
      })
      .finally(() => {
        if (!cancelled) setAssetLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeAsset, dispatch]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    // Load popular stocks for the full-screen search modal
    if (trendingStocks.length === 0) dispatch(fetchTrendingStocks());
  }, [mobileSearchOpen, trendingStocks.length, dispatch]);

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
              {locale === "th"
                ? "ข้อมูลสด · อัปเดตทุก 60 วิ"
                : "Live · updates every 60s"}
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
                    <p className="text-sm font-semibold text-slate-700">
                      {getCurrencyPrefix(s.symbol)}
                      {s.price.toFixed(2)}
                    </p>
                    {isUsSymbol(s.symbol) && (
                      <p className="text-[10px] text-slate-400 tabular-nums">
                        1 USD ≈ {fxUsdThb.toFixed(2)} THB
                      </p>
                    )}
                    <span className="text-xs font-medium text-emerald-600">
                      +{s.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <ArrowUpRight
                    size={13}
                    className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0"
                  />
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
                    <p className="text-sm font-semibold text-slate-700">
                      {getCurrencyPrefix(s.symbol)}
                      {s.price.toFixed(2)}
                    </p>
                    {isUsSymbol(s.symbol) && (
                      <p className="text-[10px] text-slate-400 tabular-nums">
                        1 USD ≈ {fxUsdThb.toFixed(2)} THB
                      </p>
                    )}
                    <span className="text-xs font-medium text-red-600">
                      {s.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <ArrowUpRight
                    size={13}
                    className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Stock Search ────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5 flex-wrap">
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

          <div className="hidden sm:block flex-1 min-w-[220px]">
            <MarketSearch
              value={search}
              onValueChange={setSearch}
              onSelectSymbol={goToDetail}
              variant="desktop"
            />
          </div>
          <div className="text-xs text-slate-400 ml-auto">
            {assetLoading
              ? locale === "th"
                ? "กำลังโหลดข้อมูล..."
                : "Loading..."
              : locale === "th"
                ? `แสดง ${visibleStocks.length} รายการ`
                : `Showing ${visibleStocks.length} items`}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {locale === "th"
              ? "เลือกหมวดสินทรัพย์เพื่อหลีกเลี่ยงข้อจำกัด rate limit"
              : "Switch asset tabs to avoid rate-limit constraints"}
          </p>
        </div>
      </div>

      {/* Mobile: fixed search button + full-screen search modal */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20"
        >
          <Search size={16} />
          {locale === "th" ? "ค้นหาหุ้น" : "Search"}
        </button>

        {mobileSearchOpen && (
          <div className="fixed inset-0 z-50 bg-white">
            <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Search size={16} className="text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">
                  {locale === "th" ? "ค้นหาหุ้น" : "Stock Search"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4">
              <MarketSearch
                value={search}
                onValueChange={setSearch}
                onSelectSymbol={(sym) => {
                  setMobileSearchOpen(false);
                  goToDetail(sym);
                }}
                variant="mobile"
              />
              <p className="mt-3 text-xs text-slate-500">
                {locale === "th"
                  ? "พิมพ์ชื่อหุ้นหรือตัวย่อเพื่อค้นหา"
                  : "Type a symbol or name to search"}
              </p>

              {/* Popular / most searched (powered by Today's Hot Stocks) */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">
                    {locale === "th" ? "หุ้นยอดนิยม" : "Popular stocks"}
                  </p>
                </div>

                {loadingTrending && trendingStocks.length === 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-200 bg-white p-3 animate-pulse"
                      >
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-100 rounded mt-2" />
                      </div>
                    ))}
                  </div>
                ) : trendingStocks.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">
                    {locale === "th" ? "ยังไม่มีข้อมูลหุ้นยอดนิยม" : "No popular stocks available"}
                  </p>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {trendingStocks.slice(0, 8).map((s) => (
                      <button
                        key={s.symbol}
                        type="button"
                        onClick={() => {
                          setMobileSearchOpen(false);
                          goToDetail(s.symbol);
                        }}
                        className="rounded-2xl border border-slate-200 bg-white p-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {s.symbol}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {s.name}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-slate-800 tabular-nums">
                              ${Number(s.price ?? 0).toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-400 tabular-nums">
                              1 USD ≈ {fxUsdThb.toFixed(2)} THB
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Stock Screener Table ─────────────────────────────────────────── */}
      <StockScreenerTable
        title={locale === "th" ? "คัดกรองหุ้น" : "Stock Screener"}
        rows={visibleStocks}
        loading={loading || assetLoading}
        locale={locale}
        emptyMessage={t("market.noResults")}
        getRowId={(r) => r.symbol}
        onRowClick={(r) => goToDetail(r.symbol)}
        columns={[
          {
            key: "symbol",
            label: locale === "th" ? "สัญลักษณ์ / ชื่อ" : "Symbol / Name",
            align: "left",
            sortable: true,
            sortValue: (r) => r.symbol,
            render: (r) => (
              <div>
                <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {r.symbol}
                </p>
                <p className="text-xs text-slate-500 max-w-[220px] truncate">{r.name}</p>
              </div>
            ),
          },
          {
            key: "sector",
            label: locale === "th" ? "กลุ่มอุตสาหกรรม" : "Sector",
            align: "left",
            sortable: true,
            sortValue: (r) => r.sector,
            render: (r) =>
              r.sector ? (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                  {r.sector}
                </span>
              ) : (
                "—"
              ),
          },
          {
            key: "price",
            label: t("common.price"),
            align: "right",
            sortable: true,
            sortValue: (r) => r.price,
            render: (r) => (
              <div className="text-right">
                <div className="font-semibold text-slate-800">
                  {getCurrencyPrefix(r.symbol)}
                  {r.price.toFixed(2)}
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
            key: "changePercent",
            label: t("common.changePercent"),
            align: "right",
            sortable: true,
            sortValue: (r) => r.changePercent,
            render: (r) => (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[72px] px-2 py-0.5 rounded-full text-xs font-semibold",
                  getChangeBgColor(r.changePercent),
                )}
              >
                {formatPercent(r.changePercent)}
              </span>
            ),
          },
          {
            key: "change",
            label: t("common.change"),
            align: "right",
            sortable: true,
            sortValue: (r) => r.change,
            render: (r) => (
              <span className={cn("font-medium", getChangeColor(r.change))}>
                {r.change >= 0 ? "+" : ""}
                {r.change.toFixed(2)}
              </span>
            ),
          },
          {
            key: "volume",
            label: t("common.volume"),
            align: "right",
            sortable: true,
            sortValue: (r) => r.volume,
            render: (r) => <span className="text-slate-600">{formatVolume(r.volume)}</span>,
          },
          {
            key: "marketCap",
            label: t("market.marketCap"),
            align: "right",
            sortable: true,
            sortValue: (r) => r.marketCap,
            render: (r) => (
              <span className="text-slate-600">{formatMarketCap(r.marketCap)}</span>
            ),
          },
          {
            key: "peRatio",
            label: t("market.peRatio"),
            align: "right",
            sortable: true,
            sortValue: (r) => r.peRatio ?? null,
            render: (r) => <span className="text-slate-600">{r.peRatio?.toFixed(1) ?? "—"}</span>,
          },
          {
            key: "dividendYield",
            label: t("market.dividend"),
            align: "right",
            sortable: true,
            sortValue: (r) => r.dividendYield ?? null,
            render: (r) => (
              <span className="text-slate-600">
                {r.dividendYield ? `${r.dividendYield.toFixed(1)}%` : "—"}
              </span>
            ),
          },
        ]}
        renderMobileRow={(r) => (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {r.symbol}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold",
                    getChangeBgColor(r.changePercent),
                  )}
                >
                  {r.changePercent >= 0 ? "+" : ""}
                  {r.changePercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">{r.name}</p>
            </div>
            <div className="text-right shrink-0 ml-3 flex items-center gap-2">
              <div>
                <p className="font-semibold text-slate-800">
                  {getCurrencyPrefix(r.symbol)}
                  {r.price.toFixed(2)}
                </p>
                {isUsSymbol(r.symbol) && (
                  <p className="text-[10px] text-slate-400 tabular-nums">
                    1 USD ≈ {fxUsdThb.toFixed(2)} THB
                  </p>
                )}
                <p className="text-xs text-slate-500">Vol: {formatVolume(r.volume)}</p>
              </div>
              <ArrowUpRight
                size={13}
                className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0"
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}
