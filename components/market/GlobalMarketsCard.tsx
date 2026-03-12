import React from "react";
import { Globe2, Activity } from "lucide-react";
import type { MarketIndex } from "@/src/types";
import { useTranslations } from "@/src/i18n/useTranslations";
import { cn, getChangeBgColor } from "@/src/utils/helpers";
import { formatInteger } from "@/src/utils/formatters";

export interface GlobalMarketsCardProps {
  indices: MarketIndex[];
  loading?: boolean;
}

export function GlobalMarketsCard({ indices, loading }: GlobalMarketsCardProps) {
  const { t } = useTranslations();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100">
        <Globe2 size={14} className="text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-800">
          {t("home.globalMarkets")}
        </h3>
      </div>
      {(!indices.length || loading) ? (
        <div className="px-4 py-4 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-3.5 w-20 rounded bg-slate-200" />
              <div className="flex gap-2">
                <div className="h-3.5 w-14 rounded bg-slate-200" />
                <div className="h-5 w-14 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {indices.map((idx) => (
            <div
              key={idx.name}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Activity size={10} className="text-slate-400" />
                <span className="text-xs text-slate-700 font-medium">
                  {idx.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {idx.value > 1000
                    ? formatInteger(idx.value)
                    : idx.value.toFixed(2)}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums",
                    getChangeBgColor(idx.changePercent),
                  )}
                >
                  {idx.changePercent >= 0 ? "+" : ""}
                  {idx.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

