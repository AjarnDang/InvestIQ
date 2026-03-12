"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Bell,
  BellOff,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import {
  removeItem,
  toggleAlert,
  setAlertPrice,
  addItem,
} from "@/src/slices/watchlistSlice";
import { ProfileTabsBar } from "@/components/layout/ProfileTabsBar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { WatchlistItem } from "@/src/types";
import { formatDate } from "@/src/utils/formatters";
import { getChangeColor, getChangeBgColor, cn } from "@/src/utils/helpers";
import { useTranslations } from "@/src/i18n/useTranslations";
import { StockScreenerTable } from "@/components/market/StockScreenerTable";

export default function WatchlistPage() {
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const { t, locale } = useTranslations();
  const { items } = useAppSelector((s) => s.watchlist);
  const allStocks = useAppSelector((s) => s.market.stocks);

  const [editAlert, setEditAlert] = useState<string | null>(null);
  const [alertInput, setAlertInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const watchedSymbols = new Set(items.map((i) => i.symbol));
  const availableToAdd = allStocks.filter((s) => !watchedSymbols.has(s.symbol));

  const handleSaveAlert = (symbol: string) => {
    const price = parseFloat(alertInput);
    if (!isNaN(price) && price > 0) {
      dispatch(setAlertPrice({ symbol, price }));
      dispatch(toggleAlert({ symbol, enabled: true }));
    }
    setEditAlert(null);
    setAlertInput("");
  };

  const handleAddStock = (symbol: string) => {
    const stock = allStocks.find((s) => s.symbol === symbol);
    if (!stock) return;
    dispatch(
      addItem({
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        alertEnabled: false,
        addedAt: new Date().toISOString().split("T")[0],
      })
    );
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <ProfileTabsBar />
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-medium">{items.length}</span>
            <span className="text-slate-400">{locale === "th" ? "หุ้น" : "stocks"}</span>
          </div>
          {items.filter((i) => i.alertEnabled).length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Bell size={13} className="text-indigo-500" />
              <span className="font-medium">{items.filter((i) => i.alertEnabled).length}</span>
              <span className="text-slate-400">{locale === "th" ? "แจ้งเตือน" : "alerts"}</span>
            </div>
          )}
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={14} />
          <span className="hidden sm:inline">{t("watchlist.addStock")}</span>
          <span className="sm:hidden">{t("common.add")}</span>
        </Button>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">{t("watchlist.addButton")}</h3>
              <button
                title="Close modal"
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
              {availableToAdd.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">
                  {locale === "th" ? "หุ้นทั้งหมดอยู่ในรายการติดตามแล้ว" : "All stocks are already in your watchlist"}
                </p>
              ) : (
                availableToAdd.map((s) => (
                  <button
                    key={s.symbol}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                    onClick={() => handleAddStock(s.symbol)}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">{s.symbol}</p>
                      <p className="text-xs text-slate-500 truncate">{s.name}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-medium text-slate-700">฿{s.price.toFixed(2)}</p>
                      <span className={cn("text-xs font-semibold", getChangeColor(s.changePercent))}>
                        {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">{t("watchlist.emptyTitle")}</p>
            <p className="text-sm text-slate-400 mt-1">{t("watchlist.emptySubtitle")}</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus size={14} />
              {locale === "th" ? "เพิ่มหุ้นตัวแรก" : "Add Your First Stock"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <StockScreenerTable
          title={t("watchlist.title")}
          rows={items}
          loading={false}
          locale={locale}
          emptyMessage={t("watchlist.emptyTitle")}
          getRowId={(r) => r.symbol}
          onRowClick={(r) => router.push(`/stocks/${encodeURIComponent(r.symbol)}`)}
          columns={[
            {
              key: "symbol",
              label: locale === "th" ? "สัญลักษณ์ / ชื่อ" : "Symbol / Name",
              align: "left",
              sortable: true,
              sortValue: (r) => r.symbol,
              render: (r) => (
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {r.symbol}
                    </p>
                    <Badge variant="default" className="text-xs whitespace-nowrap">
                      {r.sector}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 max-w-[220px] truncate">{r.name}</p>
                </div>
              ),
            },
            {
              key: "price",
              label: t("common.price"),
              align: "right",
              sortable: true,
              sortValue: (r) => r.price,
              render: (r) => <span className="font-semibold text-slate-800">฿{r.price.toFixed(2)}</span>,
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
                    "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                    getChangeBgColor(r.changePercent),
                  )}
                >
                  {r.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {r.changePercent >= 0 ? "+" : ""}
                  {r.changePercent.toFixed(2)}%
                </span>
              ),
            },
            {
              key: "alert",
              label: locale === "th" ? "แจ้งเตือน" : "Alert",
              align: "left",
              sortable: false,
              render: (r) => (
                <div onClick={(e) => e.stopPropagation()}>
                  {editAlert === r.symbol ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 shrink-0">Alert ฿</span>
                      <input
                        autoFocus
                        value={alertInput}
                        onChange={(e) => setAlertInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveAlert(r.symbol);
                          if (e.key === "Escape") setEditAlert(null);
                        }}
                        placeholder={locale === "th" ? "ราคาเป้าหมาย" : "Target price"}
                        className="w-28 h-8 rounded-lg border border-slate-200 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        type="number"
                      />
                      <Button size="icon-sm" variant="primary" onClick={() => handleSaveAlert(r.symbol)}>
                        ✓
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditAlert(null)}>
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {r.alertEnabled ? (
                        <Bell size={13} className="text-indigo-600 shrink-0" />
                      ) : (
                        <BellOff size={13} className="text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs text-slate-500 truncate max-w-[180px]">
                        {r.alertEnabled && r.alertPrice
                          ? `${t("watchlist.alertPrice")}: ฿${r.alertPrice.toFixed(2)}`
                          : locale === "th"
                            ? "ไม่ได้ตั้งการแจ้งเตือน"
                            : "No alert set"}
                      </span>
                      <div className="flex items-center gap-1">
                        {r.alertEnabled && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => dispatch(toggleAlert({ symbol: r.symbol, enabled: false }))}
                            title="Disable alert"
                          >
                            <BellOff size={12} />
                          </Button>
                        )}
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            setEditAlert(r.symbol);
                            setAlertInput(r.alertPrice?.toString() ?? "");
                          }}
                          title="Set alert price"
                        >
                          <Bell size={12} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "addedAt",
              label: locale === "th" ? "เพิ่มเมื่อ" : "Added",
              align: "right",
              sortable: true,
              sortValue: (r) => r.addedAt,
              render: (r) => <span className="text-xs text-slate-400">{formatDate(r.addedAt)}</span>,
            },
            {
              key: "actions",
              label: "",
              align: "right",
              sortable: false,
              render: (r) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => dispatch(removeItem(r.symbol))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ),
              widthClassName: "w-12",
            },
          ]}
          renderMobileRow={(r) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-800 text-lg leading-none group-hover:text-indigo-600 transition-colors">
                      {r.symbol}
                    </p>
                    <Badge variant="default" className="text-xs">
                      {r.sector}
                    </Badge>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                        getChangeBgColor(r.changePercent),
                      )}
                    >
                      {r.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {r.changePercent >= 0 ? "+" : ""}
                      {r.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 truncate">{r.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-slate-900 leading-none">฿{r.price.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(r.addedAt)}</p>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {r.alertEnabled ? (
                    <Bell size={13} className="text-indigo-600 shrink-0" />
                  ) : (
                    <BellOff size={13} className="text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs text-slate-500 truncate">
                    {r.alertEnabled && r.alertPrice
                      ? `${t("watchlist.alertPrice")}: ฿${r.alertPrice.toFixed(2)}`
                      : locale === "th"
                        ? "ไม่ได้ตั้งการแจ้งเตือน"
                        : "No alert set"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => {
                      setEditAlert(r.symbol);
                      setAlertInput(r.alertPrice?.toString() ?? "");
                    }}
                    title="Set alert price"
                  >
                    <Bell size={12} />
                  </Button>
                  <button
                    onClick={() => dispatch(removeItem(r.symbol))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
