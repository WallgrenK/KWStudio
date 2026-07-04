import { useCallback } from "react";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type FinanceFormState = {
  fiscalYear: string;
  defaultCurrency: string;
  basAccountPlan: string;
  defaultPaymentAccount: string;
  reserveAccount: string;
  defaultVatRate: string;
};

const INITIAL: FinanceFormState = {
  fiscalYear: "Calendar year (Jan–Dec)",
  defaultCurrency: "SEK",
  basAccountPlan: "BAS 2024",
  defaultPaymentAccount: "1930",
  reserveAccount: "2018",
  defaultVatRate: "25",
};

export function FinanceSettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("finance", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Finance"
      description="Default finance configuration for ledger accounts, fiscal periods, and VAT."
    >
      <SettingsFieldStack>
        <SettingsFieldRow>
          <SettingsGroup label="Fiscal year" htmlFor="finance-fiscal-year">
            <input id="finance-fiscal-year" className={settingsInputClassName(true)} value={values.fiscalYear} disabled />
          </SettingsGroup>
          <SettingsGroup label="Default currency" htmlFor="finance-default-currency">
            <input id="finance-default-currency" className={settingsInputClassName(true)} value={values.defaultCurrency} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="BAS account plan" htmlFor="finance-bas-plan">
            <input id="finance-bas-plan" className={settingsInputClassName(true)} value={values.basAccountPlan} disabled />
          </SettingsGroup>
          <SettingsGroup label="Default payment account" htmlFor="finance-payment-account">
            <input id="finance-payment-account" className={settingsInputClassName(true)} value={values.defaultPaymentAccount} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="Reserve account" htmlFor="finance-reserve-account">
            <input id="finance-reserve-account" className={settingsInputClassName(true)} value={values.reserveAccount} disabled />
          </SettingsGroup>
          <SettingsGroup label="Default VAT rate" htmlFor="finance-default-vat-rate">
            <input id="finance-default-vat-rate" className={settingsInputClassName(true)} value={values.defaultVatRate} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>Finance defaults are read-only until general finance settings are implemented.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
