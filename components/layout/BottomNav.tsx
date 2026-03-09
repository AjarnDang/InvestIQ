"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PieChart,
  BarChart2,
  ArrowLeftRight,
  Star,
} from "lucide-react";
import { cn } from "@/src/utils/helpers";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/market", label: "Market", icon: BarChart2 },
  { href: "/transactions", label: "Txns", icon: ArrowLeftRight },
  { href: "/watchlist", label: "Watchlist", icon: Star },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-1 md:hidden safe-area-bottom">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors",
              active ? "text-indigo-600" : "text-slate-400"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-12 items-center justify-center rounded-xl transition-colors",
                active ? "bg-indigo-50" : "hover:bg-slate-50"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                active ? "text-indigo-600" : "text-slate-400"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
