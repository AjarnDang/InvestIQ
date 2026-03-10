import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Locale, locales, defaultLocale, detectLocale } from "@/src/i18n/config";

interface LocaleState {
  locale: Locale;
}

function loadInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = localStorage.getItem("investiq_locale") as Locale | null;
  if (stored && locales.includes(stored)) return stored;
  return detectLocale(navigator.language ?? "en");
}

const localeSlice = createSlice({
  name: "locale",
  initialState: (): LocaleState => ({ locale: defaultLocale }),
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("investiq_locale", action.payload);
      }
    },
    initLocale(state) {
      state.locale = loadInitialLocale();
    },
  },
});

export const { setLocale, initLocale } = localeSlice.actions;
export default localeSlice.reducer;
