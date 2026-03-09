"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { rehydrateAuth, setInitialized } from "@/src/slices/authSlice";
import { getAuthSession } from "@/src/functions/authFunctions";
import { TrendingUp } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, initializing } = useAppSelector((s) => s.auth);

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      dispatch(rehydrateAuth(session));
    } else {
      dispatch(setInitialized());
      router.replace("/login");
    }
  }, [dispatch, router]);

  // Redirect once initialized and not authenticated
  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initializing, isAuthenticated, router]);

  // Show loading screen while checking session
  if (initializing || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
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

  return <>{children}</>;
}
