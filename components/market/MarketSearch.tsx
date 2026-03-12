"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ExternalLink } from "lucide-react";
import { cn } from "@/src/utils/helpers";
import { useTranslations } from "@/src/i18n/useTranslations";

interface SearchResult {
  symbol:   string;
  name:     string;
  exchange: string;
  type:     string;
  sector?:  string;
}

type Variant = "mobile" | "desktop";

interface MarketSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  onSelectSymbol?: (symbol: string) => void;
  variant?: Variant;
}

export function MarketSearch({
  value,
  onValueChange,
  onSelectSymbol,
  variant = "desktop",
}: MarketSearchProps) {
  const router = useRouter();
  const { t, locale } = useTranslations();

  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(next: string) {
    onValueChange(next);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(next), 280);
  }

  function goToSymbol(symbol: string) {
    setOpen(false);
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
    } else {
      router.push(`/stocks/${symbol.toUpperCase()}`);
    }
  }

  const isMobile = variant === "mobile";

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
        placeholder={
          isMobile ? t("market.searchStocks") : t("common.search")
        }
        className={cn(
          "w-full flex-1 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500",
          isMobile ? "h-9" : "h-8",
        )}
      />

      {open && value.trim() && (
        <div className={cn(
          "absolute z-40 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden w-full",
          isMobile ? "left-0 right-0" : "right-0",
        )}>
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
                  {locale === "th"
                    ? `ผลการค้นหา · ${results.length} รายการ`
                    : `${results.length} result${results.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {results.map((item) => (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => goToSymbol(item.symbol)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.symbol}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      <span>{item.exchange}</span>
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

