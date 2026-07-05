import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  appearanceToFormState,
  appearanceToPatch,
  EMPTY_APPEARANCE_FORM,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function AppearanceSettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "appearance",
    emptyForm: EMPTY_APPEARANCE_FORM,
    toFormState: appearanceToFormState,
    toPatch: appearanceToPatch,
  });

  return (
    <SettingsSection
      title="Appearance"
      description="Visual preferences for the KWStudio admin interface."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading appearance settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="Theme" htmlFor="appearance-theme">
              <input
                id="appearance-theme"
                className={settingsInputClassName()}
                value={values.theme}
                onChange={(event) => setField("theme", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Density" htmlFor="appearance-density">
              <input
                id="appearance-density"
                className={settingsInputClassName()}
                value={values.density}
                onChange={(event) => setField("density", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Accent color (from branding)" htmlFor="appearance-accent-color">
              <input
                id="appearance-accent-color"
                className={settingsInputClassName(true)}
                value={values.accentColor}
                disabled
              />
            </SettingsGroup>
            <SettingsGroup label="Sidebar behavior" htmlFor="appearance-sidebar-behavior">
              <input
                id="appearance-sidebar-behavior"
                className={settingsInputClassName()}
                value={values.sidebarBehavior}
                onChange={(event) => setField("sidebarBehavior", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={values.animations}
              onChange={(event) => setField("animations", event.target.checked)}
            />
            Animations
          </label>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
