"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  User,
  Search,
  ChevronDown,
  Check,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/src/utils/helpers";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  markAllNotificationsRead,
  markNotificationRead,
  toggleMobileMenu,
} from "@/src/slices/uiSlice";
import { logout } from "@/src/slices/authSlice";
import { timeAgo } from "@/src/utils/formatters";
import { PAGE_TITLE_MAP } from "@/src/data/navigation";

const PAGE_TITLES = PAGE_TITLE_MAP;

interface HeaderProps {
  pathname: string;
}

export function Header({ pathname }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.ui.notifications);
  const user = useAppSelector((s) => s.auth.user);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [showNotif, setShowNotif] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/home");
  };

  const title = PAGE_TITLES[pathname] ?? "InvestIQ";

  const typeColor: Record<string, string> = {
    info: "bg-blue-100 text-blue-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    error: "bg-red-100 text-red-600",
  };

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 gap-3">
      {/* Left: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => dispatch(toggleMobileMenu())}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors md:hidden flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-slate-800 truncate">
          {title}
        </h1>
      </div>

      {/* Mobile Search Bar (expanded) */}
      {showMobileSearch && (
        <div className="absolute left-0 right-0 top-0 z-30 flex h-14 items-center gap-2 bg-white px-4 md:hidden">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search stocks..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            aria-label="Close search"
            onClick={() => setShowMobileSearch(false)}
            className="text-slate-500 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search icon — mobile toggle */}
        <button
          onClick={() => setShowMobileSearch(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors md:hidden"
          aria-label="Search"
        >
          <Search size={17} />
        </button>

        {/* Search input — desktop only */}
        <div className="relative hidden md:flex items-center">
          <Search
            size={14}
            className="absolute left-3 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search stocks..."
            className="h-9 w-52 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotif(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-72 md:w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-700">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllNotificationsRead())}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      <Check size={11} />
                      Mark all read
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
                          !n.read && "bg-indigo-50/50"
                        )}
                        onClick={() => {
                          dispatch(markNotificationRead(n.id));
                          setShowNotif(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px]",
                              typeColor[n.type]
                            )}
                          >
                            {n.type === "success"
                              ? "✓"
                              : n.type === "warning"
                              ? "!"
                              : "i"}
                          </span>
                          <div className="min-w-0">
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
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
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

        {/* Profile + Logout */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 md:px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 flex-shrink-0">
              <User size={12} className="text-indigo-600" />
            </div>
            <span className="hidden lg:block font-medium">
              {user?.name ?? "Account"}
            </span>
            <ChevronDown size={12} className="text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
