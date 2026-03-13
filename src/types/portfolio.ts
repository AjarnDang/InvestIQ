// ─── Portfolio ────────────────────────────────────────────────────────────────

import type { StockSector } from "./market";

export type AssetKey = "us" | "th" | "etf" | "crypto" | "gold" | "all";

export interface Holding {
  symbol: string;
  name: string;
  sector: StockSector;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  weight: number;
}

export interface PortfolioPerformance {
  date: string;
  value: number;
  return: number;
}

export interface AllocationData {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  cashBalance: number;
}

export interface PortfolioState {
  holdings: Holding[];
  summary: PortfolioSummary;
  performance: PortfolioPerformance[];
  allocation: AllocationData[];
  loading: boolean;
  error: string | null;
}

