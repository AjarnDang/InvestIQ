"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import type { MarketIndex } from "@/src/types";
import { GLOBAL_INDEX_META } from "@/src/data/globalIndices";
import { formatInteger } from "@/src/utils/formatters";
import { getChangeColor, cn } from "@/src/utils/helpers";

const INDEX_FLAG: Record<string, string> = {
  "SET Index": "🇹🇭",
  "SET50":     "🇹🇭",
  "SET100":    "🇹🇭",
  "MAI":       "🇹🇭",
  "S&P 500":   "🇺🇸",
  "NASDAQ":    "🇺🇸",
  "Dow Jones": "🇺🇸",
  "USD/THB":   "$",
};

interface Props {
  /** SET / local market indices */
  indices: MarketIndex[];
  /** Global / US indices + forex (optional — omit for SET-only usage) */
  globalIndices?: MarketIndex[];
  loading?: boolean;
  loadingGlobal?: boolean;
  className?: string;
}

export function IndexBanner({
  indices,
  globalIndices = [],
  loading = false,
  loadingGlobal = false,
  className,
}: Props) {
  const bannerRef   = useRef<HTMLDivElement>(null);
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const dragScrollL = useRef(0);
  const [showLeft,  setShowLeft]  = useState(false);
  const [showRight, setShowRight] = useState(false);

  const allIndices = useMemo(
    () => [...indices, ...globalIndices],
    [indices, globalIndices]
  );
  const isLoading =
    (loading && indices.length === 0) ||
    (loadingGlobal && globalIndices.length === 0 && indices.length === 0);

  const updateArrows = useCallback(() => {
    const el = bannerRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const t = setTimeout(updateArrows, 120);
    return () => clearTimeout(t);
  }, [allIndices, isLoading, updateArrows]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = bannerRef.current;
    if (!el) return;
    isDragging.current  = true;
    dragStartX.current  = e.pageX - el.getBoundingClientRect().left;
    dragScrollL.current = el.scrollLeft;
    el.style.cursor     = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !bannerRef.current) return;
    e.preventDefault();
    const x = e.pageX - bannerRef.current.getBoundingClientRect().left;
    bannerRef.current.scrollLeft = dragScrollL.current - (x - dragStartX.current) * 1.4;
  }, []);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    if (bannerRef.current) {
      bannerRef.current.style.cursor     = "grab";
      bannerRef.current.style.userSelect = "";
    }
  }, []);

  const scrollBy = useCallback((dir: "left" | "right") => {
    bannerRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  }, []);

  return (
    <div className={cn("relative -mx-4 md:mx-0", className)}>
      {/* Left arrow — desktop only */}
      <button
        onClick={() => scrollBy("left")}
        aria-label="Scroll left"
        title="Scroll left"
        className={cn(
          "hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10",
          "h-7 w-7 items-center justify-center rounded-full",
          "bg-white shadow-md border border-slate-200 text-slate-500",
          "hover:text-indigo-600 hover:border-indigo-300 transition-all duration-150",
          showLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft size={15} />
      </button>

      {/* Scrollable strip */}
      <div
        ref={bannerRef}
        onScroll={updateArrows}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        className="flex gap-2 overflow-x-auto pb-1 px-4 md:px-0 scrollbar-hide md:cursor-grab"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm animate-pulse min-w-[100px] space-y-1.5"
              >
                <div className="h-2.5 w-16 rounded bg-slate-200" />
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-3 w-12 rounded bg-slate-100" />
              </div>
            ))
          : (
            <>
              {/* SET / local indices */}
              {indices.map((idx) => (
                <div
                  key={idx.name}
                  className="shrink-0 flex flex-col rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm min-w-[100px]"
                >
                  <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap mb-0.5">
                    {INDEX_FLAG[idx.name] ?? "🏳"} {idx.name}
                  </p>
                  <p className="text-sm font-bold text-slate-800 tabular-nums">
                    {formatInteger(idx.value)}
                  </p>
                  <div className={`flex items-center gap-0.5 text-[11px] font-semibold mt-0.5 ${getChangeColor(idx.changePercent)}`}>
                    {idx.changePercent >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {Math.abs(idx.changePercent).toFixed(2)}%
                  </div>
                </div>
              ))}

              {/* Global / US indices — shows placeholders while loadingGlobal */}
              {(() => {
                const items =
                  globalIndices.length > 0
                    ? globalIndices
                    : GLOBAL_INDEX_META.map((m) => ({
                        name: m.displayName,
                        value: 0,
                        change: 0,
                        changePercent: 0,
                      }));
                return items.map((idx) => {
                  const isForex       = idx.name === "USD/THB";
                  const flag          = INDEX_FLAG[idx.name] ?? "🌍";
                  const isPlaceholder = idx.value === 0 && loadingGlobal;
                  return (
                    <div
                      key={idx.name}
                      className={cn(
                        "shrink-0 flex flex-col rounded-xl border bg-white px-3 py-2 shadow-sm min-w-[100px]",
                        isPlaceholder ? "border-slate-100 animate-pulse" : "border-slate-200"
                      )}
                    >
                      <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap mb-0.5">
                        {flag} {idx.name}
                      </p>
                      {isPlaceholder ? (
                        <>
                          <div className="h-4 w-16 rounded bg-slate-200 mt-0.5" />
                          <div className="h-3 w-10 rounded bg-slate-100 mt-1" />
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-slate-800 tabular-nums">
                            {isForex ? idx.value.toFixed(2) : formatInteger(idx.value)}
                          </p>
                          <div className={`flex items-center gap-0.5 text-[11px] font-semibold mt-0.5 ${getChangeColor(idx.changePercent)}`}>
                            {idx.changePercent >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                            {Math.abs(idx.changePercent).toFixed(2)}%
                          </div>
                        </>
                      )}
                    </div>
                  );
                });
              })()}

              {/* Loading refresh indicator */}
              {loadingGlobal && globalIndices.length > 0 && (
                <div className="shrink-0 flex items-center self-center ml-1">
                  <RefreshCw size={11} className="text-slate-300 animate-spin" />
                </div>
              )}

              {/* Live indicator */}
              {!loadingGlobal && allIndices.length > 0 && (
                <div className="shrink-0 flex items-center self-center ml-1 pr-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Live
                  </div>
                </div>
              )}
            </>
          )}
      </div>

      {/* Right arrow — desktop only */}
      <button
        onClick={() => scrollBy("right")}
        aria-label="Scroll right"
        title="Scroll right"
        className={cn(
          "hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10",
          "h-7 w-7 items-center justify-center rounded-full",
          "bg-white shadow-md border border-slate-200 text-slate-500",
          "hover:text-indigo-600 hover:border-indigo-300 transition-all duration-150",
          showRight ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
