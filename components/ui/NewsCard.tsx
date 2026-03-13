import React from "react";
import { ExternalLink, Newspaper } from "lucide-react";
import type { NewsItem } from "@/src/types";
import { cn } from "@/src/utils/helpers";

export interface NewsCardProps {
  item: NewsItem;
  locale: "th" | "en";
  /** 
   * stock  = card-style for stock detail sidebar
   * news   = card-style for /news main grid
   * compact = single-row condensed style (list rows)
   */
  variant?: "stock" | "news" | "compact";
  className?: string;
}

export function NewsCard({ item, locale, variant = "stock", className }: NewsCardProps) {
  const dateLabel = React.useMemo(() => {
    try {
      return new Date(item.publishedAt).toLocaleString(
        locale === "th" ? "th-TH" : "en-US",
        { dateStyle: "medium", timeStyle: "short" },
      );
    } catch {
      return item.publishedAt;
    }
  }, [item.publishedAt, locale]);

  if (variant === "compact") {
    // Single-row compact variant (for dense lists / pagination)
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group flex items-start gap-3 rounded-xl transition-all",
          className,
        )}
      >
        <div className="shrink-0">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt=""
              className="md:h-24 md:w-32 h-16 w-24 rounded-md object-cover bg-slate-100"
              loading="lazy"
            />
          ) : (
            <div className="md:h-24 md:w-32 h-16 w-24 rounded-md bg-slate-100 flex items-center justify-center">
              <Newspaper size={16} className="text-slate-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[120px]">
              {item.source}
            </span>
            <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
              {dateLabel}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {item.title}
          </p>
          {item.description && (
            <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>
      </a>
    );
  }

  if (variant === "news") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group bg-white rounded-2xl border border-slate-200 border-t-2 p-4 flex flex-col gap-3 hover:shadow-md hover:border-indigo-200 hover:border-t-indigo-400 transition-all",
          className,
        )}
      >
        <div className="flex gap-3">
          <div className="shrink-0">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt=""
                className="h-16 w-24 rounded-lg object-cover bg-slate-100"
                loading="lazy"
              />
            ) : (
              <div className="h-16 w-24 rounded-lg bg-slate-100 flex items-center justify-center">
                <Newspaper size={18} className="text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {item.source}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                {dateLabel}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-3 group-hover:text-indigo-700 transition-colors flex-1">
              {item.title}
            </p>
            {item.description && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Newspaper size={9} />
                {item.source}
              </span>
              <ExternalLink
                size={11}
                className="text-slate-300 group-hover:text-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </a>
    );
  }

  // stock-detail variant
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex flex-col rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden",
        className,
      )}
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt=""
          className="h-24 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-24 w-full rounded-lg bg-slate-100 flex items-center justify-center">
          <Newspaper size={18} className="text-slate-400" />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {item.source}
          </span>
          <span className="text-[10px] text-slate-400 tabular-nums">
            {dateLabel}
          </span>
        </div>
        <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-3 group-hover:text-indigo-700 transition-colors">
          {item.title}
        </p>
        {item.description && (
          <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="mt-auto pt-1 flex items-center justify-between text-[10px] text-slate-400">
          <span>{locale === "th" ? "อ่านต่อ" : "Read more"}</span>
          <ExternalLink
            size={10}
            className="text-slate-300 group-hover:text-indigo-400 transition-colors"
          />
        </div>
      </div>
    </a>
  );
}

