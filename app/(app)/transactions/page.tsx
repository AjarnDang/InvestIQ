"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Filter, ArrowUpDown, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { updateFilter, resetFilter } from "@/src/slices/transactionSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import type { Transaction, TransactionType, TransactionStatus } from "@/src/types";
import { formatCurrency, formatDate } from "@/src/utils/formatters";
import { TRANSACTION_TYPE_CONFIG, STATUS_CONFIG, cn } from "@/src/utils/helpers";
import { ProfileTabsBar } from "@/components/layout/ProfileTabsBar";
import { useTranslations } from "@/src/i18n/useTranslations";
import { SYMBOL_TO_META } from "@/src/data/sectorMap";

export default function TransactionsPage() {
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const { t, locale } = useTranslations();
  const { transactions, filter } = useAppSelector((s) => s.transactions);
  const fxUsdThb = useAppSelector((s) => s.portfolio.summary.fxUsdThb) ?? 35;
  const [showFilters, setShowFilters] = React.useState(false);

  function isUsSymbol(symbol: string | undefined) {
    if (!symbol) return false;
    const exch = (SYMBOL_TO_META[symbol]?.exchange ?? "").toUpperCase();
    return exch !== "SET" && symbol.toUpperCase() in SYMBOL_TO_META;
  }

  const TYPE_OPTIONS: Array<{ value: TransactionType | "ALL"; label: string }> = [
    { value: "ALL",      label: t("transactions.allTypes")  },
    { value: "BUY",      label: t("transactions.buy")       },
    { value: "SELL",     label: t("transactions.sell")      },
    { value: "DIVIDEND", label: t("transactions.dividend")  },
    { value: "DEPOSIT",  label: locale === "th" ? "ฝากเงิน" : "Deposit"  },
    { value: "WITHDRAW", label: locale === "th" ? "ถอนเงิน" : "Withdraw" },
  ];

  const STATUS_OPTIONS: Array<{ value: TransactionStatus | "ALL"; label: string }> = [
    { value: "ALL",       label: t("transactions.allStatuses") },
    { value: "COMPLETED", label: t("transactions.completed")   },
    { value: "PENDING",   label: t("transactions.pending")     },
    { value: "CANCELLED", label: t("transactions.cancelled")   },
  ];

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      if (filter.type !== "ALL" && txn.type !== filter.type) return false;
      if (filter.status !== "ALL" && txn.status !== filter.status) return false;
      if (filter.dateFrom && txn.date < filter.dateFrom) return false;
      if (filter.dateTo && txn.date > filter.dateTo) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return (
          txn.id.toLowerCase().includes(q) ||
          txn.symbol?.toLowerCase().includes(q) ||
          txn.name?.toLowerCase().includes(q) ||
          txn.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, filter]);

  const stats = useMemo(() => {
    const buys = transactions.filter((t) => t.type === "BUY").reduce((s, t) => s + t.amount, 0);
    const sells = transactions.filter((t) => t.type === "SELL").reduce((s, t) => s + t.amount, 0);
    const dividends = transactions.filter((t) => t.type === "DIVIDEND").reduce((s, t) => s + t.amount, 0);
    const totalFees = transactions.reduce((s, t) => s + t.fee, 0);
    return { buys, sells, dividends, totalFees };
  }, [transactions]);

  return (
    <div className="space-y-4 md:space-y-6">
      <ProfileTabsBar />
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard
          title={locale === "th" ? "ซื้อทั้งหมด" : "Total Bought"}
          value={formatCurrency(stats.buys)}
          icon={<ArrowUpDown size={16} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title={locale === "th" ? "ขายทั้งหมด" : "Total Sold"}
          value={formatCurrency(stats.sells)}
          icon={<ArrowUpDown size={16} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title={t("transactions.dividend")}
          value={formatCurrency(stats.dividends)}
          icon={<DollarSign size={16} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title={locale === "th" ? "ค่าธรรมเนียมรวม" : "Total Fees"}
          value={formatCurrency(stats.totalFees)}
          icon={<Filter size={16} className="text-slate-500" />}
          iconBg="bg-slate-50"
        />
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle>{t("transactions.title")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => dispatch(resetFilter())} className="hidden md:flex">
                  {locale === "th" ? "รีเซ็ต" : "Reset"}
                </Button>
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    showFilters
                      ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Filter size={12} />
                  {t("common.filter")}
                  {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>
            </div>

            {/* Filters panel */}
            <div className={cn(showFilters ? "block" : "hidden md:block")}>
              <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
                {/* Search */}
                <input
                  value={filter.search}
                  onChange={(e) => dispatch(updateFilter({ search: e.target.value }))}
                  placeholder={t("transactions.searchPlaceholder")}
                  className="h-9 w-full md:w-52 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                  {/* Type */}
                  <select
                    title="Transaction Type"
                    value={filter.type}
                    onChange={(e) => dispatch(updateFilter({ type: e.target.value as TransactionType | "ALL" }))}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {/* Status */}
                  <select
                    title="Transaction Status"
                    value={filter.status}
                    onChange={(e) => dispatch(updateFilter({ status: e.target.value as TransactionStatus | "ALL" }))}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-2">
                  <input
                    title="From Date"
                    type="date"
                    value={filter.dateFrom ?? ""}
                    onChange={(e) => dispatch(updateFilter({ dateFrom: e.target.value || null }))}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    title="To Date"
                    type="date"
                    value={filter.dateTo ?? ""}
                    onChange={(e) => dispatch(updateFilter({ dateTo: e.target.value || null }))}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {/* Mobile Reset */}
                <button
                  onClick={() => dispatch(resetFilter())}
                  className="md:hidden text-xs text-indigo-600 hover:text-indigo-700 underline text-left"
                >
                  {locale === "th" ? "รีเซ็ตตัวกรอง" : "Reset filters"}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {locale === "th"
                ? `แสดง ${filtered.length} จาก ${transactions.length} รายการ`
                : `Showing ${filtered.length} of ${transactions.length} transactions`
              }
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0 pt-0">
          {/* Mobile: card list */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">{t("transactions.noResults")}</p>
            ) : (
              filtered.map((txn: Transaction) => {
                const cfg = TRANSACTION_TYPE_CONFIG[txn.type];
                const statusCfg = STATUS_CONFIG[txn.status];
                return (
                  <div
                    key={txn.id}
                    className={cn("px-4 py-3", txn.symbol && "cursor-pointer hover:bg-slate-50 transition-colors")}
                    onClick={() => txn.symbol && router.push(`/stocks/${encodeURIComponent(txn.symbol)}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold shrink-0", cfg.color)}>
                          {cfg.label}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {txn.symbol ?? txn.type}
                            {txn.quantity && (
                              <span className="text-slate-500 font-normal"> × {txn.quantity.toLocaleString()}</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{formatDate(txn.date)}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-sm font-bold", cfg.sign > 0 ? "text-emerald-600" : "text-red-600")}>
                          {cfg.sign > 0 ? "+" : "-"}{formatCurrency(txn.amount)}
                        </p>
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>
                    {txn.note && (
                      <p className="mt-1.5 text-xs text-slate-400 pl-0.5 truncate">{txn.note}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop: full table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {[
                    { label: t("transactions.date"),   right: false },
                    { label: t("transactions.type"),   right: false },
                    { label: locale === "th" ? "หุ้น / รายละเอียด" : "Stock / Description", right: false },
                    { label: t("transactions.shares"), right: true  },
                    { label: t("common.price"),        right: true  },
                    { label: t("transactions.total"),  right: true  },
                    { label: locale === "th" ? "ค่าธรรมเนียม" : "Fee", right: true },
                    { label: t("transactions.status"), right: false },
                    { label: t("transactions.notes"),  right: false },
                  ].map(({ label, right }) => (
                    <th
                      key={label}
                      className={cn(
                        "px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap",
                        right ? "text-right" : "text-left"
                      )}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-slate-400">{t("transactions.noResults")}</td>
                  </tr>
                ) : (
                  filtered.map((txn: Transaction) => {
                    const cfg = TRANSACTION_TYPE_CONFIG[txn.type];
                    const statusCfg = STATUS_CONFIG[txn.status];
                    return (
                      <tr
                        key={txn.id}
                        className={cn(
                          "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                          txn.symbol && "cursor-pointer",
                        )}
                        onClick={() => txn.symbol && router.push(`/stocks/${encodeURIComponent(txn.symbol)}`)}
                      >
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(txn.date)}</td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold", cfg.color)}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {txn.symbol ? (
                            <div>
                              <p className="font-semibold text-slate-800">{txn.symbol}</p>
                              <p className="text-xs text-slate-500 max-w-[180px] truncate">{txn.name}</p>
                            </div>
                          ) : (
                            <span className="text-slate-600">{txn.type}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {txn.quantity ? txn.quantity.toLocaleString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {txn.price ? (
                            <div className="text-right">
                              <div className="text-slate-600">
                                {isUsSymbol(txn.symbol) ? "$" : "฿"}
                                {txn.price.toFixed(2)}
                              </div>
                              {isUsSymbol(txn.symbol) && (
                                <div className="text-[10px] text-slate-400 tabular-nums">
                                  1 USD ≈ {fxUsdThb.toFixed(2)} THB
                                </div>
                              )}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className={cn("px-4 py-3 text-right font-semibold", cfg.sign > 0 ? "text-emerald-600" : "text-red-600")}>
                          {cfg.sign > 0 ? "+" : "-"}{formatCurrency(txn.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 text-xs">
                          {txn.fee > 0 ? formatCurrency(txn.fee) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusCfg.color)}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">
                          {txn.note ?? "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
