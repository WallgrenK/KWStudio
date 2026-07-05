import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  businessToFormState,
  businessToPatch,
  EMPTY_BUSINESS_FORM,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function BusinessSettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "business",
    emptyForm: EMPTY_BUSINESS_FORM,
    toFormState: businessToFormState,
    toPatch: businessToPatch,
    invalidateCategories: ["finance"],
    refreshPublic: true,
  });

  return (
    <SettingsSection
      title="Business"
      description="Company information used across invoices, reports, and client-facing materials."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading business settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="Company name" htmlFor="business-company-name">
              <input
                id="business-company-name"
                className={settingsInputClassName()}
                value={values.companyName}
                onChange={(event) => setField("companyName", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Organization number" htmlFor="business-org-number">
              <input
                id="business-org-number"
                className={settingsInputClassName()}
                value={values.organizationNumber}
                placeholder="556000-0000"
                onChange={(event) => setField("organizationNumber", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="VAT number" htmlFor="business-vat-number">
              <input
                id="business-vat-number"
                className={settingsInputClassName()}
                value={values.vatNumber}
                placeholder="SE556000000001"
                onChange={(event) => setField("vatNumber", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Contact email" htmlFor="business-contact-email">
              <input
                id="business-contact-email"
                type="email"
                className={settingsInputClassName()}
                value={values.contactEmail}
                onChange={(event) => setField("contactEmail", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Phone" htmlFor="business-phone">
              <input
                id="business-phone"
                className={settingsInputClassName()}
                value={values.phone}
                onChange={(event) => setField("phone", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Website" htmlFor="business-website">
              <input
                id="business-website"
                className={settingsInputClassName()}
                value={values.website}
                onChange={(event) => setField("website", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsGroup label="Address" htmlFor="business-address">
            <input
              id="business-address"
              className={settingsInputClassName()}
              value={values.address}
              onChange={(event) => setField("address", event.target.value)}
            />
          </SettingsGroup>
          <SettingsGroup label="Description" htmlFor="business-description">
            <textarea
              id="business-description"
              className={`${settingsInputClassName()} min-h-24 py-3`}
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </SettingsGroup>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
