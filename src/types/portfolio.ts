// ─── Portfolio ────────────────────────────────────────────────────────────────

import type { StockSector } from "./market";

export type AssetKey = "us" | "th" | "etf" | "crypto" | "gold" | "all";

export type CashCurrency = "THB" | "USD";

export interface CashBalances {
  THB: number;
  USD: number;
}

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
  /**
   * User cash balances are split into two "accounts".
   * These are user-owned funds, independent from instrument quote currency.
   */
  cashBalances: CashBalances;
  /**
   * FX rate used for cash conversions (THB per 1 USD).
   * This is a simplified model for now.
   */
  fxUsdThb: number;
}

export interface PortfolioState {
  holdings: Holding[];
  summary: PortfolioSummary;
  performance: PortfolioPerformance[];
  allocation: AllocationData[];
  loading: boolean;
  error: string | null;
}

