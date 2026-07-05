import { useMemo } from "react";
import { useSettingsCategory } from "./useSettingsCategory";

export function useFeatureFlag(flagKey: string, defaultEnabled = true): {
  enabled: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const developer = useSettingsCategory("developer");

  const enabled = useMemo(() => {
    const flags = developer.data.featureFlags;
    if (!(flagKey in flags)) return defaultEnabled;
    return Boolean(flags[flagKey]);
  }, [developer.data.featureFlags, defaultEnabled, flagKey]);

  return {
    enabled,
    isLoading: developer.isLoading,
    error: developer.error,
  };
}
