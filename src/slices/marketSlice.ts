import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { MarketState, Stock, PriceHistory } from "@/src/types";
import { initialMarketState } from "@/src/state/initialState";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/** Fetch live quotes for all stocks + indices from Yahoo Finance */
export const fetchMarketData = createAsyncThunk(
  "market/fetchMarketData",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/market/quotes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        stocks: Stock[];
        indices: MarketState["indices"];
        fromCache?: boolean;
      };
      return data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

/** Fetch price history for a specific stock */
export const fetchStockHistory = createAsyncThunk(
  "market/fetchStockHistory",
  async (
    { symbol, range = "1mo" }: { symbol: string; range?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/market/history?symbol=${symbol}&range=${range}&interval=1d`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { symbol: string; history: PriceHistory[] };
      return data.history;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const marketSlice = createSlice({
  name: "market",
  initialState: initialMarketState,
  reducers: {
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
      const stock = state.stocks.find((s) => s.symbol === action.payload.symbol);
      if (stock) {
        stock.price         = action.payload.price;
        stock.change        = action.payload.change;
        stock.changePercent = action.payload.changePercent;
      }
    },
    setSelectedStock(state, action: PayloadAction<Stock | null>) {
      state.selectedStock = action.payload;
      // clear old history when switching stocks
      if (action.payload === null) state.priceHistory = [];
    },
    setPriceHistory(state, action: PayloadAction<PriceHistory[]>) {
      state.priceHistory = action.payload;
    },
    setIndices(state, action: PayloadAction<MarketState["indices"]>) {
      state.indices = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── fetchMarketData ──────────────────────────────────────────────────────
    builder
      .addCase(fetchMarketData.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchMarketData.fulfilled, (state, action) => {
        state.loading  = false;
        state.stocks   = action.payload.stocks;
        state.indices  = action.payload.indices;
      })
      .addCase(fetchMarketData.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── fetchStockHistory ────────────────────────────────────────────────────
    builder
      .addCase(fetchStockHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStockHistory.fulfilled, (state, action) => {
        state.loading      = false;
        state.priceHistory = action.payload;
      })
      .addCase(fetchStockHistory.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const {
  setStocks,
  updateStockPrice,
  setSelectedStock,
  setPriceHistory,
  setIndices,
  setError,
} = marketSlice.actions;

export default marketSlice.reducer;
