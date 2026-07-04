import { useCallback } from "react";
import { settingsProfile } from "~/data/admin";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type WorkspaceFormState = {
  workspaceName: string;
  workspaceEmail: string;
  timezone: string;
  language: string;
  locale: string;
};

const INITIAL: WorkspaceFormState = {
  workspaceName: settingsProfile.studioName,
  workspaceEmail: settingsProfile.email,
  timezone: settingsProfile.timezone,
  language: "Swedish",
  locale: "sv-SE",
};

export function WorkspaceSettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, setField, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("workspace", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Workspace"
      description="Workspace preferences for the KWStudio admin experience."
    >
      <SettingsFieldStack>
        <SettingsFieldRow>
          <SettingsGroup label="Workspace name" htmlFor="workspace-name">
            <input
              id="workspace-name"
              className={settingsInputClassName()}
              value={values.workspaceName}
              onChange={(event) => setField("workspaceName", event.target.value)}
            />
          </SettingsGroup>
          <SettingsGroup label="Workspace email" htmlFor="workspace-email">
            <input
              id="workspace-email"
              type="email"
              className={settingsInputClassName()}
              value={values.workspaceEmail}
              onChange={(event) => setField("workspaceEmail", event.target.value)}
            />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="Timezone" htmlFor="workspace-timezone">
            <input
              id="workspace-timezone"
              className={settingsInputClassName()}
              value={values.timezone}
              onChange={(event) => setField("timezone", event.target.value)}
            />
          </SettingsGroup>
          <SettingsGroup label="Language" htmlFor="workspace-language">
            <input
              id="workspace-language"
              className={settingsInputClassName()}
              value={values.language}
              onChange={(event) => setField("language", event.target.value)}
            />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsGroup label="Locale" htmlFor="workspace-locale">
          <input
            id="workspace-locale"
            className={settingsInputClassName()}
            value={values.locale}
            onChange={(event) => setField("locale", event.target.value)}
          />
        </SettingsGroup>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
