"use client";

import React, { useEffect, useState } from "react";
import { Gauge, RefreshCw } from "lucide-react";
import { useTranslations } from "@/src/i18n/useTranslations";
import { cn } from "@/src/utils/helpers";
import { useAppDispatch } from "@/src/store/hooks";
import { fetchFearGreed } from "@/src/slices/marketSlice";

const FG_ZONES = [
  { max: 25, label: "Extreme Fear", color: "#ef4444", bg: "bg-red-50", text: "text-red-500" },
  { max: 45, label: "Fear", color: "#f97316", bg: "bg-orange-50", text: "text-orange-500" },
  { max: 55, label: "Neutral", color: "#eab308", bg: "bg-yellow-50", text: "text-yellow-600" },
  { max: 75, label: "Greed", color: "#22c55e", bg: "bg-emerald-50", text: "text-emerald-600" },
  { max: 100, label: "Extreme Greed", color: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
] as const;

function getFGZone(value: number) {
  return FG_ZONES.find((z) => value <= z.max) ?? FG_ZONES[FG_ZONES.length - 1];
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
  previousClose: number | null;
  weekAgo: number | null;
  monthAgo: number | null;
  yearAgo: number | null;
  source: string;
}

export interface FearGreedCardProps {
  /** If provided, overrides API fetch (e.g. for SSR or parent-provided data). */
  data?: FearGreedData | null;
}

export function FearGreedCard({ data: dataProp }: FearGreedCardProps) {
  const { t, locale } = useTranslations();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<FearGreedData | null>(dataProp ?? null);
  const [loading, setLoading] = useState(!dataProp);
  const [error, setError] = useState<string | null>(null);

  const fetchFng = React.useCallback(async () => {
    if (dataProp != null) return;
    setLoading(true);
    setError(null);
    dispatch(fetchFearGreed())
      .unwrap()
      .then((r) => setData(r))
      .catch(() => {
        setError(locale === "th" ? "โหลดไม่สำเร็จ" : "Failed to load");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [dataProp, dispatch, locale]);

  useEffect(() => {
    if (dataProp != null) {
      setData(dataProp);
      setLoading(false);
      return;
    }
    fetchFng();
  }, [dataProp, fetchFng]);

  const effective = dataProp ?? data;
  const value = effective?.value ?? 0;
  const zone = getFGZone(value);
  const rotation = (value / 100) * 180 - 90;

  const historical = [
    { label: locale === "th" ? "ปิดล่าสุด" : "Previous close", value: effective?.previousClose },
    { label: locale === "th" ? "1 สัปดาห์" : "1 week ago", value: effective?.weekAgo },
    { label: locale === "th" ? "1 เดือน" : "1 month ago", value: effective?.monthAgo },
    { label: locale === "th" ? "1 ปี" : "1 year ago", value: effective?.yearAgo },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-slate-100">
        <Gauge size={14} className="text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-800">
          {t("home.fearGreed")}
        </h3>
        <span className="ml-auto text-[10px] text-slate-400">
          {locale === "th" ? "ตลาดคริปโต" : "Crypto"}
        </span>
      </div>

      <div className="px-4 py-4">
        {loading && !effective ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 animate-pulse">
            <div className="w-40 h-20 rounded-t-full bg-slate-200" />
            <div className="h-8 w-12 rounded bg-slate-200" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
        ) : error && !effective ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <p className="text-xs text-slate-500">{error}</p>
            <button
              type="button"
              onClick={fetchFng}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              <RefreshCw size={12} /> {locale === "th" ? "ลองใหม่" : "Retry"}
            </button>
          </div>
        ) : (
          <>
            {/* CNN-style semicircle dial + needle */}
            <div className="relative mx-auto w-44 h-24 overflow-hidden mb-2">
              <div
                className="absolute inset-0 rounded-t-full"
                style={{
                  background:
                    "conic-gradient(from 270deg at 50% 100%, #ef4444 0deg, #f97316 36deg, #eab308 72deg, #22c55e 108deg, #16a34a 144deg, #16a34a 180deg, transparent 180deg)",
                }}
              />
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full bg-white"
                style={{ width: "70%", height: "70%" }}
              />
              <div
                className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-700 z-10"
                style={{
                  transform: `translateX(-50%) rotate(${rotation}deg)`,
                  width: "3px",
                  height: "48%",
                  background: "#1e293b",
                  borderRadius: "2px 2px 0 0",
                }}
              />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-3 w-3 rounded-full bg-slate-800 border-2 border-white z-10" />
            </div>

            {/* Current value + classification (CNN dial-number style) */}
            <div className="text-center mb-4">
              <div
                className={cn(
                  "text-3xl font-black tabular-nums",
                  zone.text,
                )}
              >
                {value}
              </div>
              <p className={cn("text-xs font-bold mt-0.5", zone.text)}>
                {effective?.classification ?? zone.label}
              </p>
            </div>

            {/* Historical row (CNN market-fng-gauge__historical) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {historical.map(({ label, value: v }) => (
                <div
                  key={label}
                  className="rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-2 text-center"
                >
                  <div className="text-[10px] text-slate-500 truncate">
                    {label}
                  </div>
                  <div className="text-sm font-bold text-slate-800 tabular-nums mt-0.5">
                    {v != null ? v : "—"}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              {locale === "th"
                ? "แหล่งข้อมูล: Alternative.me · อัปเดตรายวัน"
                : "Source: Alternative.me · Updated daily"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
