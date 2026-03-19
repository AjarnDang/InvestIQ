import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserMockData } from "@/src/data/accounts";
import {
  setHoldings,
  setSummary,
  setAllocation,
  setPerformance,
} from "@/src/slices/portfolioSlice";
import { setTransactions, resetFilter } from "@/src/slices/transactionSlice";
import { setItems } from "@/src/slices/watchlistSlice";
import { initialPortfolioState, initialTransactionState, initialWatchlistState } from "@/src/state/initialState";

export const hydrateUserData = createAsyncThunk(
  "user/hydrateUserData",
  async (userId: string, { dispatch }) => {
    const mock = getUserMockData(userId);
    dispatch(setHoldings(mock.portfolio.holdings));
    dispatch(setSummary(mock.portfolio.summary));
    dispatch(setAllocation(mock.portfolio.allocation));
    dispatch(setPerformance(mock.portfolio.performance));
    dispatch(setTransactions(mock.transactions));
    dispatch(resetFilter());
    dispatch(setItems(mock.watchlist));
    return true;
  },
);

export const resetUserData = createAsyncThunk(
  "user/resetUserData",
  async (_, { dispatch }) => {
    dispatch(setHoldings(initialPortfolioState.holdings));
    dispatch(setSummary(initialPortfolioState.summary));
    dispatch(setAllocation(initialPortfolioState.allocation));
    dispatch(setPerformance(initialPortfolioState.performance));
    dispatch(setTransactions(initialTransactionState.transactions));
    dispatch(resetFilter());
    dispatch(setItems(initialWatchlistState.items));
    return true;
  },
);

