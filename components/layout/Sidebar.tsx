"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, TrendingUp, X } from "lucide-react";
import { cn } from "@/src/utils/helpers";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { toggleSidebar, setMobileMenuOpen } from "@/src/slices/uiSlice";
import { MAIN_NAV_ITEMS, SETTINGS_NAV_ITEMS } from "@/src/data/navigation";

const navItems = MAIN_NAV_ITEMS;
const bottomItems = SETTINGS_NAV_ITEMS;

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);

  const handleNavClick = () => {
    if (mobile) dispatch(setMobileMenuOpen(false));
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out",
        mobile
          ? "w-72 h-full"
          : cn("relative", collapsed ? "w-16" : "w-60")
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 flex-shrink-0">
            <TrendingUp size={16} className="text-white" />
          </div>
          {(!collapsed || mobile) && (
            <span className="text-lg font-bold tracking-tight truncate">
              InvestIQ
            </span>
          )}
        </div>
        {mobile && (
          <button
            onClick={() => dispatch(setMobileMenuOpen(false))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
              title={collapsed && !mobile ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {(!collapsed || mobile) && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="px-3 pb-4 space-y-1 border-t border-slate-800 pt-4">
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={handleNavClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title={collapsed && !mobile ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {(!collapsed || mobile) && (
              <span className="truncate">{label}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Collapse Toggle (desktop only) */}
      {!mobile && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-colors z-10"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}
    </aside>
  );
}
