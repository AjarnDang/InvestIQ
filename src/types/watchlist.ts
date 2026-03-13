// ─── Watchlist ────────────────────────────────────────────────────────────────

import type { StockSector } from "./market";

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

export interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
}

