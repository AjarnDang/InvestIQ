import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MarketState, Stock, PriceHistory } from "@/src/types";
import { initialMarketState } from "@/src/state/initialState";

const marketSlice = createSlice({
  name: "market",
  initialState: initialMarketState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setStocks(state, action: PayloadAction<Stock[]>) {
      state.stocks = action.payload;
    },
    updateStockPrice(
      state,
      action: PayloadAction<{
        symbol: string;
        price: number;
        change: number;
        changePercent: number;
      }>
    ) {
      const stock = state.stocks.find(
        (s) => s.symbol === action.payload.symbol
      );
      if (stock) {
        stock.price = action.payload.price;
        stock.change = action.payload.change;
        stock.changePercent = action.payload.changePercent;
      }
    },
    setSelectedStock(state, action: PayloadAction<Stock | null>) {
      state.selectedStock = action.payload;
    },
    setPriceHistory(state, action: PayloadAction<PriceHistory[]>) {
      state.priceHistory = action.payload;
    },
    setIndices(state, action: PayloadAction<MarketState["indices"]>) {
      state.indices = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setStocks,
  updateStockPrice,
  setSelectedStock,
  setPriceHistory,
  setIndices,
} = marketSlice.actions;

export default marketSlice.reducer;
