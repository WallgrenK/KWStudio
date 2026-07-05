import type { WorkspaceSettingsDto } from "./settingsTypes";
import { DEFAULT_FINANCE_SETTINGS, DEFAULT_WORKSPACE_SETTINGS } from "./settingsDefaults";

export type FormatCurrencyOptions = {
  locale?: string;
  currency?: string;
  fallback?: string;
};

export type FormatDateOptions = {
  locale?: string;
  fallback?: string;
  dateStyle?: "short" | "medium" | "long" | "full";
  timeStyle?: "short" | "medium" | "long" | "full";
};

export function formatCurrency(
  value: number | null | undefined,
  options: FormatCurrencyOptions = {},
): string {
  const fallback = options.fallback ?? "-";
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;

  const locale = options.locale ?? DEFAULT_WORKSPACE_SETTINGS.locale;
  const currency = options.currency ?? DEFAULT_FINANCE_SETTINGS.defaultCurrency;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${new Intl.NumberFormat(locale).format(value)} ${currency}`;
  }
}

export function formatDate(
  value: string | Date | null | undefined,
  options: FormatDateOptions = {},
): string {
  const fallback = options.fallback ?? "-";
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : fallback;
  }

  const locale = options.locale ?? DEFAULT_WORKSPACE_SETTINGS.locale;

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: options.dateStyle ?? "medium",
      timeStyle: options.timeStyle,
    }).format(date);
  } catch {
    return fallback;
  }
}

export function formatShortDate(
  value: string | Date | null | undefined,
  options: Omit<FormatDateOptions, "dateStyle"> = {},
): string {
  const fallback = options.fallback ?? "-";
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : fallback;
  }

  const locale = options.locale ?? DEFAULT_WORKSPACE_SETTINGS.locale;

  try {
    return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
  } catch {
    return fallback;
  }
}

export function resolveFormatLocale(workspace?: Pick<WorkspaceSettingsDto, "locale"> | null): string {
  return workspace?.locale?.trim() || DEFAULT_WORKSPACE_SETTINGS.locale;
}
