// ─── User & Auth ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  accountNumber: string;
  joinDate: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  joinDate: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initializing: boolean;
  loading: boolean;
  error: string | null;
}

// ─── Market & Stock ───────────────────────────────────────────────────────────

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
  symbol:         string;
  name:           string;
  sector:         StockSector;
  /** Instrument type — defaults to STOCK when absent. */
  instrumentType?: InstrumentType;
  /** Exchange where the instrument is listed (e.g. SET, NYSE, NASDAQ). */
  exchange?:       string;
  price:           number;
  change:          number;
  changePercent:   number;
  volume:          number;
  marketCap:       number;
  high52w:         number;
  low52w:          number;
  peRatio?:        number;
  dividendYield?:  number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────
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

// ─── Transaction ──────────────────────────────────────────────────────────────
export type TransactionType = "BUY" | "SELL" | "DIVIDEND" | "DEPOSIT" | "WITHDRAW";
export type TransactionStatus = "COMPLETED" | "PENDING" | "CANCELLED";

export interface Transaction {
  id: string;
  type: TransactionType;
  symbol?: string;
  name?: string;
  quantity?: number;
  price?: number;
  amount: number;
  fee: number;
  status: TransactionStatus;
  date: string;
  note?: string;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────
export interface WatchlistItem {
  symbol: string;
  name: string;
  sector: StockSector;
  price: number;
  change: number;
  changePercent: number;
  alertPrice?: number;
  alertEnabled: boolean;
  addedAt: string;
}

// ─── Trending / Hot Stocks ────────────────────────────────────────────────────
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

// ─── News ─────────────────────────────────────────────────────────────────────
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

// ─── Redux State Shapes ───────────────────────────────────────────────────────
export interface PortfolioState {
  holdings: Holding[];
  summary: PortfolioSummary;
  performance: PortfolioPerformance[];
  allocation: AllocationData[];
  loading: boolean;
  error: string | null;
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

export interface TransactionState {
  transactions: Transaction[];
  filter: TransactionFilter;
  loading: boolean;
  error: string | null;
}

export interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  activeModal: string | null;
  theme: "light" | "dark";
  notifications: Notification[];
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface TransactionFilter {
  type: TransactionType | "ALL";
  status: TransactionStatus | "ALL";
  dateFrom: string | null;
  dateTo: string | null;
  search: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

// ─── Stock Detail ─────────────────────────────────────────────────────────────
export interface StockDetail {
  symbol:         string;
  name:           string;
  price:          number;
  change:         number;
  changePercent:  number;
  open?:          number;
  prevClose?:     number;
  dayHigh?:       number;
  dayLow?:        number;
  marketCap?:     number;
  volume?:        number;
  avgVolume?:     number;
  pe?:            number;
  eps?:           number;
  dividendYield?: number;
  high52?:        number;
  low52?:         number;
  beta?:          number;
  sector?:        string;
  industry?:      string;
  description?:   string;
  website?:       string;
  country?:       string;
  exchange?:      string;
  currency?:      string;
  quoteType?:     string;
  employees?:     number;
}

// ─── Landing / Promo Content ──────────────────────────────────────────────────
export interface PromoItem {
  id:       string;
  gradient: string;
  badge:    string;
  emoji:    string;
  title:    string;
  subtitle: string;
  cta:      string;
  ctaHref:  string;
}

export interface LearnTopic {
  icon:  string;
  title: string;
  desc:  string;
  time:  string;
}

export interface Article {
  id:       string;
  tag:      string;
  tagColor: string;
  title:    string;
  excerpt:  string;
  readTime: string;
  date:     string;
  gradient: string;
}

// ─── Component Props ──────────────────────────────────────────────────────────
export interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}
