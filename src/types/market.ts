// ─── Market & Stock ───────────────────────────────────────────────────────────

import type { NewsItem } from "./news";

/** Broad industry / asset-class category shown on the UI. */
export type StockSector =
  | "Energy"
  | "Banking"
  | "Technology"
  | "Healthcare"
  | "Real Estate"
  | "Consumer"
  | "Industrial"
  | "Utilities"
  | "Finance"
  | "Communication"
  | "Materials"
  | "ETF"
  | "Crypto"
  | "Commodity"
  | "Other";

/** Financial instrument type — used for filtering and display logic. */
export type InstrumentType = "STOCK" | "ETF" | "CRYPTO" | "COMMODITY";

export interface Stock {
  symbol: string;
  name: string;
  sector: StockSector;
  /** Instrument type — defaults to STOCK when absent. */
  instrumentType?: InstrumentType;
  /** Exchange where the instrument is listed (e.g. SET, NYSE, NASDAQ). */
  exchange?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  peRatio?: number;
  dividendYield?: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
  previousClose: number | null;
  weekAgo: number | null;
  monthAgo: number | null;
  yearAgo: number | null;
  source: string;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TrendingStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
}

export interface MarketSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  sector?: string;
}

export interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketState?: string;
  preMarketPrice?: number;
  preMarketChange?: number;
  preMarketChangePercent?: number;
  postMarketPrice?: number;
  postMarketChange?: number;
  postMarketChangePercent?: number;
  open?: number;
  prevClose?: number;
  dayHigh?: number;
  dayLow?: number;
  marketCap?: number;
  volume?: number;
  avgVolume?: number;
  pe?: number;
  eps?: number;
  dividendYield?: number;
  high52?: number;
  low52?: number;
  beta?: number;
  sector?: string;
  industry?: string;
  description?: string;
  website?: string;
  country?: string;
  exchange?: string;
  currency?: string;
  quoteType?: string;
  employees?: number;
}

export interface MarketState {
  stocks: Stock[];
  indices: MarketIndex[];
  globalIndices: MarketIndex[];
  trendingStocks: TrendingStock[];
  selectedStock: Stock | null;
  priceHistory: PriceHistory[];
  news: NewsItem[];
  loading: boolean;
  loadingGlobal: boolean;
  loadingNews: boolean;
  loadingTrending: boolean;
  error: string | null;
}

