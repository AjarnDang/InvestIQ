"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { initLocale } from "@/src/slices/localeSlice";

/**
 * Reads the stored/browser locale once on client mount and syncs it into Redux.
 * Must be rendered inside the Redux Provider but outside any locale-consuming component.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initLocale());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
