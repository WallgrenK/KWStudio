import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  EMPTY_WEBSITE_FORM,
  websiteToFormState,
  websiteToPatch,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function WebsiteSettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "website",
    emptyForm: EMPTY_WEBSITE_FORM,
    toFormState: websiteToFormState,
    toPatch: websiteToPatch,
    refreshPublic: true,
  });

  return (
    <SettingsSection
      title="Website"
      description="Public website configuration for SEO, social presence, and contact details."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading website settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="SEO title" htmlFor="website-seo-title">
              <input
                id="website-seo-title"
                className={settingsInputClassName()}
                value={values.seoTitle}
                placeholder="Default page title"
                onChange={(event) => setField("seoTitle", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="SEO description" htmlFor="website-seo-description">
              <input
                id="website-seo-description"
                className={settingsInputClassName()}
                value={values.seoDescription}
                placeholder="Meta description"
                onChange={(event) => setField("seoDescription", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsGroup label="Social links" htmlFor="website-social-links">
            <textarea
              id="website-social-links"
              className={`${settingsInputClassName()} min-h-20 py-3`}
              value={values.socialLinks}
              placeholder="LinkedIn, Instagram, GitHub…"
              onChange={(event) => setField("socialLinks", event.target.value)}
            />
          </SettingsGroup>
          <SettingsFieldRow>
            <SettingsGroup label="Contact email" htmlFor="website-contact-email">
              <input
                id="website-contact-email"
                type="email"
                className={settingsInputClassName()}
                value={values.contactEmail}
                onChange={(event) => setField("contactEmail", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Contact phone" htmlFor="website-contact-phone">
              <input
                id="website-contact-phone"
                className={settingsInputClassName()}
                value={values.contactPhone}
                onChange={(event) => setField("contactPhone", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Public base URL" htmlFor="website-public-base-url">
              <input
                id="website-public-base-url"
                className={settingsInputClassName()}
                value={values.publicBaseUrl}
                placeholder="https://kwstudio.se"
                onChange={(event) => setField("publicBaseUrl", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Portal title" htmlFor="website-portal-title">
              <input
                id="website-portal-title"
                className={settingsInputClassName()}
                value={values.portalTitle}
                onChange={(event) => setField("portalTitle", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Upload limit (MB)" htmlFor="website-upload-limit">
              <input
                id="website-upload-limit"
                className={settingsInputClassName()}
                value={values.uploadLimitMb}
                onChange={(event) => setField("uploadLimitMb", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="File retention (days)" htmlFor="website-file-retention">
              <input
                id="website-file-retention"
                className={settingsInputClassName()}
                value={values.fileRetentionDays}
                onChange={(event) => setField("fileRetentionDays", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsGroup label="Allowed portal features" htmlFor="website-portal-features">
            <input
              id="website-portal-features"
              className={settingsInputClassName()}
              value={values.allowedPortalFeatures}
              placeholder="documents, assets, conversations"
              onChange={(event) => setField("allowedPortalFeatures", event.target.value)}
            />
          </SettingsGroup>
          <SettingsFieldRow>
            <SettingsGroup label="Analytics ID" htmlFor="website-analytics-id">
              <input
                id="website-analytics-id"
                className={settingsInputClassName()}
                value={values.analyticsId}
                placeholder="GA4 / Plausible ID"
                onChange={(event) => setField("analyticsId", event.target.value)}
              />
            </SettingsGroup>
            <label className="flex items-center gap-2 self-end rounded-lg border border-gray-100 p-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={values.maintenanceMode}
                onChange={(event) => setField("maintenanceMode", event.target.checked)}
              />
              Maintenance mode
            </label>
          </SettingsFieldRow>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
