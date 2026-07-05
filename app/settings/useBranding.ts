import { useEffect } from "react";
import { DEFAULT_BRAND_COLOR, DEFAULT_BRANDING_SETTINGS } from "./settingsDefaults";
import { useSettingsCategory } from "./useSettingsCategory";

export function useBranding() {
  const category = useSettingsCategory("branding");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const color = category.data.brandColor || DEFAULT_BRAND_COLOR;
    document.documentElement.style.setProperty("--kw-brand", color);
  }, [category.data.brandColor]);

  return {
    data: {
      brandColor: category.data.brandColor || DEFAULT_BRANDING_SETTINGS.brandColor,
      typography: category.data.typography || DEFAULT_BRANDING_SETTINGS.typography,
      logoUrl: category.data.logoUrl,
      faviconUrl: category.data.faviconUrl,
    },
    isLoading: category.isLoading,
    error: category.error,
    source: category.source,
    refresh: category.refresh,
  };
}
