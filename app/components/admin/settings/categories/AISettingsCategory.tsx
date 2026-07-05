import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  aiToFormState,
  aiToPatch,
  EMPTY_AI_FORM,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function AISettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "ai",
    emptyForm: EMPTY_AI_FORM,
    toFormState: aiToFormState,
    toPatch: aiToPatch,
  });

  return (
    <SettingsSection
      title="AI"
      description="AI assistant defaults and tool access for KWStudio admin workflows."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading AI settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="Provider" htmlFor="ai-provider">
              <input
                id="ai-provider"
                className={settingsInputClassName()}
                value={values.provider}
                onChange={(event) => setField("provider", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Default model" htmlFor="ai-default-model">
              <input
                id="ai-default-model"
                className={settingsInputClassName()}
                value={values.defaultModel}
                onChange={(event) => setField("defaultModel", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Temperature" htmlFor="ai-temperature">
              <input
                id="ai-temperature"
                className={settingsInputClassName()}
                value={values.temperature}
                placeholder="0.7"
                onChange={(event) => setField("temperature", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Max tokens" htmlFor="ai-max-tokens">
              <input
                id="ai-max-tokens"
                className={settingsInputClassName()}
                value={values.maxTokens}
                onChange={(event) => setField("maxTokens", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsGroup label="System prompt" htmlFor="ai-system-prompt">
            <textarea
              id="ai-system-prompt"
              className={`${settingsInputClassName()} min-h-24 py-3`}
              value={values.systemPrompt}
              placeholder="Workspace-specific assistant instructions"
              onChange={(event) => setField("systemPrompt", event.target.value)}
            />
          </SettingsGroup>
          <SettingsGroup label="Tool access" htmlFor="ai-tool-access">
            <input
              id="ai-tool-access"
              className={settingsInputClassName()}
              value={values.toolAccess}
              onChange={(event) => setField("toolAccess", event.target.value)}
            />
          </SettingsGroup>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
