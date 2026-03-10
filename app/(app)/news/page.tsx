"use client";

import React, { useState } from "react";
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { fetchMarketNews } from "@/src/slices/marketSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { timeAgo } from "@/src/utils/formatters";
import { cn } from "@/src/utils/helpers";

const ALL_SOURCES = ["All", "MarketWatch", "CNBC", "Reuters", "Bangkok Post"];

const SOURCE_CONFIG: Record<string, { bg: string; text: string }> = {
  "MarketWatch":  { bg: "bg-emerald-100", text: "text-emerald-700" },
  "CNBC":         { bg: "bg-red-100",     text: "text-red-700"     },
  "Reuters":      { bg: "bg-orange-100",  text: "text-orange-700"  },
  "Bangkok Post": { bg: "bg-blue-100",    text: "text-blue-700"    },
};
function sourceBadge(source: string) {
  const cfg = SOURCE_CONFIG[source];
  return cfg ? `${cfg.bg} ${cfg.text}` : "bg-slate-100 text-slate-600";
}

export default function NewsPage() {
  const dispatch    = useAppDispatch();
  const { news, loadingNews } = useAppSelector((s) => s.market);
  const [activeSource, setActiveSource] = useState("All");

  const filtered = activeSource === "All"
    ? news
    : news.filter((n) => n.source === activeSource);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Financial News</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Latest news from global and Thai financial markets
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchMarketNews())}
          disabled={loadingNews}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loadingNews ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Source Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        <Filter size={13} className="text-slate-400 flex-shrink-0" />
        {ALL_SOURCES.map((src) => (
          <button
            key={src}
            onClick={() => setActiveSource(src)}
            className={cn(
              "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeSource === src
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
      </div>

      {/* News List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper size={15} className="text-slate-500" />
              <CardTitle>
                {activeSource === "All" ? "All Sources" : activeSource}
              </CardTitle>
            </div>
            <span className="text-xs text-slate-400">{filtered.length} articles</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0 pb-2">
          {/* Loading skeletons */}
          {loadingNews && news.length === 0 && (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="h-4 w-16 rounded bg-slate-100" />
                  </div>
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                  <div className="h-3 w-3/4 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* News items */}
          {filtered.length > 0 && (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 px-4 md:px-5 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold",
                          sourceBadge(item.source)
                        )}
                      >
                        {item.source}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {timeAgo(item.publishedAt)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-700 transition-colors leading-snug mb-1">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex items-start pt-0.5">
                    <ExternalLink
                      size={13}
                      className="text-slate-300 group-hover:text-indigo-500 transition-colors"
                    />
                  </div>
                </a>
              ))}
            </div>
          )}

          {!loadingNews && filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-slate-400">
              {news.length === 0
                ? "Unable to load news. Check your connection."
                : `No articles from ${activeSource}`}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
