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

const DEFAULT_URLS: Record<EnvKey, string> = {
  YAHOO_QUERY1_BASE_URL: "https://query1.finance.yahoo.com",
  YAHOO_QUERY2_BASE_URL: "https://query2.finance.yahoo.com",
  YAHOO_FINANCE_ORIGIN: "https://finance.yahoo.com",
  YAHOO_FINANCE_REFERER: "https://finance.yahoo.com/",
  ALPHA_VANTAGE_BASE_URL: "https://www.alphavantage.co/query",
  ALTERNATIVE_FNG_URL: "https://api.alternative.me/fng/?limit=400",
  STOCKANALYSIS_BASE_URL: "https://stockanalysis.com",
  NEWS_RSS_MARKETWATCH_URL: "https://feeds.marketwatch.com/marketwatch/topstories/",
  NEWS_RSS_CNBC_URL: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
  NEWS_RSS_REUTERS_URL: "https://feeds.reuters.com/reuters/businessNews",
  NEWS_RSS_BANGKOKPOST_URL: "https://www.bangkokpost.com/rss/data/business.xml",
};

function envOrDefault(key: EnvKey): string {
  const v = process.env[key];
  return (v && v.trim()) ? v.trim() : DEFAULT_URLS[key];
}

function joinUrl(base: string, path: string): string {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

export const EXTERNAL_URLS = {
  yahooQuery1Base: envOrDefault("YAHOO_QUERY1_BASE_URL"),
  yahooQuery2Base: envOrDefault("YAHOO_QUERY2_BASE_URL"),
  yahooFinanceOrigin: envOrDefault("YAHOO_FINANCE_ORIGIN"),
  yahooFinanceReferer: envOrDefault("YAHOO_FINANCE_REFERER"),

  alphaVantageBase: envOrDefault("ALPHA_VANTAGE_BASE_URL"),
  alternativeFngUrl: envOrDefault("ALTERNATIVE_FNG_URL"),
  stockanalysisBase: envOrDefault("STOCKANALYSIS_BASE_URL"),

  newsRssMarketWatch: envOrDefault("NEWS_RSS_MARKETWATCH_URL"),
  newsRssCnbc: envOrDefault("NEWS_RSS_CNBC_URL"),
  newsRssReuters: envOrDefault("NEWS_RSS_REUTERS_URL"),
  newsRssBangkokPost: envOrDefault("NEWS_RSS_BANGKOKPOST_URL"),
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

