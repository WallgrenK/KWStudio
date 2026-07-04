import { useCallback } from "react";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type WebsiteFormState = {
  seoTitle: string;
  seoDescription: string;
  socialLinks: string;
  maintenanceMode: boolean;
  contactEmail: string;
  contactPhone: string;
  analyticsId: string;
};

const INITIAL: WebsiteFormState = {
  seoTitle: "",
  seoDescription: "",
  socialLinks: "",
  maintenanceMode: false,
  contactEmail: "",
  contactPhone: "",
  analyticsId: "",
};

export function WebsiteSettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, setField, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("website", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Website"
      description="Public website configuration for SEO, social presence, and contact details."
    >
      <SettingsFieldStack>
        <SettingsFieldRow>
          <SettingsGroup label="SEO title" htmlFor="website-seo-title">
            <input
              id="website-seo-title"
              className={settingsInputClassName(true)}
              value={values.seoTitle}
              placeholder="Default page title"
              disabled
            />
          </SettingsGroup>
          <SettingsGroup label="SEO description" htmlFor="website-seo-description">
            <input
              id="website-seo-description"
              className={settingsInputClassName(true)}
              value={values.seoDescription}
              placeholder="Meta description"
              disabled
            />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsGroup label="Social links" htmlFor="website-social-links">
          <textarea
            id="website-social-links"
            className={`${settingsInputClassName(true)} min-h-20 py-3`}
            value={values.socialLinks}
            placeholder="LinkedIn, Instagram, GitHub…"
            disabled
          />
        </SettingsGroup>
        <SettingsFieldRow>
          <SettingsGroup label="Contact email" htmlFor="website-contact-email">
            <input
              id="website-contact-email"
              className={settingsInputClassName(true)}
              value={values.contactEmail}
              disabled
            />
          </SettingsGroup>
          <SettingsGroup label="Contact phone" htmlFor="website-contact-phone">
            <input
              id="website-contact-phone"
              className={settingsInputClassName(true)}
              value={values.contactPhone}
              disabled
            />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="Analytics ID" htmlFor="website-analytics-id">
            <input
              id="website-analytics-id"
              className={settingsInputClassName(true)}
              value={values.analyticsId}
              placeholder="GA4 / Plausible ID"
              disabled
            />
          </SettingsGroup>
          <label className="flex items-center gap-2 self-end rounded-lg border border-gray-100 p-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={values.maintenanceMode}
              disabled
              onChange={(event) => setField("maintenanceMode", event.target.checked)}
            />
            Maintenance mode
          </label>
        </SettingsFieldRow>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>Website settings will connect to the public site when backend support is added.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
