import type { StockSector } from "@/src/types";

export interface StockMeta {
  /** Internal symbol without exchange suffix (e.g. "PTT") */
  symbol: string;
  /** Yahoo Finance ticker (e.g. "PTT.BK") */
  yahooSymbol: string;
  /** Full company name */
  name: string;
  sector: StockSector;
}

/** All tracked SET stocks */
export const STOCK_META: StockMeta[] = [
  { symbol: "PTT",    yahooSymbol: "PTT.BK",    name: "PTT Public Company Limited",    sector: "Energy"     },
  { symbol: "KBANK",  yahooSymbol: "KBANK.BK",  name: "Kasikornbank PCL",              sector: "Banking"    },
  { symbol: "AOT",    yahooSymbol: "AOT.BK",    name: "Airports of Thailand PCL",      sector: "Industrial" },
  { symbol: "CPALL",  yahooSymbol: "CPALL.BK",  name: "CP All PCL",                    sector: "Consumer"   },
  { symbol: "SCB",    yahooSymbol: "SCB.BK",    name: "SCB X PCL",                     sector: "Banking"    },
  { symbol: "SCC",    yahooSymbol: "SCC.BK",    name: "Siam Cement Group PCL",         sector: "Industrial" },
  { symbol: "ADVANC", yahooSymbol: "ADVANC.BK", name: "Advanced Info Service PCL",     sector: "Technology" },
  { symbol: "DELTA",  yahooSymbol: "DELTA.BK",  name: "Delta Electronics Thailand PCL",sector: "Technology" },
  { symbol: "BBL",    yahooSymbol: "BBL.BK",    name: "Bangkok Bank PCL",              sector: "Banking"    },
  { symbol: "TRUE",   yahooSymbol: "TRUE.BK",   name: "True Corporation PCL",          sector: "Technology" },
];

/** All Yahoo Finance index tickers to fetch */
export interface IndexMeta {
  yahooSymbol: string;
  displayName: string;
}

export const INDEX_META: IndexMeta[] = [
  { yahooSymbol: "^SET",    displayName: "SET Index" },
  { yahooSymbol: "^SET50",  displayName: "SET50"     },
  { yahooSymbol: "^SET100", displayName: "SET100"    },
  { yahooSymbol: "^MAI",    displayName: "MAI"       },
];

/** Quick lookup: yahooSymbol → StockMeta */
export const YAHOO_TO_META: Record<string, StockMeta> = Object.fromEntries(
  STOCK_META.map((m) => [m.yahooSymbol, m])
);

/** Quick lookup: internal symbol → StockMeta */
export const SYMBOL_TO_META: Record<string, StockMeta> = Object.fromEntries(
  STOCK_META.map((m) => [m.symbol, m])
);

/** All Yahoo stock symbols joined for a query string */
export const ALL_YAHOO_STOCK_SYMBOLS = STOCK_META.map((m) => m.yahooSymbol).join(",");

/** All Yahoo index symbols joined for a query string */
export const ALL_YAHOO_INDEX_SYMBOLS = INDEX_META.map((m) => m.yahooSymbol).join(",");
