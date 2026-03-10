"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { fetchMarketData, fetchStockHistory } from "@/src/slices/marketSlice";
import { syncPricesFromMarket as syncPortfolio } from "@/src/slices/portfolioSlice";
import { syncPricesFromMarket as syncWatchlist } from "@/src/slices/watchlistSlice";
import type { Stock } from "@/src/types";

const POLL_INTERVAL_MS = 60_000; // refresh live prices every 60 seconds

/**
 * Fetches live market data from Yahoo Finance on mount and polls every minute.
 * After every successful fetch, propagates real prices to portfolio and watchlist.
 * Also fetches price history whenever the selected stock changes.
 */
export function MarketProvider({ children }: { children: React.ReactNode }) {
  const dispatch      = useAppDispatch();
  const selectedStock = useAppSelector((s) => s.market.selectedStock);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadAndSync() {
    const result = await dispatch(fetchMarketData());
    if (fetchMarketData.fulfilled.match(result)) {
      const stocks = result.payload.stocks as Stock[];
      dispatch(syncPortfolio(stocks));
      dispatch(syncWatchlist(stocks));
    }
  }

  // Initial fetch + polling
  useEffect(() => {
    loadAndSync();

    intervalRef.current = setInterval(loadAndSync, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch price history whenever selected stock changes
  useEffect(() => {
    if (selectedStock) {
      dispatch(fetchStockHistory({ symbol: selectedStock.symbol, range: "1mo" }));
    }
  }, [dispatch, selectedStock?.symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
