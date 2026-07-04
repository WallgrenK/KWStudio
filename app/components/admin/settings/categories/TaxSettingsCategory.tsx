import { useCallback, useEffect, useState } from "react";
import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { getTaxSettings, updateTaxSettings } from "~/services/financeApi";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  parseOptionalRate,
  settingsToFormState,
  TAX_FORECAST_MODE_OPTIONS,
  type TaxSettingsFormState,
} from "../taxSettingsForm";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

const EMPTY_FORM: TaxSettingsFormState = {
  municipality_code: "",
  municipal_tax_rate: "",
  church_tax_enabled: false,
  church_tax_rate: "",
  egenavgifter_rate: "",
  state_tax_enabled: false,
  state_tax_rate: "",
  state_tax_threshold: "",
  tax_reserve_account: "",
  operating_bank_account: "",
  forecast_default_mode: "ytd_linear",
};

export function TaxSettingsCategory() {
  const { registerHandlers, unregisterHandlers, reportStatus } = useSettingsContext();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { values, setField, setBaseline, isDirty, reset } = useSettingsForm(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);

      const result = await getTaxSettings();
      if (cancelled) return;

      if (result.ok && result.data) {
        const formState = settingsToFormState(result.data.settings);
        setBaseline(formState);
        reportStatus("tax", "configured");
      } else {
        setLoadError(result.error ?? "Could not load tax settings.");
        reportStatus("tax", "error");
      }

      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reportStatus, setBaseline]);

  const save = useCallback(async () => {
    setSaveError(null);

    const result = await updateTaxSettings({
      municipality_code: values.municipality_code.trim() || null,
      municipal_tax_rate: parseOptionalRate(values.municipal_tax_rate),
      church_tax_enabled: values.church_tax_enabled,
      church_tax_rate: parseOptionalRate(values.church_tax_rate),
      egenavgifter_rate: parseOptionalRate(values.egenavgifter_rate),
      state_tax_enabled: values.state_tax_enabled,
      state_tax_rate: parseOptionalRate(values.state_tax_rate),
      state_tax_threshold: parseOptionalRate(values.state_tax_threshold),
      tax_reserve_account: values.tax_reserve_account.trim(),
      operating_bank_account: values.operating_bank_account.trim(),
      forecast_default_mode: values.forecast_default_mode,
    });

    if (result.ok && result.data) {
      const next = settingsToFormState(result.data.settings);
      setBaseline(next);
      reportStatus("tax", "configured");
      return;
    }

    setSaveError(result.error ?? "Could not save tax settings.");
    reportStatus("tax", "error");
  }, [reportStatus, setBaseline, values]);

  useSettingsCategoryRegistration("tax", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Tax"
      description="Swedish tax configuration used by estimation, cash planning, and validation in Finance."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading tax settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="Municipality code" htmlFor="tax-municipality-code">
              <input
                id="tax-municipality-code"
                className={settingsInputClassName()}
                value={values.municipality_code}
                onChange={(event) => setField("municipality_code", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Municipal tax rate (decimal)" htmlFor="tax-municipal-rate">
              <input
                id="tax-municipal-rate"
                className={settingsInputClassName()}
                value={values.municipal_tax_rate}
                placeholder="0.32"
                onChange={(event) => setField("municipal_tax_rate", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={values.church_tax_enabled}
              onChange={(event) => setField("church_tax_enabled", event.target.checked)}
            />
            Church tax enabled
          </label>

          <SettingsFieldRow>
            <SettingsGroup label="Church tax rate (decimal)" htmlFor="tax-church-rate">
              <input
                id="tax-church-rate"
                className={settingsInputClassName()}
                value={values.church_tax_rate}
                onChange={(event) => setField("church_tax_rate", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Egenavgifter rate (decimal)" htmlFor="tax-egenavgifter-rate">
              <input
                id="tax-egenavgifter-rate"
                className={settingsInputClassName()}
                value={values.egenavgifter_rate}
                placeholder="0.2897"
                onChange={(event) => setField("egenavgifter_rate", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={values.state_tax_enabled}
              onChange={(event) => setField("state_tax_enabled", event.target.checked)}
            />
            State income tax enabled
          </label>

          <SettingsFieldRow>
            <SettingsGroup label="State tax rate (decimal)" htmlFor="tax-state-rate">
              <input
                id="tax-state-rate"
                className={settingsInputClassName()}
                value={values.state_tax_rate}
                onChange={(event) => setField("state_tax_rate", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="State tax threshold (SEK)" htmlFor="tax-state-threshold">
              <input
                id="tax-state-threshold"
                className={settingsInputClassName()}
                value={values.state_tax_threshold}
                onChange={(event) => setField("state_tax_threshold", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>

          <SettingsFieldRow>
            <SettingsGroup label="Tax reserve account" htmlFor="tax-reserve-account">
              <input
                id="tax-reserve-account"
                className={settingsInputClassName()}
                value={values.tax_reserve_account}
                onChange={(event) => setField("tax_reserve_account", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Operating bank account" htmlFor="tax-operating-account">
              <input
                id="tax-operating-account"
                className={settingsInputClassName()}
                value={values.operating_bank_account}
                onChange={(event) => setField("operating_bank_account", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>

          <SettingsGroup label="Default forecast mode" htmlFor="tax-forecast-mode">
            <select
              id="tax-forecast-mode"
              className={settingsInputClassName()}
              value={values.forecast_default_mode}
              onChange={(event) => setField("forecast_default_mode", event.target.value as TaxSettingsFormState["forecast_default_mode"])}
            >
              {TAX_FORECAST_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SettingsGroup>

          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
