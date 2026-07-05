import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  EMPTY_WORKSPACE_FORM,
  workspaceToFormState,
  workspaceToPatch,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function WorkspaceSettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "workspace",
    emptyForm: EMPTY_WORKSPACE_FORM,
    toFormState: workspaceToFormState,
    toPatch: workspaceToPatch,
    refreshPublic: true,
  });

  return (
    <SettingsSection
      title="Workspace"
      description="Workspace preferences for the KWStudio admin experience."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading workspace settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
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
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
