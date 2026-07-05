import { useAppSettings } from "./AppSettingsProvider";

export function useSettings() {
  const context = useAppSettings();

  return {
    publicSettings: context.publicSettings,
    getCategoryState: context.getCategoryState,
    ensureCategoryLoaded: context.ensureCategoryLoaded,
    refreshCategory: context.refreshCategory,
    invalidateCategory: context.invalidateCategory,
    invalidateSettings: context.invalidateCategory,
    refreshPublicSettings: context.refreshPublicSettings,
    isApiConfigured: context.isApiConfigured,
  };
}
