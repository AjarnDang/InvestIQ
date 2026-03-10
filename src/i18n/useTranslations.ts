"use client";

import { useAppSelector } from "@/src/store/hooks";
import en from "./messages/en";
import th from "./messages/th";
import type { Messages } from "./messages/types";

const messages: Record<string, Messages> = { en, th };

/** Typed dot-path for up to 2 levels of the Messages interface */
type Section = keyof Messages;
type TranslationKey = {
  [S in Section]: `${S}.${string & keyof Messages[S]}`;
}[Section];

/**
 * Returns the translations for the current locale (from Redux) and a `t` helper.
 *
 * Usage:
 *   const { t, locale } = useTranslations();
 *   t("nav.home")  // → "Home" | "หน้าหลัก"
 */
export function useTranslations() {
  const locale = useAppSelector((s) => s.locale.locale);
  const dict = messages[locale] ?? en;

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const [section, field] = (key as string).split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (dict as any)[section]?.[field];
    const str = typeof value === "string" ? value : (key as string);
    if (!vars) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
  }

  return { t, locale };
}
