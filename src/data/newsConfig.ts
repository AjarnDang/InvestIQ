/**
 * Per-source color configuration for news badges and card accents.
 * Used in both the Home page news preview and the full News page.
 */
export const NEWS_SOURCE_BADGE: Record<string, { bg: string; text: string }> = {
  "MarketWatch":  { bg: "bg-emerald-100", text: "text-emerald-700" },
  "CNBC":         { bg: "bg-red-100",     text: "text-red-700"     },
  "Reuters":      { bg: "bg-orange-100",  text: "text-orange-700"  },
  "Bangkok Post": { bg: "bg-blue-100",    text: "text-blue-700"    },
};

/** Card top-border accent colour per source (News page grid). */
export const NEWS_SOURCE_ACCENT: Record<string, string> = {
  "MarketWatch":  "border-t-emerald-400",
  "CNBC":         "border-t-red-400",
  "Reuters":      "border-t-orange-400",
  "Bangkok Post": "border-t-blue-400",
};

/** Returns Tailwind badge classes for a given news source. */
export function getSourceBadgeClass(source: string): string {
  const cfg = NEWS_SOURCE_BADGE[source];
  return cfg ? `${cfg.bg} ${cfg.text}` : "bg-slate-100 text-slate-600";
}

/** Returns Tailwind border-top accent class for a given news source. */
export function getSourceAccentClass(source: string): string {
  return NEWS_SOURCE_ACCENT[source] ?? "border-t-slate-300";
}
