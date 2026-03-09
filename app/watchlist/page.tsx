"use client";

import React, { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { WatchlistItem } from "@/src/types";
import { formatDate } from "@/src/utils/formatters";
import { getChangeColor, getChangeBgColor, cn } from "@/src/utils/helpers";

export default function WatchlistPage() {
  const dispatch = useAppDispatch();
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
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="font-medium">{items.length}</span>
            <span className="text-slate-400">stocks</span>
          </div>
          {items.filter((i) => i.alertEnabled).length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Bell size={13} className="text-indigo-500" />
              <span className="font-medium">{items.filter((i) => i.alertEnabled).length}</span>
              <span className="text-slate-400">alerts</span>
            </div>
          )}
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          <Plus size={14} />
          <span className="hidden sm:inline">Add Stock</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">Add to Watchlist</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
              {availableToAdd.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">
                  All stocks are already in your watchlist
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
                    <div className="text-right flex-shrink-0 ml-4">
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
            <p className="text-slate-500 font-medium">Your watchlist is empty</p>
            <p className="text-sm text-slate-400 mt-1">Add stocks to monitor their performance</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus size={14} />
              Add Your First Stock
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Responsive grid: 1 col mobile, 2 cols tablet, 3 cols desktop */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item: WatchlistItem) => (
            <Card key={item.symbol} className="group overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-xl leading-none">{item.symbol}</h3>
                      <Badge variant="default" className="text-xs">{item.sector}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 truncate">{item.name}</p>
                  </div>
                  <button
                    onClick={() => dispatch(removeItem(item.symbol))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                    title="Remove from watchlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Price + Change */}
                <div className="mt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900 leading-none">
                        ฿{item.price.toFixed(2)}
                      </p>
                      <div
                        className={cn(
                          "mt-2 inline-flex items-center gap-1 text-sm font-semibold px-2 py-0.5 rounded-full",
                          getChangeBgColor(item.changePercent)
                        )}
                      >
                        {item.changePercent >= 0 ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {item.changePercent >= 0 ? "+" : ""}
                        {item.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 self-end">
                      {formatDate(item.addedAt)}
                    </p>
                  </div>
                </div>

                {/* Alert Section */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {editAlert === item.symbol ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 flex-shrink-0">Alert ฿</span>
                      <input
                        autoFocus
                        value={alertInput}
                        onChange={(e) => setAlertInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveAlert(item.symbol);
                          if (e.key === "Escape") setEditAlert(null);
                        }}
                        placeholder="Target price"
                        className="flex-1 h-8 rounded-lg border border-slate-200 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
                        type="number"
                      />
                      <Button size="icon-sm" variant="primary" onClick={() => handleSaveAlert(item.symbol)}>
                        ✓
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditAlert(null)}>
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.alertEnabled ? (
                          <Bell size={13} className="text-indigo-600 flex-shrink-0" />
                        ) : (
                          <BellOff size={13} className="text-slate-400 flex-shrink-0" />
                        )}
                        <span className="text-xs text-slate-500 truncate">
                          {item.alertEnabled && item.alertPrice
                            ? `Alert at ฿${item.alertPrice.toFixed(2)}`
                            : "No alert set"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {item.alertEnabled && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => dispatch(toggleAlert({ symbol: item.symbol, enabled: false }))}
                            title="Disable alert"
                          >
                            <BellOff size={12} />
                          </Button>
                        )}
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            setEditAlert(item.symbol);
                            setAlertInput(item.alertPrice?.toString() ?? "");
                          }}
                          title="Set alert price"
                        >
                          <Bell size={12} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
