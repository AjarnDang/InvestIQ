"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { cn } from "@/src/utils/helpers";
import { useTranslations } from "@/src/i18n/useTranslations";
import { useAppSelector } from "@/src/store/hooks";
import type { NewsItem } from "@/src/types";

type Variant = "mobile" | "desktop";

interface NewsSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onSelectItem?: (item: NewsItem) => void;
  variant?: Variant;
  maxResults?: number;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s._-]/g, "");
}

export function NewsSearch({
  value,
  onValueChange,
  onSelectItem,
  variant = "desktop",
  maxResults = 12,
}: NewsSearchProps) {
  const { t, locale } = useTranslations();
  const news = useAppSelector((s) => s.market.news);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NewsItem[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const needle = normalize(trimmed);
    const filtered = news
      .filter((n) => {
        const hayTitle = normalize(n.title ?? "");
        const hayDesc = normalize(n.description ?? "");
        const haySource = normalize(n.source ?? "");
        return (
          hayTitle.includes(needle) ||
          hayDesc.includes(needle) ||
          haySource.includes(needle)
        );
      })
      .slice(0, maxResults);

    setResults(filtered);
    setLoading(false);
  }, [news, maxResults]);

  function handleChange(next: string) {
    onValueChange(next);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(() => runSearch(next), 220);
  }

  function selectItem(item: NewsItem) {
    setOpen(false);
    if (onSelectItem) {
      onSelectItem(item);
      return;
    }
    if (typeof window !== "undefined") {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }

  const isMobile = variant === "mobile";

  const headerText = useMemo(() => {
    const count = results.length;
    if (locale === "th") return `ผลการค้นหา · ${count} รายการ`;
    return `${count} result${count !== 1 ? "s" : ""}`;
  }, [results.length, locale]);

  return (
    <div className="relative">
      <Search
        size={13}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => value.trim() && setOpen(true)}
        placeholder={locale === "th" ? "ค้นหาข่าว" : t("common.search")}
        className={cn(
          "w-full flex-1 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500",
          isMobile ? "h-9" : "h-8",
        )}
      />

      {open && value.trim() && (
        <div
          className={cn(
            "absolute z-40 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden w-full",
            isMobile ? "left-0 right-0" : "right-0",
          )}
        >
          {loading ? (
            <div className="px-3 py-3 text-center text-xs text-slate-400">
              {t("common.loading")}
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-center text-xs text-slate-400">
              {locale === "th"
                ? `ไม่พบผลลัพธ์สำหรับ "${value.trim()}"`
                : `No results for "${value.trim()}"`}
            </div>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {headerText}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {results.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectItem(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {item.source} •{" "}
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      <ExternalLink size={10} className="text-slate-300" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

