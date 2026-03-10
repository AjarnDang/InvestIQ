"use client";

import { useAppSelector } from "@/src/store/hooks";
import en, { type Messages } from "./messages/en";
import th from "./messages/th";

const messages: Record<string, Messages> = { en, th };

/** Typed path helper — supports up to 2 levels deep */
type Leaves<T, P extends string = ""> = T extends string
  ? P
  : {
      [K in keyof T & string]: Leaves<
        T[K],
        P extends "" ? K : `${P}.${K}`
      >;
    }[keyof T & string];

type TranslationKey = Leaves<Messages>;

/**
 * Returns the translations for the current locale (from Redux) and a `t` helper.
 *
 * Usage:
 *   const { t, locale } = useTranslations();
 *   t("nav.home")         // → "Home" | "หน้าหลัก"
 */
export function useTranslations() {
  const locale = useAppSelector((s) => s.locale.locale);
  const dict = messages[locale] ?? en;

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const parts = (key as string).split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = dict;
    for (const part of parts) {
      value = value?.[part];
    }
    const str = typeof value === "string" ? value : (key as string);
    if (!vars) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
  }

  return { t, locale };
}
