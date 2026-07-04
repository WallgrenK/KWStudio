import { useCallback } from "react";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type AppearanceFormState = {
  theme: string;
  density: string;
  accentColor: string;
  sidebarBehavior: string;
  animations: boolean;
};

const INITIAL: AppearanceFormState = {
  theme: "System",
  density: "Comfortable",
  accentColor: "#2E75BD",
  sidebarBehavior: "Expanded on desktop",
  animations: true,
};

export function AppearanceSettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("appearance", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Appearance"
      description="Visual preferences for the KWStudio admin interface."
    >
      <SettingsFieldStack>
        <SettingsFieldRow>
          <SettingsGroup label="Theme" htmlFor="appearance-theme">
            <input id="appearance-theme" className={settingsInputClassName(true)} value={values.theme} disabled />
          </SettingsGroup>
          <SettingsGroup label="Density" htmlFor="appearance-density">
            <input id="appearance-density" className={settingsInputClassName(true)} value={values.density} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="Accent color" htmlFor="appearance-accent-color">
            <input id="appearance-accent-color" className={settingsInputClassName(true)} value={values.accentColor} disabled />
          </SettingsGroup>
          <SettingsGroup label="Sidebar behavior" htmlFor="appearance-sidebar-behavior">
            <input id="appearance-sidebar-behavior" className={settingsInputClassName(true)} value={values.sidebarBehavior} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={values.animations} disabled />
          Animations
        </label>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>Appearance controls will apply across the admin shell in a future release.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
