import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  MarketState,
  Stock,
  PriceHistory,
  NewsItem,
  TrendingStock,
  MarketSearchResult,
  FearGreedData,
  StockDetail,
  StockAnalysis,
} from "@/src/types";
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

/** Fetch live quotes for a specific asset universe (th/us/etf/crypto/all) */
export const fetchAssetQuotes = createAsyncThunk(
  "market/fetchAssetQuotes",
  async (
    { asset, limit = 30 }: { asset: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(
        `/api/market/quotes?asset=${encodeURIComponent(asset)}&limit=${encodeURIComponent(
          String(limit),
        )}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { stocks?: Stock[] };
      return { asset, stocks: data.stocks ?? [] };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchMarketSearch = createAsyncThunk(
  "market/fetchMarketSearch",
  async ({ q }: { q: string }, { rejectWithValue }) => {
    try {
      const trimmed = q.trim();
      if (!trimmed) return { q: "", results: [] as MarketSearchResult[] };
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { results?: MarketSearchResult[] };
      return { q: trimmed, results: data.results ?? [] };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

export const fetchFearGreed = createAsyncThunk(
  "market/fetchFearGreed",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/market/fear-greed");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as Partial<FearGreedData>;
      return {
        value: json.value ?? 0,
        classification: json.classification ?? "Unknown",
        timestamp: json.timestamp ?? "",
        previousClose: json.previousClose ?? null,
        weekAgo: json.weekAgo ?? null,
        monthAgo: json.monthAgo ?? null,
        yearAgo: json.yearAgo ?? null,
        source: json.source ?? "alternative.me",
      } satisfies FearGreedData;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
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

export const fetchStockDetail = createAsyncThunk(
  "market/fetchStockDetail",
  async ({ symbol }: { symbol: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/market/detail/${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { detail?: StockDetail; news?: NewsItem[] };
      return { detail: data.detail ?? null, news: data.news ?? [] };
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

/** Fetch analyst price targets + recommendation consensus from Yahoo Finance */
export const fetchStockAnalysis = createAsyncThunk(
  "market/fetchStockAnalysis",
  async ({ symbol }: { symbol: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/market/analysis/${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { analysis?: StockAnalysis };
      return data.analysis ?? null;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
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

    // ── fetchStockAnalysis ───────────────────────────────────────────────────
    builder
      .addCase(fetchStockAnalysis.pending, (state) => {
        state.loadingAnalysis = true;
        state.stockAnalysis   = null;
      })
      .addCase(fetchStockAnalysis.fulfilled, (state, action) => {
        state.loadingAnalysis = false;
        state.stockAnalysis   = action.payload;
      })
      .addCase(fetchStockAnalysis.rejected, (state) => {
        state.loadingAnalysis = false;
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
