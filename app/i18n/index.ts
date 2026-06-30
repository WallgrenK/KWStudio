import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "./en";
import { sv } from "./sv";
import { defaultLocale, isLocale, type Dictionary, type Locale, type TranslationValue } from "./types";

const dictionaries: Record<Locale, Dictionary> = { en, sv };
const storageKey = "kwstudio-language";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dictionary: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getNestedValue(dictionary: Dictionary, key: string): TranslationValue | undefined {
  return key.split(".").reduce<TranslationValue | undefined>((current, part) => {
    if (Array.isArray(current) && /^\d+$/.test(part)) {
      return current[Number(part)];
    }

    if (current && typeof current === "object" && !Array.isArray(current) && part in current) {
      return current[part];
    }

    return undefined;
  }, dictionary);
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const storedLocale = window.localStorage.getItem(storageKey);
  return isLocale(storedLocale) ? storedLocale : defaultLocale;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(storageKey, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale];

    function t(key: string) {
      const translatedValue = getNestedValue(dictionary, key);

      if (typeof translatedValue === "string") {
        return translatedValue;
      }

      const englishValue = getNestedValue(en, key);

      if (typeof englishValue === "string") {
        if (import.meta.env.DEV && locale !== "en") {
          console.warn(`[i18n] Missing "${key}" for locale "${locale}". Falling back to English.`);
        }

        return englishValue;
      }

      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation key "${key}".`);
      }

      return key;
    }

    return {
      locale,
      setLocale: setLocaleState,
      t,
      dictionary,
    };
  }, [locale]);

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider.");
  }

  return context;
}

export { dictionaries };
export type { Locale };
