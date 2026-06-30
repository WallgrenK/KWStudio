export type Locale = "en" | "sv";

export type TranslationPrimitive = string | number | boolean | null;
export type TranslationValue = TranslationPrimitive | TranslationValue[] | { [key: string]: TranslationValue };
export type Dictionary = Record<string, any>;

export const supportedLocales: Locale[] = ["en", "sv"];
export const defaultLocale: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "sv";
}
