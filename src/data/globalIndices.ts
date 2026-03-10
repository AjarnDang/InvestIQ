export interface GlobalIndexMeta {
  yahooSymbol: string;
  displayName: string;
  shortName: string;
  type: "index" | "forex";
  flag: string; // emoji flag for display
}

export const GLOBAL_INDEX_META: GlobalIndexMeta[] = [
  { yahooSymbol: "^GSPC",  displayName: "S&P 500",    shortName: "S&P 500",  type: "index", flag: "🇺🇸" },
  { yahooSymbol: "^IXIC",  displayName: "NASDAQ",      shortName: "NASDAQ",   type: "index", flag: "🇺🇸" },
  { yahooSymbol: "^DJI",   displayName: "Dow Jones",   shortName: "DJI",      type: "index", flag: "🇺🇸" },
  { yahooSymbol: "THB=X",  displayName: "USD/THB",     shortName: "USD/THB",  type: "forex", flag: "💵" },
];

export const ALL_GLOBAL_SYMBOLS = GLOBAL_INDEX_META.map((m) => m.yahooSymbol).join(",");

/** Quick lookup: yahooSymbol → GlobalIndexMeta */
export const GLOBAL_YAHOO_TO_META: Record<string, GlobalIndexMeta> = Object.fromEntries(
  GLOBAL_INDEX_META.map((m) => [m.yahooSymbol, m])
);
