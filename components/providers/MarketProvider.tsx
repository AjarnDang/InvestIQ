"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  fetchMarketData,
  fetchGlobalMarket,
  fetchMarketNews,
  fetchStockHistory,
} from "@/src/slices/marketSlice";
import { syncPricesFromMarket as syncPortfolio } from "@/src/slices/portfolioSlice";
import { syncPricesFromMarket as syncWatchlist } from "@/src/slices/watchlistSlice";
import type { Stock } from "@/src/types";

const PRICE_POLL_MS  = 60_000;  // refresh SET + US prices every 60 s
const NEWS_POLL_MS   = 900_000; // refresh news every 15 min

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const dispatch      = useAppDispatch();
  const selectedStock = useAppSelector((s) => s.market.selectedStock);

  const priceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const newsIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadPrices() {
    // Fetch SET stocks + indices and US global indices in parallel
    const [setResult] = await Promise.all([
      dispatch(fetchMarketData()),
      dispatch(fetchGlobalMarket()),
    ]);

    // Propagate real SET prices to portfolio + watchlist
    if (fetchMarketData.fulfilled.match(setResult)) {
      const stocks = setResult.payload.stocks as Stock[];
      dispatch(syncPortfolio(stocks));
      dispatch(syncWatchlist(stocks));
    }
  }

  async function loadNews() {
    dispatch(fetchMarketNews());
  }

  // Initial fetch of prices + news, then set up polling intervals
  useEffect(() => {
    loadPrices();
    loadNews();

    priceIntervalRef.current = setInterval(loadPrices, PRICE_POLL_MS);
    newsIntervalRef.current  = setInterval(loadNews,   NEWS_POLL_MS);

    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
      if (newsIntervalRef.current)  clearInterval(newsIntervalRef.current);
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
