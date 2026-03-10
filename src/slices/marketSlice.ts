import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { MarketState, Stock, PriceHistory, NewsItem, TrendingStock } from "@/src/types";
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

/** Fetch US market indices + USD/THB from Yahoo Finance */
export const fetchGlobalMarket = createAsyncThunk(
  "market/fetchGlobalMarket",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/market/global");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        globalIndices: MarketState["globalIndices"];
      };
      return data;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

/** Fetch financial news from RSS feeds */
export const fetchMarketNews = createAsyncThunk(
  "market/fetchMarketNews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { news: NewsItem[] };
      return data.news;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

/** Fetch today's hot / trending US stocks */
export const fetchTrendingStocks = createAsyncThunk(
  "market/fetchTrendingStocks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/market/trending");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { stocks: TrendingStock[] };
      return data.stocks;
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
    setGlobalIndices(state, action: PayloadAction<MarketState["globalIndices"]>) {
      state.globalIndices = action.payload;
    },
    setNews(state, action: PayloadAction<NewsItem[]>) {
      state.news = action.payload;
    },
    setTrendingStocks(state, action: PayloadAction<TrendingStock[]>) {
      state.trendingStocks = action.payload;
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

    // ── fetchGlobalMarket ────────────────────────────────────────────────────
    builder
      .addCase(fetchGlobalMarket.pending, (state) => {
        state.loadingGlobal = true;
      })
      .addCase(fetchGlobalMarket.fulfilled, (state, action) => {
        state.loadingGlobal = false;
        if (action.payload.globalIndices.length > 0) {
          state.globalIndices = action.payload.globalIndices;
        }
      })
      .addCase(fetchGlobalMarket.rejected, (state) => {
        state.loadingGlobal = false;
      });

    // ── fetchMarketNews ──────────────────────────────────────────────────────
    builder
      .addCase(fetchMarketNews.pending, (state) => {
        state.loadingNews = true;
      })
      .addCase(fetchMarketNews.fulfilled, (state, action) => {
        state.loadingNews = false;
        state.news        = action.payload;
      })
      .addCase(fetchMarketNews.rejected, (state) => {
        state.loadingNews = false;
      });

    // ── fetchTrendingStocks ──────────────────────────────────────────────────
    builder
      .addCase(fetchTrendingStocks.pending, (state) => {
        state.loadingTrending = true;
      })
      .addCase(fetchTrendingStocks.fulfilled, (state, action) => {
        state.loadingTrending = false;
        if (action.payload.length > 0) state.trendingStocks = action.payload;
      })
      .addCase(fetchTrendingStocks.rejected, (state) => {
        state.loadingTrending = false;
      });
  },
});

export const {
  setStocks,
  updateStockPrice,
  setSelectedStock,
  setPriceHistory,
  setIndices,
  setGlobalIndices,
  setNews,
  setTrendingStocks,
  setError,
} = marketSlice.actions;

export default marketSlice.reducer;
