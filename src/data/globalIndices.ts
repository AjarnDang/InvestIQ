export interface GlobalIndexMeta {
  yahooSymbol: string;
  displayName: string;
  shortName: string;
  type: "index" | "forex";
  flag: string;    // emoji flag
  region: string;  // display region label
}

export const GLOBAL_INDEX_META: GlobalIndexMeta[] = [
  // ── United States ─────────────────────────────────────────────────────────
  { yahooSymbol: "^GSPC",  displayName: "S&P 500",       shortName: "S&P 500",  type: "index", flag: "🇺🇸", region: "สหรัฐอเมริกา" },
  { yahooSymbol: "^IXIC",  displayName: "NASDAQ",         shortName: "NASDAQ",   type: "index", flag: "🇺🇸", region: "สหรัฐอเมริกา" },
  { yahooSymbol: "^DJI",   displayName: "Dow Jones",      shortName: "DJI",      type: "index", flag: "🇺🇸", region: "สหรัฐอเมริกา" },
  // ── Forex ─────────────────────────────────────────────────────────────────
  { yahooSymbol: "THB=X",  displayName: "USD/THB",        shortName: "USD/THB",  type: "forex", flag: "💵", region: "ค่าเงิน" },
  // ── Europe ────────────────────────────────────────────────────────────────
  { yahooSymbol: "^FTSE",  displayName: "FTSE 100",       shortName: "FTSE 100", type: "index", flag: "🇬🇧", region: "สหราชอาณาจักร" },
  { yahooSymbol: "^FCHI",  displayName: "CAC 40",         shortName: "CAC 40",   type: "index", flag: "🇫🇷", region: "ฝรั่งเศส" },
  { yahooSymbol: "^GDAXI", displayName: "DAX",            shortName: "DAX",      type: "index", flag: "🇩🇪", region: "เยอรมนี" },
  // ── Asia-Pacific ──────────────────────────────────────────────────────────
  { yahooSymbol: "^N225",  displayName: "Nikkei 225",     shortName: "N225",     type: "index", flag: "🇯🇵", region: "ญี่ปุ่น" },
  { yahooSymbol: "^HSI",   displayName: "Hang Seng",      shortName: "HSI",      type: "index", flag: "🇭🇰", region: "ฮ่องกง" },
  { yahooSymbol: "^KS11",  displayName: "KOSPI",          shortName: "KOSPI",    type: "index", flag: "🇰🇷", region: "เกาหลีใต้" },
  { yahooSymbol: "000300.SS", displayName: "CSI 300",     shortName: "CSI 300",  type: "index", flag: "🇨🇳", region: "จีน" },
];

export const ALL_GLOBAL_SYMBOLS = GLOBAL_INDEX_META.map((m) => m.yahooSymbol).join(",");

/** Quick lookup: yahooSymbol → GlobalIndexMeta */
export const GLOBAL_YAHOO_TO_META: Record<string, GlobalIndexMeta> = Object.fromEntries(
  GLOBAL_INDEX_META.map((m) => [m.yahooSymbol, m])
);

/** Quick lookup: displayName → GlobalIndexMeta */
export const GLOBAL_NAME_TO_META: Record<string, GlobalIndexMeta> = Object.fromEntries(
  GLOBAL_INDEX_META.map((m) => [m.displayName, m])
);
