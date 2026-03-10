"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/utils/helpers";
import { PROFILE_NAV_ITEMS } from "@/src/data/navigation";

export function ProfileTabsBar() {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      {/* Tabs row */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-slate-200 pb-px">
        {PROFILE_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0",
                active
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
              )}
            >
              <item.icon size={14} className={active ? "text-indigo-600" : "text-slate-400"} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
