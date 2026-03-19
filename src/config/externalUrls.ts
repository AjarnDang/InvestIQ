type EnvKey =
  | "YAHOO_QUERY1_BASE_URL"
  | "YAHOO_QUERY2_BASE_URL"
  | "YAHOO_FINANCE_ORIGIN"
  | "YAHOO_FINANCE_REFERER"
  | "ALPHA_VANTAGE_BASE_URL"
  | "ALTERNATIVE_FNG_URL"
  | "STOCKANALYSIS_BASE_URL"
  | "NEWS_RSS_MARKETWATCH_URL"
  | "NEWS_RSS_CNBC_URL"
  | "NEWS_RSS_REUTERS_URL"
  | "NEWS_RSS_BANGKOKPOST_URL";

function requireEnv(key: EnvKey): string {
  const v = process.env[key];
  if (!v || !v.trim()) {
    throw new Error(`Missing required env: ${key}`);
  }
  return v.trim();
}

function joinUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export const EXTERNAL_URLS = {
  yahooQuery1Base: requireEnv("YAHOO_QUERY1_BASE_URL"),
  yahooQuery2Base: requireEnv("YAHOO_QUERY2_BASE_URL"),
  yahooFinanceOrigin: requireEnv("YAHOO_FINANCE_ORIGIN"),
  yahooFinanceReferer: requireEnv("YAHOO_FINANCE_REFERER"),

  alphaVantageBase: requireEnv("ALPHA_VANTAGE_BASE_URL"),
  alternativeFngUrl: requireEnv("ALTERNATIVE_FNG_URL"),
  stockanalysisBase: requireEnv("STOCKANALYSIS_BASE_URL"),

  newsRssMarketWatch: requireEnv("NEWS_RSS_MARKETWATCH_URL"),
  newsRssCnbc: requireEnv("NEWS_RSS_CNBC_URL"),
  newsRssReuters: requireEnv("NEWS_RSS_REUTERS_URL"),
  newsRssBangkokPost: requireEnv("NEWS_RSS_BANGKOKPOST_URL"),
} as const;

export function yahooChartUrl(
  symbol: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  const base = joinUrl(EXTERNAL_URLS.yahooQuery1Base, `/v8/finance/chart/${symbol}`);
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    sp.set(k, String(v));
  }
  return `${base}?${sp.toString()}`;
}

export function yahooV7QuoteUrl(params: Record<string, string | number | boolean | undefined>): string {
  const base = joinUrl(EXTERNAL_URLS.yahooQuery1Base, "/v7/finance/quote");
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    sp.set(k, String(v));
  }
  return `${base}?${sp.toString()}`;
}

export function yahooV10QuoteSummaryUrl(symbol: string, modulesCsv: string): string {
  const base = joinUrl(
    EXTERNAL_URLS.yahooQuery1Base,
    `/v10/finance/quoteSummary/${symbol}`,
  );
  const sp = new URLSearchParams({ modules: modulesCsv });
  return `${base}?${sp.toString()}`;
}

export function yahooV1SearchUrl(params: Record<string, string | number | boolean | undefined>): string {
  const base = joinUrl(EXTERNAL_URLS.yahooQuery1Base, "/v1/finance/search");
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    sp.set(k, String(v));
  }
  return `${base}?${sp.toString()}`;
}

export function yahooQuery2SearchUrl(params: Record<string, string | number | boolean | undefined>): string {
  const base = joinUrl(EXTERNAL_URLS.yahooQuery2Base, "/v1/finance/search");
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    sp.set(k, String(v));
  }
  return `${base}?${sp.toString()}`;
}

export function alphaVantageSymbolSearchUrl(keywords: string, apiKey: string): string {
  const base = EXTERNAL_URLS.alphaVantageBase;
  const sp = new URLSearchParams({
    function: "SYMBOL_SEARCH",
    keywords,
    apikey: apiKey,
  });
  return `${base}?${sp.toString()}`;
}

