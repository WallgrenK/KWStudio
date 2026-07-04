import { useCallback } from "react";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type AIFormState = {
  defaultModel: string;
  systemPrompt: string;
  toolAccess: string;
};

const INITIAL: AIFormState = {
  defaultModel: "gpt-4.1",
  systemPrompt: "",
  toolAccess: "Enabled for admin tools",
};

export function AISettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("ai", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="AI"
      description="AI assistant defaults and tool access for KWStudio admin workflows."
    >
      <SettingsFieldStack>
        <SettingsGroup label="Default model" htmlFor="ai-default-model">
          <input id="ai-default-model" className={settingsInputClassName(true)} value={values.defaultModel} disabled />
        </SettingsGroup>
        <SettingsGroup label="System prompt" htmlFor="ai-system-prompt">
          <textarea
            id="ai-system-prompt"
            className={`${settingsInputClassName(true)} min-h-24 py-3`}
            value={values.systemPrompt}
            placeholder="Workspace-specific assistant instructions"
            disabled
          />
        </SettingsGroup>
        <SettingsGroup label="Tool access" htmlFor="ai-tool-access">
          <input id="ai-tool-access" className={settingsInputClassName(true)} value={values.toolAccess} disabled />
        </SettingsGroup>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>AI provider settings will be configurable when provider integrations ship.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
