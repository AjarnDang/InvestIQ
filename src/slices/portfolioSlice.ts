import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PortfolioState, Holding, PortfolioSummary } from "@/src/types";
import { initialPortfolioState } from "@/src/state/initialState";

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: initialPortfolioState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setHoldings(state, action: PayloadAction<Holding[]>) {
      state.holdings = action.payload;
    },
    updateHoldingPrice(
      state,
      action: PayloadAction<{ symbol: string; price: number }>
    ) {
      const holding = state.holdings.find(
        (h) => h.symbol === action.payload.symbol
      );
      if (holding) {
        holding.currentPrice = action.payload.price;
        holding.marketValue = holding.quantity * action.payload.price;
        holding.unrealizedPnL = holding.marketValue - holding.costBasis;
        holding.unrealizedPnLPercent =
          (holding.unrealizedPnL / holding.costBasis) * 100;
      }
    },
    setSummary(state, action: PayloadAction<PortfolioSummary>) {
      state.summary = action.payload;
    },
    setAllocation(state, action: PayloadAction<PortfolioState["allocation"]>) {
      state.allocation = action.payload;
    },
    setPerformance(
      state,
      action: PayloadAction<PortfolioState["performance"]>
    ) {
      state.performance = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setHoldings,
  updateHoldingPrice,
  setSummary,
  setAllocation,
  setPerformance,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
