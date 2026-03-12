import React, { useMemo } from "react";
import { Gauge } from "lucide-react";
import { useTranslations } from "@/src/i18n/useTranslations";
import type { TrendingStock } from "@/src/types";
import { cn } from "@/src/utils/helpers";

const FG_ZONES = [
  { max: 25, label: "Extreme Fear", color: "#ef4444", bg: "bg-red-50", text: "text-red-500" },
  { max: 45, label: "Fear",         color: "#f97316", bg: "bg-orange-50", text: "text-orange-500" },
  { max: 55, label: "Neutral",      color: "#eab308", bg: "bg-yellow-50", text: "text-yellow-600" },
  { max: 75, label: "Greed",        color: "#22c55e", bg: "bg-emerald-50", text: "text-emerald-600" },
  { max: 100, label: "Extreme Greed", color: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
] as const;

function getFGZone(value: number) {
  return FG_ZONES.find((z) => value <= z.max) ?? FG_ZONES[FG_ZONES.length - 1];
}

export interface FearGreedCardProps {
  trendingStocks: TrendingStock[];
}

export function FearGreedCard({ trendingStocks }: FearGreedCardProps) {
  const { t, locale } = useTranslations();

  const value = useMemo(() => {
    if (!trendingStocks.length) return 42;
    const gainers = trendingStocks.filter((s) => s.changePercent > 0).length;
    const ratio = gainers / trendingStocks.length;
    const avgMagnitude =
      trendingStocks.reduce((sum, s) => sum + Math.abs(s.changePercent), 0) /
      trendingStocks.length;
    const momentumBoost = Math.min((avgMagnitude / 5) * 10, 20);
    const raw = ratio * 100 + (ratio > 0.5 ? momentumBoost : -momentumBoost);
    return Math.max(5, Math.min(95, Math.round(raw)));
  }, [trendingStocks]);

  const zone = getFGZone(value);
  const rotation = (value / 100) * 180 - 90;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100">
        <Gauge size={14} className="text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-800">
          {t("home.fearGreed")}
        </h3>
        <span className="ml-auto text-[10px] text-slate-400">
          {locale === "th" ? "ตลาดสหรัฐฯ" : "US Market"}
        </span>
      </div>

      <div className="px-4 py-4">
        <div className="relative mx-auto w-40 h-20 overflow-hidden mb-3">
          <div
            className="absolute inset-0 rounded-t-full"
            style={{
              background:
                "conic-gradient(from 270deg at 50% 100%, #ef4444 0deg, #f97316 36deg, #eab308 72deg, #22c55e 108deg, #16a34a 144deg, #16a34a 180deg, transparent 180deg)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full bg-white"
            style={{ width: "68%", height: "68%" }}
          />
          <div
            className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-700"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              width: "2px",
              height: "50%",
              background: "#1e293b",
              borderRadius: "2px 2px 0 0",
            }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-3 w-3 rounded-full bg-slate-800 border-2 border-white z-10" />
        </div>

        <div className="text-center mb-3">
          <span className={cn("text-3xl font-black tabular-nums", zone.text)}>
            {value}
          </span>
          <p className={cn("text-xs font-bold mt-0.5", zone.text)}>{zone.label}</p>
        </div>

        <div
          className="relative h-2.5 rounded-full overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #16a34a)",
          }}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white shadow-md transition-all duration-700"
            style={{ left: `calc(${value}% - 8px)`, background: zone.color }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
          <span>{locale === "th" ? "กลัว" : "Fear"}</span>
          <span>{locale === "th" ? "ปกติ" : "Neutral"}</span>
          <span>{locale === "th" ? "โลภ" : "Greed"}</span>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
          {locale === "th"
            ? "คำนวณจาก US Trending Stocks · อัปเดตทุก 2 นาที"
            : "Calculated from US trending stocks · updated every 2 minutes"}
        </p>
      </div>
    </div>
  );
}

