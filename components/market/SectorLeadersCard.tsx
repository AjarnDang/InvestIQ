import React from "react";
import { useTranslations } from "@/src/i18n/useTranslations";
import { cn } from "@/src/utils/helpers";

export interface SectorLeader {
  sector: string;
  pct: string;
  positive: boolean;
}

export interface SectorLeadersCardProps {
  leaders?: SectorLeader[];
}

const DEFAULT_LEADERS: SectorLeader[] = [
  { sector: "Technology", pct: "+2.8%", positive: true },
  { sector: "Energy", pct: "+1.4%", positive: true },
  { sector: "Healthcare", pct: "+0.9%", positive: true },
  { sector: "Real Estate", pct: "-0.6%", positive: false },
  { sector: "Utilities", pct: "-1.1%", positive: false },
];

export function SectorLeadersCard({ leaders }: SectorLeadersCardProps) {
  const { locale } = useTranslations();
  const rows = leaders && leaders.length ? leaders : DEFAULT_LEADERS;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        {locale === "th" ? "กลุ่มอุตสาหกรรมเด่น" : "Sector Leaders"}
      </h3>
      <div className="space-y-2.5">
        {rows.map(({ sector, pct, positive }) => (
          <div key={sector} className="flex items-center justify-between">
            <span className="text-xs text-slate-600">{sector}</span>
            <span
              className={cn(
                "text-xs font-bold tabular-nums",
                positive ? "text-emerald-600" : "text-red-500",
              )}
            >
              {pct}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

