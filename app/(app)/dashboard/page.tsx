"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { PerformanceChart } from "@/components/charts/PerformanceChart";
import { PortfolioAllocationChart } from "@/components/charts/PortfolioAllocationChart";
import type { Holding, TableColumn } from "@/src/types";
import {
  formatCurrency,
  formatInteger,
  formatPercent,
} from "@/src/utils/formatters";
import { getChangeColor, cn } from "@/src/utils/helpers";
import { ProfileTabsBar } from "@/components/layout/ProfileTabsBar";
import { useTranslations } from "@/src/i18n/useTranslations";
import { StockScreenerTable } from "@/components/market/StockScreenerTable";

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { t, locale } = useTranslations();
  const { summary, holdings, performance, allocation } = useAppSelector((s) => s.portfolio);
  const [tab, setTab] = useState<"overview" | "holdings">("overview");

  const tabs = [
    { key: "overview" as const, label: locale === "th" ? "ภาพรวม" : "Overview"  },
    { key: "holdings" as const, label: t("dashboard.holdings")                   },
  ];

  const columns: TableColumn<Holding & Record<string, unknown>>[] = [
    {
      key: "symbol",
      label: locale === "th" ? "สัญลักษณ์" : "Symbol",
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.symbol}</p>
          <p className="text-xs text-slate-500 max-w-[140px] truncate">{row.name}</p>
        </div>
      ),
    },
    {
      key: "sector",
      label: t("dashboard.sector"),
      render: (v) => (
        <Badge variant="default" className="text-xs whitespace-nowrap">
          {v as string}
        </Badge>
      ),
    },
    {
      key: "quantity",
      label: locale === "th" ? "จำนวน" : "Qty",
      align: "right",
      sortable: true,
      render: (v) => formatInteger(v as number),
    },
    {
      key: "avgCost",
      label: t("dashboard.avgCost"),
      align: "right",
      sortable: true,
      render: (v) => `฿${(v as number).toFixed(2)}`,
    },
    {
      key: "currentPrice",
      label: t("dashboard.currentPrice"),
      align: "right",
      sortable: true,
      render: (v) => `฿${(v as number).toFixed(2)}`,
    },
    {
      key: "marketValue",
      label: locale === "th" ? "มูลค่าตลาด" : "Market Value",
      align: "right",
      sortable: true,
      render: (v) => formatCurrency(v as number),
    },
    {
      key: "unrealizedPnL",
      label: "P&L",
      align: "right",
      sortable: true,
      render: (v, row) => (
        <div className="text-right">
          <p className={`font-semibold ${getChangeColor(v as number)}`}>
            {(v as number) >= 0 ? "+" : ""}{formatCurrency(v as number)}
          </p>
          <p className={`text-xs ${getChangeColor(row.unrealizedPnLPercent as number)}`}>
            {formatPercent(row.unrealizedPnLPercent as number)}
          </p>
        </div>
      ),
    },
    {
      key: "weight",
      label: t("dashboard.weight"),
      align: "right",
      sortable: true,
      render: (v, row) => (
        <div className="flex items-center justify-end gap-2">
          <span className="text-slate-600">{(v as number).toFixed(1)}%</span>
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${Math.min(row.weight as number, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <ProfileTabsBar />

      {/* ── Portfolio Summary Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.totalValue")}
          value={formatCurrency(summary.totalValue)}
          change={summary.dailyPnLPercent}
          changeLabel={t("common.today")}
          icon={<Wallet size={16} className="text-indigo-600" />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title={locale === "th" ? "ต้นทุนรวม" : "Total Cost"}
          value={formatCurrency(summary.totalCost)}
          icon={<PieChartIcon size={16} className="text-slate-500" />}
          iconBg="bg-slate-50"
        />
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

      {/* Second stat row: total holdings + cash */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-2 lg:max-w-sm">
        <StatCard
          title={t("dashboard.holdings")}
          value={`${holdings.length} ${locale === "th" ? "หุ้น" : "stocks"}`}
          icon={<Layers size={16} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title={locale === "th" ? "เงินสด" : "Cash Balance"}
          value={formatCurrency(summary.cashBalance)}
          icon={<Wallet size={16} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
              tab === key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ─────────────────────────────────────────────────── */}
      {tab === "overview" && (
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

          {/* Sector Breakdown table */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === "th" ? "สรุปตามกลุ่มอุตสาหกรรม" : "Sector Breakdown"}</CardTitle>
            </CardHeader>
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
          </Card>
        </div>
      )}

      {/* ── Holdings tab ─────────────────────────────────────────────────── */}
      {tab === "holdings" && (
        <>
          <StockScreenerTable
            title={t("dashboard.holdings")}
            rows={holdings}
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
                render: (r) => `฿${r.avgCost.toFixed(2)}`,
              },
              {
                key: "price",
                label: t("dashboard.currentPrice"),
                align: "right",
                sortable: true,
                sortValue: (r) => r.currentPrice,
                render: (r) => `฿${r.currentPrice.toFixed(2)}`,
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
                      <p className="font-medium text-slate-700">฿{h.avgCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">{t("common.price")}</p>
                      <p className="font-medium text-slate-700">฿{h.currentPrice.toFixed(2)}</p>
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
        </>
      )}
    </div>
  );
}
