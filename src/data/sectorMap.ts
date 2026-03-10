import type { StockSector, InstrumentType } from "@/src/types";

// ─── StockMeta ────────────────────────────────────────────────────────────────

export interface StockMeta {
  /** Clean, URL-safe symbol used inside the app (e.g. "PTT", "AAPL", "BTC") */
  symbol:       string;
  /** Exact ticker Yahoo Finance accepts (e.g. "PTT.BK", "AAPL", "BTC-USD") */
  yahooSymbol:  string;
  /** Full display name */
  name:         string;
  /** Industry / asset-class category */
  sector:       StockSector;
  /** Asset class — defaults to "STOCK" when absent */
  type?:        InstrumentType;
  /** Listing exchange (informational) */
  exchange?:    string;
}

// ─── Thai SET Stocks ──────────────────────────────────────────────────────────

export const STOCK_META: StockMeta[] = [
  // ── Energy ──────────────────────────────────────────────────────────────────
  { symbol: "PTT",    yahooSymbol: "PTT.BK",    name: "PTT Public Company Limited",          sector: "Energy",        exchange: "SET" },
  { symbol: "PTTGC",  yahooSymbol: "PTTGC.BK",  name: "PTT Global Chemical PCL",             sector: "Energy",        exchange: "SET" },
  { symbol: "TOP",    yahooSymbol: "TOP.BK",     name: "Thai Oil PCL",                        sector: "Energy",        exchange: "SET" },
  { symbol: "IRPC",   yahooSymbol: "IRPC.BK",    name: "IRPC PCL",                            sector: "Energy",        exchange: "SET" },
  { symbol: "RATCH",  yahooSymbol: "RATCH.BK",   name: "Ratch Group PCL",                     sector: "Energy",        exchange: "SET" },
  { symbol: "BGRIM",  yahooSymbol: "BGRIM.BK",   name: "B.Grimm Power PCL",                   sector: "Energy",        exchange: "SET" },
  { symbol: "EA",     yahooSymbol: "EA.BK",       name: "Energy Absolute PCL",                 sector: "Energy",        exchange: "SET" },
  { symbol: "GULF",   yahooSymbol: "GULF.BK",    name: "Gulf Energy Development PCL",          sector: "Energy",        exchange: "SET" },

  // ── Banking ──────────────────────────────────────────────────────────────────
  { symbol: "KBANK",  yahooSymbol: "KBANK.BK",   name: "Kasikornbank PCL",                    sector: "Banking",       exchange: "SET" },
  { symbol: "SCB",    yahooSymbol: "SCB.BK",      name: "SCB X PCL",                           sector: "Banking",       exchange: "SET" },
  { symbol: "BBL",    yahooSymbol: "BBL.BK",      name: "Bangkok Bank PCL",                    sector: "Banking",       exchange: "SET" },
  { symbol: "KTB",    yahooSymbol: "KTB.BK",      name: "Krungthai Bank PCL",                  sector: "Banking",       exchange: "SET" },
  { symbol: "BAY",    yahooSymbol: "BAY.BK",      name: "Bank of Ayudhya PCL",                 sector: "Banking",       exchange: "SET" },
  { symbol: "KTC",    yahooSymbol: "KTC.BK",      name: "Krungthai Card PCL",                  sector: "Finance",       exchange: "SET" },

  // ── Technology / Telecom ──────────────────────────────────────────────────────
  { symbol: "ADVANC", yahooSymbol: "ADVANC.BK",  name: "Advanced Info Service PCL",           sector: "Technology",    exchange: "SET" },
  { symbol: "DELTA",  yahooSymbol: "DELTA.BK",    name: "Delta Electronics Thailand PCL",      sector: "Technology",    exchange: "SET" },
  { symbol: "TRUE",   yahooSymbol: "TRUE.BK",     name: "True Corporation PCL",                sector: "Technology",    exchange: "SET" },
  { symbol: "HANA",   yahooSymbol: "HANA.BK",     name: "Hana Microelectronics PCL",           sector: "Technology",    exchange: "SET" },

  // ── Consumer / Retail ──────────────────────────────────────────────────────────
  { symbol: "CPALL",  yahooSymbol: "CPALL.BK",   name: "CP All PCL",                          sector: "Consumer",      exchange: "SET" },
  { symbol: "BJC",    yahooSymbol: "BJC.BK",      name: "Berli Jucker PCL",                    sector: "Consumer",      exchange: "SET" },
  { symbol: "TU",     yahooSymbol: "TU.BK",       name: "Thai Union Group PCL",                sector: "Consumer",      exchange: "SET" },
  { symbol: "CPF",    yahooSymbol: "CPF.BK",      name: "Charoen Pokphand Foods PCL",          sector: "Consumer",      exchange: "SET" },
  { symbol: "MINT",   yahooSymbol: "MINT.BK",     name: "Minor International PCL",             sector: "Consumer",      exchange: "SET" },
  { symbol: "CENTEL", yahooSymbol: "CENTEL.BK",   name: "Central Plaza Hotel PCL",             sector: "Consumer",      exchange: "SET" },

  // ── Industrial / Infrastructure ───────────────────────────────────────────────
  { symbol: "SCC",    yahooSymbol: "SCC.BK",      name: "Siam Cement Group PCL",               sector: "Industrial",    exchange: "SET" },
  { symbol: "AOT",    yahooSymbol: "AOT.BK",      name: "Airports of Thailand PCL",            sector: "Industrial",    exchange: "SET" },
  { symbol: "BH",     yahooSymbol: "BH.BK",       name: "Bumrungrad Hospital PCL",             sector: "Healthcare",    exchange: "SET" },

  // ── US Stocks ─────────────────────────────────────────────────────────────────
  { symbol: "AAPL",   yahooSymbol: "AAPL",        name: "Apple Inc.",                          sector: "Technology",    exchange: "NASDAQ" },
  { symbol: "MSFT",   yahooSymbol: "MSFT",        name: "Microsoft Corporation",               sector: "Technology",    exchange: "NASDAQ" },
  { symbol: "NVDA",   yahooSymbol: "NVDA",        name: "NVIDIA Corporation",                  sector: "Technology",    exchange: "NASDAQ" },
  { symbol: "GOOGL",  yahooSymbol: "GOOGL",       name: "Alphabet Inc.",                       sector: "Communication", exchange: "NASDAQ" },
  { symbol: "META",   yahooSymbol: "META",        name: "Meta Platforms Inc.",                 sector: "Communication", exchange: "NASDAQ" },
  { symbol: "AMZN",   yahooSymbol: "AMZN",        name: "Amazon.com Inc.",                     sector: "Consumer",      exchange: "NASDAQ" },
  { symbol: "TSLA",   yahooSymbol: "TSLA",        name: "Tesla Inc.",                          sector: "Consumer",      exchange: "NASDAQ" },
  { symbol: "NFLX",   yahooSymbol: "NFLX",        name: "Netflix Inc.",                        sector: "Communication", exchange: "NASDAQ" },
  { symbol: "JPM",    yahooSymbol: "JPM",         name: "JPMorgan Chase & Co.",                sector: "Finance",       exchange: "NYSE"   },
  { symbol: "XOM",    yahooSymbol: "XOM",         name: "Exxon Mobil Corporation",             sector: "Energy",        exchange: "NYSE"   },

  // ── ETFs ──────────────────────────────────────────────────────────────────────
  { symbol: "SPY",    yahooSymbol: "SPY",         name: "SPDR S&P 500 ETF Trust",              sector: "ETF", type: "ETF", exchange: "NYSE"    },
  { symbol: "QQQ",    yahooSymbol: "QQQ",         name: "Invesco QQQ Trust (Nasdaq-100)",       sector: "ETF", type: "ETF", exchange: "NASDAQ"  },
  { symbol: "VTI",    yahooSymbol: "VTI",         name: "Vanguard Total Stock Market ETF",      sector: "ETF", type: "ETF", exchange: "NYSE"    },
  { symbol: "TLT",    yahooSymbol: "TLT",         name: "iShares 20+ Year Treasury Bond ETF",  sector: "ETF", type: "ETF", exchange: "NASDAQ"  },
  { symbol: "AGG",    yahooSymbol: "AGG",         name: "iShares Core U.S. Aggregate Bond ETF", sector: "ETF", type: "ETF", exchange: "NYSE"   },
  { symbol: "GLD",    yahooSymbol: "GLD",         name: "SPDR Gold Shares ETF",                sector: "ETF", type: "ETF", exchange: "NYSE"    },
  { symbol: "SLV",    yahooSymbol: "SLV",         name: "iShares Silver Trust ETF",            sector: "ETF", type: "ETF", exchange: "NYSE"    },
  { symbol: "USO",    yahooSymbol: "USO",         name: "United States Oil Fund ETF",          sector: "ETF", type: "ETF", exchange: "NYSE"    },

  // ── Crypto ────────────────────────────────────────────────────────────────────
  { symbol: "BTC",    yahooSymbol: "BTC-USD",     name: "Bitcoin",                             sector: "Crypto", type: "CRYPTO" },
  { symbol: "ETH",    yahooSymbol: "ETH-USD",     name: "Ethereum",                            sector: "Crypto", type: "CRYPTO" },
  { symbol: "BNB",    yahooSymbol: "BNB-USD",     name: "BNB (Binance Coin)",                  sector: "Crypto", type: "CRYPTO" },
  { symbol: "SOL",    yahooSymbol: "SOL-USD",     name: "Solana",                              sector: "Crypto", type: "CRYPTO" },
];

// ─── SET Index Registry ────────────────────────────────────────────────────────

export interface IndexMeta {
  yahooSymbol:  string;
  displayName:  string;
}

export const INDEX_META: IndexMeta[] = [
  { yahooSymbol: "^SET",    displayName: "SET Index" },
  { yahooSymbol: "^SET50",  displayName: "SET50"     },
  { yahooSymbol: "^SET100", displayName: "SET100"    },
  { yahooSymbol: "^MAI",    displayName: "MAI"       },
];

// ─── Lookup Maps ──────────────────────────────────────────────────────────────

/** Yahoo Finance symbol → StockMeta */
export const YAHOO_TO_META: Record<string, StockMeta> = Object.fromEntries(
  STOCK_META.map((m) => [m.yahooSymbol, m])
);

/** Internal (app) symbol → StockMeta */
export const SYMBOL_TO_META: Record<string, StockMeta> = Object.fromEntries(
  STOCK_META.map((m) => [m.symbol, m])
);

/** All Yahoo stock symbols, comma-joined for API calls */
export const ALL_YAHOO_STOCK_SYMBOLS = STOCK_META.map((m) => m.yahooSymbol).join(",");

/** All Yahoo index symbols, comma-joined for API calls */
export const ALL_YAHOO_INDEX_SYMBOLS = INDEX_META.map((m) => m.yahooSymbol).join(",");

/** Array of Yahoo symbols grouped into chunks of `size` (for chunked API calls) */
export function chunkYahooSymbols(size = 25): string[][] {
  const syms = STOCK_META.map((m) => m.yahooSymbol);
  const chunks: string[][] = [];
  for (let i = 0; i < syms.length; i += size) {
    chunks.push(syms.slice(i, i + size));
  }
  return chunks;
}
