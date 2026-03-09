"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/src/store/hooks";
import { fetchMarketData, fetchStockHistory } from "@/src/slices/marketSlice";
import { useAppSelector } from "@/src/store/hooks";

const POLL_INTERVAL_MS = 60_000; // refresh every 60 seconds

/**
 * Fetches live market data (quotes + indices) on mount and polls every minute.
 * Also re-fetches price history whenever the selected stock changes.
 * Place this inside the authenticated layout so it only runs when logged in.
 */
export function MarketProvider({ children }: { children: React.ReactNode }) {
  const dispatch     = useAppDispatch();
  const selectedStock = useAppSelector((s) => s.market.selectedStock);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial fetch + polling
  useEffect(() => {
    dispatch(fetchMarketData());

    intervalRef.current = setInterval(() => {
      dispatch(fetchMarketData());
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [dispatch]);

  // Fetch price history whenever selected stock changes
  useEffect(() => {
    if (selectedStock) {
      dispatch(fetchStockHistory({ symbol: selectedStock.symbol, range: "1mo" }));
    }
  }, [dispatch, selectedStock?.symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
