/**
 * Centralized index symbol mapping.
 *
 * URL alias  →  Yahoo Finance ticker
 * Uses short, readable strings (no `^` or `=`) so browser URLs stay clean.
 *
 * Example: navigating to "S&P 500" produces /stocks/SPX, not /stocks/%5EGSPC
 */
export const INDEX_ALIAS_TO_YAHOO: Record<string, string> = {
  // ── Thai SET ────────────────────────────────────────────────────────────────
  SET:      "^SET.BK",
  SET50:    "^SET50.BK",
  SET100:   "^SET100.BK",
  MAI:      "^MAI.BK",

  // ── United States ────────────────────────────────────────────────────────────
  SPX:      "^GSPC",
  NDX:      "^IXIC",
  DJI:      "^DJI",

  // ── Forex ────────────────────────────────────────────────────────────────────
  USDTHB:   "THB=X",

  // ── Europe ────────────────────────────────────────────────────────────────────
  FTSE100:  "^FTSE",
  CAC40:    "^FCHI",
  DAX:      "^GDAXI",

  // ── Asia-Pacific ──────────────────────────────────────────────────────────────
  N225:     "^N225",
  HSI:      "^HSI",
  KOSPI:    "^KS11",
  CSI300:   "000300.SS",
};

/**
 * Display name (as shown in IndexBanner / home page table)  →  URL alias.
 * Used when building navigation links from a human-readable index name.
 */
export const INDEX_DISPLAY_TO_ALIAS: Record<string, string> = {
  // Thai SET
  "SET Index":  "SET",
  "SET50":      "SET50",
  "SET100":     "SET100",
  "MAI":        "MAI",

  // United States
  "S&P 500":    "SPX",
  "NASDAQ":     "NDX",
  "Dow Jones":  "DJI",

  // Forex
  "USD/THB":    "USDTHB",

  // Europe
  "FTSE 100":   "FTSE100",
  "CAC 40":     "CAC40",
  "DAX":        "DAX",

  // Asia-Pacific
  "Nikkei 225": "N225",
  "Hang Seng":  "HSI",
  "KOSPI":      "KOSPI",
  "CSI 300":    "CSI300",
};

/**
 * Resolve a Yahoo Finance ticker from a URL alias.
 * Returns null if the alias is not a known index (caller should treat it as
 * a regular stock symbol and query Yahoo Finance directly).
 */
export function resolveAliasToYahoo(alias: string): string | null {
  return INDEX_ALIAS_TO_YAHOO[alias.toUpperCase()] ?? null;
}

/**
 * Get the URL-safe navigation path segment for a given index display name.
 * Returns the alias string (e.g. "SPX") or null if not found.
 */
export function getIndexNavAlias(displayName: string): string | null {
  return INDEX_DISPLAY_TO_ALIAS[displayName] ?? null;
}
