import { useCallback } from "react";
import { settingsProfile } from "~/data/admin";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type BrandingFormState = {
  brandColor: string;
  typography: string;
};

const INITIAL: BrandingFormState = {
  brandColor: settingsProfile.brandColor,
  typography: "Inter",
};

export function BrandingSettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, setField, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("branding", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Branding"
      description="Visual identity settings for KWStudio admin and client-facing surfaces."
    >
      <SettingsFieldStack>
        <SettingsFieldRow>
          <SettingsGroup label="Logo" htmlFor="branding-logo">
            <input
              id="branding-logo"
              className={settingsInputClassName(true)}
              placeholder="Upload logo (coming soon)"
              disabled
            />
          </SettingsGroup>
          <SettingsGroup label="Favicon" htmlFor="branding-favicon">
            <input
              id="branding-favicon"
              className={settingsInputClassName(true)}
              placeholder="Upload favicon (coming soon)"
              disabled
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
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>Logo and favicon uploads will be available in a future release.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
