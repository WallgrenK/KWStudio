import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  EMPTY_FINANCE_FORM,
  financeToFormState,
  financeToPatch,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function FinanceSettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "finance",
    emptyForm: EMPTY_FINANCE_FORM,
    toFormState: financeToFormState,
    toPatch: financeToPatch,
  });

  return (
    <SettingsSection
      title="Finance"
      description="Default finance configuration for ledger accounts, fiscal periods, and VAT."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading finance settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="Fiscal year" htmlFor="finance-fiscal-year">
              <input
                id="finance-fiscal-year"
                className={settingsInputClassName()}
                value={values.fiscalYear}
                onChange={(event) => setField("fiscalYear", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Default currency" htmlFor="finance-default-currency">
              <input
                id="finance-default-currency"
                className={settingsInputClassName()}
                value={values.defaultCurrency}
                onChange={(event) => setField("defaultCurrency", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="BAS account plan" htmlFor="finance-bas-plan">
              <input
                id="finance-bas-plan"
                className={settingsInputClassName()}
                value={values.basAccountPlan}
                onChange={(event) => setField("basAccountPlan", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Default payment account" htmlFor="finance-payment-account">
              <input
                id="finance-payment-account"
                className={settingsInputClassName()}
                value={values.defaultPaymentAccount}
                onChange={(event) => setField("defaultPaymentAccount", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Reserve account" htmlFor="finance-reserve-account">
              <input
                id="finance-reserve-account"
                className={settingsInputClassName()}
                value={values.reserveAccount}
                onChange={(event) => setField("reserveAccount", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Default VAT rate (%)" htmlFor="finance-default-vat-rate">
              <input
                id="finance-default-vat-rate"
                className={settingsInputClassName()}
                value={values.defaultVatRate}
                onChange={(event) => setField("defaultVatRate", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Invoice number prefix" htmlFor="finance-invoice-prefix">
              <input
                id="finance-invoice-prefix"
                className={settingsInputClassName()}
                value={values.invoiceNumberPrefix}
                onChange={(event) => setField("invoiceNumberPrefix", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Payment terms (days)" htmlFor="finance-payment-terms">
              <input
                id="finance-payment-terms"
                className={settingsInputClassName()}
                value={values.paymentTermsDays}
                onChange={(event) => setField("paymentTermsDays", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsGroup label="Invoice footer" htmlFor="finance-invoice-footer">
            <textarea
              id="finance-invoice-footer"
              className={`${settingsInputClassName()} min-h-20 py-3`}
              value={values.invoiceFooter}
              onChange={(event) => setField("invoiceFooter", event.target.value)}
            />
          </SettingsGroup>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
