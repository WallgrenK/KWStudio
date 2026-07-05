import { DEFAULT_FINANCE_SETTINGS } from "./settingsDefaults";
import { useSettingsCategory } from "./useSettingsCategory";

export function useFinanceSettings() {
  const category = useSettingsCategory("finance");

  return {
    data: {
      fiscalYear: category.data.fiscalYear || DEFAULT_FINANCE_SETTINGS.fiscalYear,
      defaultCurrency: category.data.defaultCurrency || DEFAULT_FINANCE_SETTINGS.defaultCurrency,
      basAccountPlan: category.data.basAccountPlan || DEFAULT_FINANCE_SETTINGS.basAccountPlan,
      defaultPaymentAccount: category.data.defaultPaymentAccount || DEFAULT_FINANCE_SETTINGS.defaultPaymentAccount,
      reserveAccount: category.data.reserveAccount || DEFAULT_FINANCE_SETTINGS.reserveAccount,
      defaultVatRate: category.data.defaultVatRate ?? DEFAULT_FINANCE_SETTINGS.defaultVatRate,
      invoiceNumberPrefix: category.data.invoiceNumberPrefix ?? DEFAULT_FINANCE_SETTINGS.invoiceNumberPrefix,
      paymentTermsDays: category.data.paymentTermsDays ?? DEFAULT_FINANCE_SETTINGS.paymentTermsDays,
      invoiceFooter: category.data.invoiceFooter ?? DEFAULT_FINANCE_SETTINGS.invoiceFooter,
      companyName: category.data.companyName,
      organisationNumber: category.data.organisationNumber,
    },
    isLoading: category.isLoading,
    error: category.error,
    source: category.source,
    refresh: category.refresh,
  };
}
