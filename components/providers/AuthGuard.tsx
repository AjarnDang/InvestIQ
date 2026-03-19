"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { rehydrateAuth, setInitialized, logout } from "@/src/slices/authSlice";
import { getAuthSession, getSessionRemainingMs } from "@/src/functions/authFunctions";
import { TrendingUp, Lock, LogIn } from "lucide-react";
import { PROFILE_NAV_ITEMS } from "@/src/data/navigation";
import { useTranslations } from "@/src/i18n/useTranslations";
import { hydrateUserData, resetUserData } from "@/src/slices/userHydration";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PROTECTED_PATHS = PROFILE_NAV_ITEMS.map((item) => item.href);

export function AuthGuard({ children }: AuthGuardProps) {
  const pathname  = usePathname();
  const dispatch  = useAppDispatch();
  const { t, locale } = useTranslations();
  const { isAuthenticated, initializing, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      dispatch(rehydrateAuth(session));
    } else {
      dispatch(setInitialized());
    }
  }, [dispatch]);

  // Hydrate per-user mock data whenever auth user changes.
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(hydrateUserData(user.id));
    } else if (!isAuthenticated && !initializing) {
      dispatch(resetUserData());
    }
  }, [dispatch, isAuthenticated, initializing, user?.id]);

  // Auto-logout after 24 hours from login (checks on mount + schedules logout)
  useEffect(() => {
    const session = getAuthSession();
    if (!session) return;

    const remaining = getSessionRemainingMs();
    if (remaining === 0) {
      dispatch(logout());
      dispatch(resetUserData());
      return;
    }

    // Fallback polling (handles clock changes / multi-tab)
    const interval = setInterval(() => {
      const s = getAuthSession();
      if (!s) {
        dispatch(logout());
        dispatch(resetUserData());
      }
    }, 60_000);

    // Precise timeout when TTL elapses
    const timeout =
      typeof remaining === "number" && remaining > 0
        ? setTimeout(() => {
            dispatch(logout());
            dispatch(resetUserData());
          }, remaining)
        : null;

    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [dispatch]);

  const requiresAuth = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (!requiresAuth) return <>{children}</>;

  // ── Protected path: spinner while session rehydrates ─────────────────────
  if (initializing) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
            <TrendingUp size={24} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  // ── Protected path: not logged in — show inline gate ────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto mb-5">
            <Lock size={26} className="text-indigo-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {locale === "th" ? "กรุณาเข้าสู่ระบบ" : "Login Required"}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-7">
            {locale === "th"
              ? <>หน้านี้ต้องการการเข้าสู่ระบบก่อนเข้าใช้งาน<br />กรุณา Login เพื่อเข้าถึงข้อมูลส่วนตัวของคุณ</>
              : <>This page requires you to be logged in.<br />Please sign in to access your personal data.</>
            }
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white transition-colors shadow-sm"
            >
              <LogIn size={15} />
              {t("auth.login")}
            </Link>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {locale === "th" ? "กลับหน้าหลัก" : t("common.back")}
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-6">
            {locale === "th" ? "ยังไม่มีบัญชี? " : "Don't have an account? "}
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2"
            >
              {locale === "th" ? "สมัครสมาชิกฟรี" : t("auth.register")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
