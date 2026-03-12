import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "./Card";
import { cn } from "@/src/utils/helpers";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
  valueClassName?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg = "bg-indigo-50",
  className,
  valueClassName,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="shadow-none border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider truncate">
              {title}
            </p>
            <p
              className={cn(
                "mt-1 md:mt-1.5 text-lg md:text-2xl font-bold text-slate-900 leading-tight truncate",
                valueClassName
              )}
            >
              {value}
            </p>
            {change !== undefined && (
              <div
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs font-medium",
                  isPositive && "text-emerald-600",
                  isNegative && "text-red-600",
                  !isPositive && !isNegative && "text-slate-500"
                )}
              >
                {isPositive ? (
                  <TrendingUp size={12} />
                ) : isNegative ? (
                  <TrendingDown size={12} />
                ) : (
                  <Minus size={12} />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)}%
                  {changeLabel && (
                    <span className="ml-1 text-slate-400 font-normal">
                      {changeLabel}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl flex-shrink-0 ml-2 md:ml-3",
                iconBg
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
