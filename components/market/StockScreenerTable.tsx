"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/src/utils/helpers";

type SortDir = "asc" | "desc";

export type StockScreenerColumn<T> = {
  /** Unique column key (not necessarily a field name). */
  key: string;
  /** Header label */
  label: React.ReactNode;
  /** Text alignment */
  align?: "left" | "right" | "center";
  /** Enable click-to-sort for this column */
  sortable?: boolean;
  /** Sorting value for this column (defaults to empty string) */
  sortValue?: (row: T) => number | string | null | undefined;
  /** Cell renderer */
  render: (row: T) => React.ReactNode;
  /** Optional width utility */
  widthClassName?: string;
  /** Hide on mobile table (desktop-only columns) */
  hideOnMobile?: boolean;
  /** Header extra class */
  headerClassName?: string;
  /** Cell extra class */
  cellClassName?: string;
};

export interface StockScreenerTableProps<T> {
  /** Card title */
  title: string;
  /** Row data */
  rows: T[];
  /** Column definitions for desktop table */
  columns: Array<StockScreenerColumn<T>>;
  /** Loading flag for skeleton/empty states */
  loading?: boolean;
  /** i18n locale (used only for a couple of default strings) */
  locale: "th" | "en";
  /** Unique ID for each row */
  getRowId: (row: T) => string;
  /** Row click handler (optional) */
  onRowClick?: (row: T) => void;
  /** Optional right-side header content (buttons, filters, etc.) */
  headerRight?: React.ReactNode;
  /** Optional mobile renderer; when omitted, we fall back to a generic 2-line layout (symbol/name) if possible */
  renderMobileRow?: (row: T) => React.ReactNode;
  /** Empty state message (optional) */
  emptyMessage?: string;
}

export function StockScreenerTable<T>({
  title,
  rows,
  columns,
  loading = false,
  locale,
  getRowId,
  onRowClick,
  headerRight,
  renderMobileRow,
  emptyMessage,
}: StockScreenerTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    const col = columns.find((c) => c.key === sortField);
    if (!col?.sortable) return rows;
    const get = col.sortValue ?? (() => "");
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const an = typeof av === "number" ? av : Number.NaN;
      const bn = typeof bv === "number" ? bv : Number.NaN;
      if (!Number.isNaN(an) && !Number.isNaN(bn)) {
        return sortDir === "asc" ? an - bn : bn - an;
      }
      const as = String(av ?? "");
      const bs = String(bv ?? "");
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return copy;
  }, [rows, columns, sortField, sortDir]);

  function handleSort(key: string) {
    if (sortField === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(key);
      setSortDir("desc");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0 pt-2">
        {/* Mobile: card list */}
        <div className="divide-y divide-slate-100 md:hidden">
          {sortedRows.map((row) => {
            const id = getRowId(row);
            const clickable = typeof onRowClick === "function";
            return (
              <div
                key={id}
                className={cn(
                  "px-4 py-3 transition-colors group",
                  clickable && "hover:bg-slate-50 active:bg-slate-100 cursor-pointer",
                )}
                onClick={clickable ? () => onRowClick(row) : undefined}
              >
                {renderMobileRow ? (
                  renderMobileRow(row)
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{id}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {locale === "th" ? "แตะเพื่อดูรายละเอียด" : "Tap for details"}
                      </p>
                    </div>
                    {clickable && (
                      <ArrowUpRight
                        size={13}
                        className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {loading && rows.length === 0 && (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 animate-pulse"
                >
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

          {!loading && sortedRows.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-400">
              {emptyMessage ??
                (locale === "th" ? "ไม่พบข้อมูล" : "No results")}
            </p>
          )}
        </div>

        {/* Desktop: full table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none whitespace-nowrap",
                      col.sortable && "cursor-pointer hover:text-slate-700",
                      col.align === "right" ? "text-right" : "text-left",
                      col.widthClassName,
                      col.headerClassName,
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    {col.label}
                    {sortField === col.key && col.sortable && (
                      <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className={cn(
                    "border-b border-slate-100 transition-colors",
                    onRowClick && "hover:bg-slate-50 cursor-pointer group",
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={`${getRowId(row)}:${col.key}`}
                      className={cn(
                        "px-4 py-3",
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left",
                        col.cellClassName,
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}

              {loading &&
                rows.length === 0 &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-16 rounded bg-slate-200" />
                        <div className="h-2.5 w-28 rounded bg-slate-100" />
                      </div>
                    </td>
                    {Array.from({ length: Math.max(columns.length - 1, 1) }).map((__, j) => (
                      <td key={j} className="px-4 py-3 text-right">
                        <div className="h-3.5 w-14 rounded bg-slate-200 ml-auto" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && sortedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={Math.max(columns.length, 1)}
                    className="py-12 text-center text-sm text-slate-400"
                  >
                    {emptyMessage ??
                      (locale === "th" ? "ไม่พบข้อมูล" : "No results")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

