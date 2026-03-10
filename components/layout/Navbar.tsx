"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/src/utils/helpers";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { logout } from "@/src/slices/authSlice";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/src/slices/uiSlice";
import { MAIN_NAV_ITEMS, PROFILE_NAV_ITEMS } from "@/src/data/navigation";
import { timeAgo } from "@/src/utils/formatters";

const NOTIF_ICON: Record<string, string> = {
  success: "✓",
  warning: "!",
  error:   "×",
  info:    "i",
};
const NOTIF_COLOR: Record<string, string> = {
  info:    "bg-blue-100 text-blue-600",
  success: "bg-emerald-100 text-emerald-600",
  warning: "bg-amber-100 text-amber-600",
  error:   "bg-red-100 text-red-600",
};

export function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const dispatch  = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const notifications = useAppSelector((s) => s.ui.notifications);
  const stocks        = useAppSelector((s) => s.market.stocks);
  const unreadCount   = notifications.filter((n) => !n.read).length;

  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchOpen,   setSearchOpen]   = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Search results ──────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 1) return [];
    return stocks
      .filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q),
      )
      .slice(0, 7);
  }, [stocks, searchQuery]);

  function handleLogout() {
    dispatch(logout());
    router.replace("/home");
    setShowProfile(false);
    setMobileOpen(false);
  }

  function goToStock(symbol: string) {
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/stocks/${symbol.toUpperCase()}`);
  }

  function goToMarket() {
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
    router.push("/market");
  }

  return (
    <>
      {/* ── Navbar bar ─────────────────────────────────────────────────── */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200",
          scrolled ? "shadow-sm" : "border-b border-slate-200",
        )}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 md:px-6 h-14 gap-2">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link href="/home" className="flex items-center gap-2 group shrink-0 mr-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 hidden sm:block">
              InvestIQ
            </span>
          </Link>

          {/* ── Desktop nav — same for all users ───────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0">
            {MAIN_NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* ── Right zone ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Search — desktop */}
            <div ref={searchRef} className="relative hidden md:block">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="ค้นหาหุ้น..."
                className="h-8 w-40 xl:w-52 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />

              {/* Dropdown — results */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      ผลการค้นหา · {searchResults.length} รายการ
                    </p>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => goToStock(stock.symbol)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">
                            {stock.symbol}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {stock.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-700 tabular-nums">
                            ฿{stock.price.toFixed(2)}
                          </p>
                          <p
                            className={cn(
                              "text-[10px] font-semibold tabular-nums flex items-center justify-end gap-0.5",
                              stock.changePercent >= 0
                                ? "text-emerald-600"
                                : "text-red-500",
                            )}
                          >
                            {stock.changePercent >= 0 ? (
                              <TrendingUp size={9} />
                            ) : (
                              <TrendingDown size={9} />
                            )}
                            {stock.changePercent >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={goToMarket}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      ดูตลาดทั้งหมด →
                    </button>
                  </div>
                </div>
              )}

              {/* Dropdown — no results */}
              {searchOpen &&
                searchQuery.trim().length >= 1 &&
                searchResults.length === 0 && (
                  <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-slate-200 bg-white shadow-lg p-4">
                    <p className="text-xs text-slate-400 text-center">
                      ไม่พบหุ้นที่ตรงกับ &ldquo;{searchQuery}&rdquo;
                    </p>
                  </div>
                )}
            </div>

            {/* ── Authenticated: bell + profile ──────────────────────── */}
            {isAuthenticated && (
              <>
                {/* Notifications bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotif((v) => !v);
                      setShowProfile(false);
                    }}
                    className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell size={15} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotif && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowNotif(false)}
                      />
                      <div className="absolute right-0 top-10 z-50 w-72 md:w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                          <span className="text-sm font-semibold text-slate-700">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <button
                              onClick={() =>
                                dispatch(markAllNotificationsRead())
                              }
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                            >
                              <Check size={11} /> Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <p className="py-8 text-center text-xs text-slate-400">
                              No notifications
                            </p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={cn(
                                  "px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors",
                                  !n.read && "bg-indigo-50/50",
                                )}
                                onClick={() => {
                                  dispatch(markNotificationRead(n.id));
                                  setShowNotif(false);
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  <span
                                    className={cn(
                                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px]",
                                      NOTIF_COLOR[n.type],
                                    )}
                                  >
                                    {NOTIF_ICON[n.type] ?? "i"}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-slate-700 truncate">
                                      {n.title}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                      {n.message}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                      {timeAgo(n.createdAt)}
                                    </p>
                                  </div>
                                  {!n.read && (
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile avatar + dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowProfile((v) => !v);
                      setShowNotif(false);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    aria-label="My account"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden lg:block font-medium max-w-[80px] truncate text-sm">
                      {user?.name?.split(" ")[0] ?? "User"}
                    </span>
                    <ChevronDown size={12} className="text-slate-400 hidden md:block" />
                  </button>

                  {showProfile && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfile(false)}
                      />
                      <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                        {/* User header */}
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {user?.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>

                        {/* Profile nav tabs — 2×2 grid */}
                        <div className="p-3">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                            My Account
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {PROFILE_NAV_ITEMS.map((item) => {
                              const active = pathname === item.href;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setShowProfile(false)}
                                  className={cn(
                                    "flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors",
                                    active
                                      ? "bg-indigo-50 text-indigo-700"
                                      : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
                                  )}
                                >
                                  <item.icon
                                    size={16}
                                    className={
                                      active ? "text-indigo-600" : "text-slate-400"
                                    }
                                  />
                                  <span className="text-[11px] font-semibold leading-tight">
                                    {item.label}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-slate-100 px-3 pb-3">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={14} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── Guest: login + get started ──────────────────────────── */}
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="flex items-center rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile / tablet drawer ──────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-lg lg:hidden max-h-[calc(100vh-56px)] overflow-y-auto">
            <div className="px-4 py-3 space-y-0.5">

              {/* Search in mobile drawer */}
              <div className="relative mb-3">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาหุ้น เช่น AAPL, NVDA..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {searchResults.length > 0 && (
                  <div className="mt-1.5 rounded-xl border border-slate-200 bg-white overflow-hidden shadow">
                    {searchResults.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => goToStock(stock.symbol)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">
                            {stock.symbol}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {stock.name}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "text-xs font-bold tabular-nums shrink-0",
                            stock.changePercent >= 0
                              ? "text-emerald-600"
                              : "text-red-500",
                          )}
                        >
                          {stock.changePercent >= 0 ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main nav — same for all */}
              {MAIN_NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <item.icon
                      size={16}
                      className={active ? "text-indigo-600" : "text-slate-400"}
                    />
                    {item.label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    )}
                  </Link>
                );
              })}

              {/* Authenticated: profile section */}
              {isAuthenticated ? (
                <div className="pt-2 mt-2 border-t border-slate-100 space-y-0.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
                    My Account
                  </p>
                  {PROFILE_NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          active
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        <item.icon
                          size={16}
                          className={
                            active ? "text-indigo-600" : "text-slate-400"
                          }
                        />
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                /* Guest: login / register */
                <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white transition-colors"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
