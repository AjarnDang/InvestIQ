import type { Stock } from "@/src/types";
import { STOCK_META } from "@/src/data/sectorMap";

/**
 * Emergency fallback skeleton — generated automatically from STOCK_META.
 *
 * Prices are all 0 and are only shown when the Yahoo Finance API is completely
 * unreachable. The market UI renders loading skeletons until real data arrives,
 * so this data should rarely (if ever) be visible to users.
 *
 * DO NOT manually maintain this list — edit STOCK_META in sectorMap.ts instead.
 */
export const MOCK_STOCKS: Stock[] = STOCK_META.map((m) => ({
  symbol:         m.symbol,
  name:           m.name,
  sector:         m.sector,
  instrumentType: m.type ?? "STOCK",
  exchange:       m.exchange,
  price:          0,
  change:         0,
  changePercent:  0,
  volume:         0,
  marketCap:      0,
  high52w:        0,
  low52w:         0,
}));
