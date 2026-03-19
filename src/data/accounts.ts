import type {
  AllocationData,
  AuthUser,
  Holding,
  PortfolioState,
  PortfolioSummary,
  Transaction,
  WatchlistItem,
} from "@/src/types";

import {
  MOCK_HOLDINGS,
  MOCK_PORTFOLIO_SUMMARY,
  MOCK_ALLOCATION,
} from "@/src/data/holdings";
import { MOCK_TRANSACTIONS } from "@/src/data/transactions";
import { MOCK_WATCHLIST } from "@/src/data/watchlist";

export interface DemoAccount {
  email: string;
  password: string;
  user: AuthUser;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "demo@investiq.com",
    password: "demo1234",
    user: {
      id: "user_001",
      name: "Alex Chen",
      email: "demo@investiq.com",
      accountNumber: "IQ-2026-001",
      joinDate: "2024-01-15",
    },
  },
  {
    email: "admin@investiq.com",
    password: "admin1234",
    user: {
      id: "user_002",
      name: "Sarah Kim",
      email: "admin@investiq.com",
      accountNumber: "IQ-2026-002",
      joinDate: "2023-06-20",
    },
  },
  {
    email: "investor@investiq.com",
    password: "invest1234",
    user: {
      id: "user_003",
      name: "Narin S.",
      email: "investor@investiq.com",
      accountNumber: "IQ-2026-003",
      joinDate: "2025-09-03",
    },
  },
];

/** Convenience: first demo account credentials shown in login UI */
export const DEFAULT_DEMO_CREDENTIAL = {
  email: DEMO_ACCOUNTS[0].email,
  password: DEMO_ACCOUNTS[0].password,
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-user mock datasets (kept alongside DEMO_ACCOUNTS)
// ─────────────────────────────────────────────────────────────────────────────

export type UserMockData = {
  portfolio: Pick<
    PortfolioState,
    "holdings" | "summary" | "performance" | "allocation"
  >;
  transactions: Transaction[];
  watchlist: WatchlistItem[];
};

function buildPerformanceSeries(seed: number, days = 30) {
  // Deterministic pseudo-random to keep mock stable across reloads.
  let s = seed >>> 0;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };

  const base = 600_000 + Math.round((seed % 7) * 25_000);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(2026, 1, 8 - (days - 1) + i);
    const trend = i * (1100 + Math.round(rnd() * 900));
    const noise = (rnd() - 0.45) * 7000;
    const value = base + trend + noise;
    return {
      date: date.toISOString().split("T")[0],
      value: Math.round(value),
      return: parseFloat((((value - base) / base) * 100).toFixed(2)),
    };
  });
}

const USER_003_HOLDINGS: Holding[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    quantity: 18,
    avgCost: 175.2,
    currentPrice: 189.5,
    marketValue: 3411,
    costBasis: 3153.6,
    unrealizedPnL: 257.4,
    unrealizedPnLPercent: 8.16,
    weight: 22.0,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    quantity: 9,
    avgCost: 395.0,
    currentPrice: 412.3,
    marketValue: 3710.7,
    costBasis: 3555,
    unrealizedPnL: 155.7,
    unrealizedPnLPercent: 4.38,
    weight: 24.0,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Technology",
    quantity: 7,
    avgCost: 805.0,
    currentPrice: 828.1,
    marketValue: 5796.7,
    costBasis: 5635,
    unrealizedPnL: 161.7,
    unrealizedPnLPercent: 2.87,
    weight: 38.0,
  },
  {
    symbol: "CPALL",
    name: "CP All PCL",
    sector: "Consumer",
    quantity: 600,
    avgCost: 55.5,
    currentPrice: 60.25,
    marketValue: 36150,
    costBasis: 33300,
    unrealizedPnL: 2850,
    unrealizedPnLPercent: 8.56,
    weight: 16.0,
  },
];

const USER_003_SUMMARY: PortfolioSummary = {
  totalValue: 720_000,
  totalCost: 680_000,
  totalPnL: 40_000,
  totalPnLPercent: 5.88,
  dailyPnL: 2_150,
  dailyPnLPercent: 0.30,
  cashBalances: {
    THB: 125_000,
    USD: 2_350,
  },
  fxUsdThb: 35,
};

const USER_003_ALLOCATION: AllocationData[] = [
  { name: "Technology", value: 12_918.4, percent: 84.0, color: "#6366F1" },
  { name: "Consumer", value: 36_150, percent: 16.0, color: "#10B981" },
];

const USER_003_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN201",
    type: "DEPOSIT",
    amount: 150000,
    fee: 0,
    status: "COMPLETED",
    date: "2026-03-02",
    note: "Initial funding",
  },
  {
    id: "TXN202",
    type: "BUY",
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 10,
    price: 172.4,
    amount: 1724,
    fee: 4.31,
    status: "COMPLETED",
    date: "2026-03-04",
    note: "Long-term core position",
  },
  {
    id: "TXN203",
    type: "BUY",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    quantity: 4,
    price: 790.0,
    amount: 3160,
    fee: 7.9,
    status: "COMPLETED",
    date: "2026-03-06",
  },
  {
    id: "TXN204",
    type: "BUY",
    symbol: "CPALL",
    name: "CP All PCL",
    quantity: 600,
    price: 55.5,
    amount: 33300,
    fee: 83.25,
    status: "COMPLETED",
    date: "2026-03-08",
  },
];

const USER_003_WATCHLIST: WatchlistItem[] = [
  {
    symbol: "TSLA",
    name: "Tesla",
    sector: "Consumer",
    price: 182.4,
    change: -2.3,
    changePercent: -1.25,
    alertPrice: 170,
    alertEnabled: true,
    addedAt: "2026-03-01",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc. (Class A)",
    sector: "Technology",
    price: 308.7,
    change: 1.8,
    changePercent: 0.59,
    alertEnabled: false,
    addedAt: "2026-03-03",
  },
  {
    symbol: "PTT",
    name: "PTT Public Company Limited",
    sector: "Energy",
    price: 36.75,
    change: 0.25,
    changePercent: 0.68,
    alertEnabled: false,
    addedAt: "2026-03-05",
  },
];

export function getUserMockData(userId: string): UserMockData {
  if (userId === "user_003") {
    return {
      portfolio: {
        holdings: USER_003_HOLDINGS,
        summary: USER_003_SUMMARY,
        performance: buildPerformanceSeries(3003, 30),
        allocation: USER_003_ALLOCATION,
      },
      transactions: USER_003_TRANSACTIONS,
      watchlist: USER_003_WATCHLIST,
    };
  }

  // Default: existing demo dataset (used by user_001 + user_002)
  return {
    portfolio: {
      holdings: MOCK_HOLDINGS,
      summary: MOCK_PORTFOLIO_SUMMARY,
      performance: buildPerformanceSeries(1001, 30),
      allocation: MOCK_ALLOCATION,
    },
    transactions: MOCK_TRANSACTIONS,
    watchlist: MOCK_WATCHLIST,
  };
}
