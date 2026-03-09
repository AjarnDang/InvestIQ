import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { WatchlistState, WatchlistItem } from "@/src/types";
import { initialWatchlistState } from "@/src/state/initialState";

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState: initialWatchlistState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setItems(state, action: PayloadAction<WatchlistItem[]>) {
      state.items = action.payload;
    },
    addItem(state, action: PayloadAction<WatchlistItem>) {
      const exists = state.items.find(
        (i) => i.symbol === action.payload.symbol
      );
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.symbol !== action.payload);
    },
    toggleAlert(
      state,
      action: PayloadAction<{ symbol: string; enabled: boolean }>
    ) {
      const item = state.items.find((i) => i.symbol === action.payload.symbol);
      if (item) {
        item.alertEnabled = action.payload.enabled;
      }
    },
    setAlertPrice(
      state,
      action: PayloadAction<{ symbol: string; price: number }>
    ) {
      const item = state.items.find((i) => i.symbol === action.payload.symbol);
      if (item) {
        item.alertPrice = action.payload.price;
      }
    },
    updateItemPrice(
      state,
      action: PayloadAction<{
        symbol: string;
        price: number;
        change: number;
        changePercent: number;
      }>
    ) {
      const item = state.items.find((i) => i.symbol === action.payload.symbol);
      if (item) {
        item.price = action.payload.price;
        item.change = action.payload.change;
        item.changePercent = action.payload.changePercent;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setItems,
  addItem,
  removeItem,
  toggleAlert,
  setAlertPrice,
  updateItemPrice,
} = watchlistSlice.actions;

export default watchlistSlice.reducer;
