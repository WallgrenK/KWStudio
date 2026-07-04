import type { TaxForecastMode, TaxSettingsDto } from "~/services/financeApi";

export type TaxSettingsFormState = {
  municipality_code: string;
  municipal_tax_rate: string;
  church_tax_enabled: boolean;
  church_tax_rate: string;
  egenavgifter_rate: string;
  state_tax_enabled: boolean;
  state_tax_rate: string;
  state_tax_threshold: string;
  tax_reserve_account: string;
  operating_bank_account: string;
  forecast_default_mode: TaxForecastMode;
};

export function settingsToFormState(settings: TaxSettingsDto): TaxSettingsFormState {
  return {
    municipality_code: settings.municipality_code ?? "",
    municipal_tax_rate: settings.municipal_tax_rate !== null ? String(settings.municipal_tax_rate) : "",
    church_tax_enabled: settings.church_tax_enabled,
    church_tax_rate: settings.church_tax_rate !== null ? String(settings.church_tax_rate) : "",
    egenavgifter_rate: settings.egenavgifter_rate !== null ? String(settings.egenavgifter_rate) : "",
    state_tax_enabled: settings.state_tax_enabled,
    state_tax_rate: settings.state_tax_rate !== null ? String(settings.state_tax_rate) : "",
    state_tax_threshold: settings.state_tax_threshold !== null ? String(settings.state_tax_threshold) : "",
    tax_reserve_account: settings.tax_reserve_account,
    operating_bank_account: settings.operating_bank_account,
    forecast_default_mode: settings.forecast_default_mode,
  };
}

export function parseOptionalRate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export const TAX_FORECAST_MODE_OPTIONS: Array<{ label: string; value: TaxForecastMode }> = [
  { label: "YTD only", value: "ytd_only" },
  { label: "Linear annualization", value: "ytd_linear" },
  { label: "Manual override", value: "manual" },
  { label: "Scenario (base)", value: "scenario" },
];
