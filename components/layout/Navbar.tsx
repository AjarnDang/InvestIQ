"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp,
  Search,
  Bell,
  ChevronDown,
  Check,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { cn } from "@/src/utils/helpers";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { logout } from "@/src/slices/authSlice";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/src/slices/uiSlice";
import { MAIN_NAV_ITEMS } from "@/src/data/navigation";
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

// Public nav links shown to non-authenticated visitors on the home page
const GUEST_NAV = [
  { label: "หุ้น",   href: "/#markets" },
  { label: "Market", href: "/market"   },
  { label: "News",   href: "/#news"    },
];

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const notifications = useAppSelector((s) => s.ui.notifications);
  const unreadCount   = notifications.filter((n) => !n.read).length;

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch,  setShowSearch]  = useState(false);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    dispatch(logout());
    router.replace("/home");
    setShowProfile(false);
    setMobileOpen(false);
  }

  return (
    <>
      {/* ── Main Navbar bar ───────────────────────────────────────────── */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200",
          scrolled ? "shadow-sm" : "border-b border-slate-200"
        )}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 md:px-6 h-14 gap-3">

          {/* ── Logo + Desktop Nav Links ───────────────────────────── */}
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2 group shrink-0 mr-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
                <TrendingUp size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">InvestIQ</span>
            </Link>

            {/* Authenticated: full nav items */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-0.5">
                {MAIN_NAV_ITEMS.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                        active
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <item.icon size={13} />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    pathname === "/settings"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Settings size={13} />
                  Settings
                </Link>
              </div>
            )}

            {/* Guest: minimal links */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-0.5">
                {GUEST_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Zone ────────────────────────────────────────────── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Search — desktop */}
                <div className="relative hidden md:flex items-center">
                  <Search size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search stocks..."
                    className="h-8 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>

                {/* Search icon — mobile */}
                <button
                  onClick={() => setShowSearch((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => { setShowNotif((v) => !v); setShowProfile(false); }}
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
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                      <div className="absolute right-0 top-10 z-50 w-72 md:w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                          <span className="text-sm font-semibold text-slate-700">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => dispatch(markAllNotificationsRead())}
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                            >
                              <Check size={11} /> Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <p className="py-8 text-center text-xs text-slate-400">No notifications</p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={cn(
                                  "px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors",
                                  !n.read && "bg-indigo-50/50"
                                )}
                                onClick={() => { dispatch(markNotificationRead(n.id)); setShowNotif(false); }}
                              >
                                <div className="flex items-start gap-3">
                                  <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px]", NOTIF_COLOR[n.type])}>
                                    {NOTIF_ICON[n.type] ?? "i"}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-slate-700 truncate">{n.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                                  </div>
                                  {!n.read && <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden lg:block font-medium max-w-[90px] truncate text-sm">
                      {user?.name?.split(" ")[0] ?? "User"}
                    </span>
                    <ChevronDown size={12} className="text-slate-400 hidden md:block" />
                  </button>

                  {showProfile && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                      <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50">
                          <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setShowProfile(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <LayoutDashboard size={13} /> Dashboard
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setShowProfile(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Settings size={13} /> Settings
                          </Link>
                          <div className="border-t border-slate-100 mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut size={13} /> Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Hamburger — mobile only */}
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </>
            ) : (
              /* Guest */
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-1 rounded-md bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile search bar (slide-down) */}
        {showSearch && isAuthenticated && (
          <div className="px-4 pb-3 border-t border-slate-100 bg-white md:hidden">
            <div className="relative mt-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search stocks..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onBlur={() => setShowSearch(false)}
              />
            </div>
          </div>
        )}
      </nav>

      {/* ── Mobile full-menu drawer ────────────────────────────────────── */}
      {mobileOpen && isAuthenticated && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-lg md:hidden">
            <div className="px-4 py-3 space-y-0.5">
              {/* Nav items */}
              {MAIN_NAV_ITEMS.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <item.icon size={16} className={active ? "text-indigo-600" : "text-slate-400"} />
                    {item.label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                  </Link>
                );
              })}

              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname === "/settings" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <Settings size={16} className="text-slate-400" />
                Settings
              </Link>

              {/* Profile + logout */}
              <div className="pt-2 mt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
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
          </div>
        </>
      )}
    </>
  );
}
