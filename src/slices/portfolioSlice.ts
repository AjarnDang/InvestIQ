import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PortfolioState, Holding, PortfolioSummary, Stock } from "@/src/types";
import { initialPortfolioState } from "@/src/state/initialState";
import {
  calculatePortfolioSummary,
  calculateAllocation,
  calculateWeights,
} from "@/src/functions/portfolioFunctions";

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

    /**
     * Called after market data is fetched. Updates every holding's currentPrice
     * from real market data, then recalculates weights, summary, and allocation.
     */
    syncPricesFromMarket(state, action: PayloadAction<Stock[]>) {
      const stockMap = new Map(action.payload.map((s) => [s.symbol, s]));

      // 1. Update prices for each holding that has a matching market quote
      state.holdings = state.holdings.map((holding) => {
        const stock = stockMap.get(holding.symbol);
        if (!stock) return holding;

        const marketValue    = holding.quantity * stock.price;
        const unrealizedPnL  = marketValue - holding.costBasis;
        const unrealizedPnLPercent =
          holding.costBasis > 0 ? (unrealizedPnL / holding.costBasis) * 100 : 0;

        return {
          ...holding,
          currentPrice:        stock.price,
          marketValue,
          unrealizedPnL,
          unrealizedPnLPercent,
        };
      });

      // 2. Recalculate portfolio weights
      state.holdings = calculateWeights(state.holdings);

      // 3. Recalculate summary using current cash balance
      state.summary = calculatePortfolioSummary(
        state.holdings,
        state.summary.cashBalance
      );

      // 4. Recalculate sector allocation
      state.allocation = calculateAllocation(state.holdings);
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
  syncPricesFromMarket,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
