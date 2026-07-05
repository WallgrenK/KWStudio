import { useEffect } from "react";
import { useAppSettings } from "./AppSettingsProvider";
import type { SettingsCategoryId, SettingsDtoMap } from "./settingsTypes";

export type UseSettingsCategoryResult<K extends SettingsCategoryId> = {
  data: SettingsDtoMap[K];
  isLoading: boolean;
  error: string | null;
  source: "default" | "api";
  refresh: () => Promise<void>;
};

export function useSettingsCategory<K extends SettingsCategoryId>(
  category: K,
): UseSettingsCategoryResult<K> {
  const { getCategoryState, ensureCategoryLoaded, refreshCategory } = useAppSettings();
  const state = getCategoryState(category);

  useEffect(() => {
    void ensureCategoryLoaded(category);
  }, [category, ensureCategoryLoaded]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    source: state.source,
    refresh: () => refreshCategory(category),
  };
}
