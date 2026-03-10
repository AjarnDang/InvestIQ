export const locales = ["en", "th"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";

export const localeNames: Record<Locale, string> = {
  en: "English",
  th: "ภาษาไทย",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  th: "🇹🇭",
};

/** Detect the best locale from a browser Accept-Language string or navigator.language */
export function detectLocale(lang: string): Locale {
  if (lang.toLowerCase().startsWith("th")) return "th";
  return "en";
}
