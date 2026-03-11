"use client";

import React, { useState } from "react";
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Filter,
  Clock,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { fetchMarketNews } from "@/src/slices/marketSlice";
import { timeAgo } from "@/src/utils/formatters";
import { cn } from "@/src/utils/helpers";
import { getSourceBadgeClass, getSourceAccentClass } from "@/src/data/newsConfig";
import { useTranslations } from "@/src/i18n/useTranslations";

const ALL_SOURCES = ["All", "MarketWatch", "CNBC", "Reuters", "Bangkok Post"];

export default function NewsPage() {
  const dispatch = useAppDispatch();
  const { t, locale } = useTranslations();
  const { news, loadingNews } = useAppSelector((s) => s.market);
  const [activeSource, setActiveSource] = useState("All");

  const filtered =
    activeSource === "All"
      ? news
      : news.filter((n) => n.source === activeSource);

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t("news.title")}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {locale === "th" ? "ข่าวการเงินล่าสุดจากตลาดทั่วโลก" : "Latest financial news from global markets"}
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchMarketNews())}
          disabled={loadingNews}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loadingNews ? "animate-spin" : ""} />
          {locale === "th" ? "รีเฟรช" : "Refresh"}
        </button>
      </div>

      {/* ── Source Filter tabs ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        <Filter size={13} className="text-slate-400 shrink-0" />
        {ALL_SOURCES.map((src) => (
          <button
            key={src}
            onClick={() => setActiveSource(src)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeSource === src
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            {src}
            {src !== "All" && (
              <span className="ml-1.5 opacity-60">
                {news.filter((n) => n.source === src).length}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto shrink-0 text-xs text-slate-400">
          {filtered.length} {locale === "th" ? "บทความ" : "articles"}
        </span>
      </div>

      {/* ── Loading skeletons ───────────────────────────────────────────── */}
      {loadingNews && news.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3"
            >
              <div className="flex gap-2">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="h-4 w-16 rounded bg-slate-100" />
              </div>
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
              <div className="h-3 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {/* ── Responsive grid ─────────────────────────────────────────────── */}
      {!loadingNews && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const accentBorder = getSourceAccentClass(item.source);
            const isFeatured = i === 0 && activeSource === "All";

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group bg-white rounded-2xl border border-slate-200 border-t-2 p-4 flex flex-col gap-3",
                  "hover:shadow-md hover:border-indigo-200 hover:border-t-indigo-400 transition-all",
                  accentBorder,
                  isFeatured && "sm:col-span-2 lg:col-span-1",
                )}
              >
                {/* Source + time */}
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded",
                      getSourceBadgeClass(item.source),
                    )}
                  >
                    {item.source}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Clock size={9} />
                    {timeAgo(item.publishedAt)}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-3 group-hover:text-indigo-700 transition-colors flex-1">
                  {item.title}
                </p>

                {/* Description (only when available) */}
                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Newspaper size={9} />
                    {item.source}
                  </span>
                  <ExternalLink
                    size={11}
                    className="text-slate-300 group-hover:text-indigo-500 transition-colors"
                  />
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!loadingNews && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Newspaper size={22} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 text-center">
            {news.length === 0
              ? (locale === "th" ? "ไม่สามารถโหลดข่าวได้ กรุณาตรวจสอบการเชื่อมต่อ" : "Could not load news. Please check your connection.")
              : (locale === "th" ? `ไม่มีบทความจาก ${activeSource}` : `No articles from ${activeSource}`)}
          </p>
        </div>
      )}
    </div>
  );
}
