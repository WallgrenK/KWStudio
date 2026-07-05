import { DEFAULT_AI_SETTINGS } from "./settingsDefaults";
import { useSettingsCategory } from "./useSettingsCategory";

export function useAISettings() {
  const category = useSettingsCategory("ai");

  return {
    data: {
      defaultModel: category.data.defaultModel || DEFAULT_AI_SETTINGS.defaultModel,
      systemPrompt: category.data.systemPrompt ?? DEFAULT_AI_SETTINGS.systemPrompt,
      toolAccess: category.data.toolAccess || DEFAULT_AI_SETTINGS.toolAccess,
      provider: category.data.provider || DEFAULT_AI_SETTINGS.provider,
      temperature: category.data.temperature ?? DEFAULT_AI_SETTINGS.temperature,
      maxTokens: category.data.maxTokens ?? DEFAULT_AI_SETTINGS.maxTokens,
    },
    isLoading: category.isLoading,
    error: category.error,
    source: category.source,
    refresh: category.refresh,
  };
}
