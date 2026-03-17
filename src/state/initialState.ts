import type {
  PortfolioState,
  MarketState,
  TransactionState,
  WatchlistState,
  UIState,
  AuthState,
} from "@/src/types";

import { MOCK_HOLDINGS, MOCK_PORTFOLIO_SUMMARY, MOCK_ALLOCATION } from "@/src/data/holdings";
import { MOCK_TRANSACTIONS } from "@/src/data/transactions";
import { MOCK_WATCHLIST } from "@/src/data/watchlist";
import { MOCK_NOTIFICATIONS } from "@/src/data/notifications";

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const initialPortfolioState: PortfolioState = {
  holdings: MOCK_HOLDINGS,
  summary: MOCK_PORTFOLIO_SUMMARY,
  performance: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2026, 1, 8 - 29 + i);
    const base = 600000;
    const trend = i * 1500;
    const noise = (Math.random() - 0.4) * 8000;
    const value = base + trend + noise;
    return {
      date: date.toISOString().split("T")[0],
      value: Math.round(value),
      return: parseFloat((((value - base) / base) * 100).toFixed(2)),
    };
  }),
  allocation: MOCK_ALLOCATION,
  loading: false,
  error: null,
};

// ─── Market ───────────────────────────────────────────────────────────────────
// Start with empty arrays — real data is fetched from Yahoo Finance on mount.
// Mock data is only used as API fallback if Yahoo Finance is unreachable.

export const initialMarketState: MarketState = {
  stocks: [],
  indices: [],
  globalIndices: [],
  trendingStocks: [],
  selectedStock: null,
  priceHistory: [],
  news: [],
  loading: true,          // skeletons for SET indices/stocks
  loadingGlobal: true,    // skeletons for US indices
  loadingNews: true,      // skeletons for news feed
  loadingTrending: true,  // skeletons for hot stocks
  stockAnalysis: null,
  loadingAnalysis: false,
  error: null,
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const initialTransactionState: TransactionState = {
  transactions: MOCK_TRANSACTIONS,
  filter: {
    type: "ALL",
    status: "ALL",
    dateFrom: null,
    dateTo: null,
    search: "",
  },
  loading: false,
  error: null,
};

// ─── Watchlist ────────────────────────────────────────────────────────────────

export const initialWatchlistState: WatchlistState = {
  items: MOCK_WATCHLIST,
  loading: false,
  error: null,
};

// ─── UI ───────────────────────────────────────────────────────────────────────

export const initialUIState: UIState = {
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  activeModal: null,
  theme: "light",
  notifications: MOCK_NOTIFICATIONS,
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  initializing: true,
  loading: false,
  error: null,
};
