import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  brandingToFormState,
  brandingToPatch,
  EMPTY_BRANDING_FORM,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function BrandingSettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "branding",
    emptyForm: EMPTY_BRANDING_FORM,
    toFormState: brandingToFormState,
    toPatch: brandingToPatch,
    invalidateCategories: ["appearance"],
    refreshPublic: true,
  });

  return (
    <SettingsSection
      title="Branding"
      description="Visual identity settings for KWStudio admin and client-facing surfaces."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading branding settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="Logo URL" htmlFor="branding-logo">
              <input
                id="branding-logo"
                className={settingsInputClassName()}
                placeholder="https://example.com/logo.png"
                value={values.logoUrl}
                onChange={(event) => setField("logoUrl", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Favicon URL" htmlFor="branding-favicon">
              <input
                id="branding-favicon"
                className={settingsInputClassName()}
                placeholder="https://example.com/favicon.ico"
                value={values.faviconUrl}
                onChange={(event) => setField("faviconUrl", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Brand color" htmlFor="branding-color">
              <input
                id="branding-color"
                className={settingsInputClassName()}
                value={values.brandColor}
                onChange={(event) => setField("brandColor", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Typography" htmlFor="branding-typography">
              <input
                id="branding-typography"
                className={settingsInputClassName()}
                value={values.typography}
                onChange={(event) => setField("typography", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
