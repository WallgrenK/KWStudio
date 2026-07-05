import { useMemo } from "react";
import { useSettings } from "./useSettings";
import { DEFAULT_PUBLIC_SETTINGS } from "./settingsDefaults";

export function usePublicPortalSettings() {
  const { publicSettings } = useSettings();

  return useMemo(() => ({
    data: publicSettings.data,
    companyName: publicSettings.data.business.companyName || DEFAULT_PUBLIC_SETTINGS.business.companyName,
    brandColor: publicSettings.data.branding.brandColor || DEFAULT_PUBLIC_SETTINGS.branding.brandColor,
    portalTitle: publicSettings.data.website.portalTitle || DEFAULT_PUBLIC_SETTINGS.website.portalTitle,
    uploadLimitMb: publicSettings.data.website.uploadLimitMb ?? DEFAULT_PUBLIC_SETTINGS.website.uploadLimitMb,
    fileRetentionDays: publicSettings.data.website.fileRetentionDays ?? DEFAULT_PUBLIC_SETTINGS.website.fileRetentionDays,
    allowedPortalFeatures: publicSettings.data.website.allowedPortalFeatures ?? DEFAULT_PUBLIC_SETTINGS.website.allowedPortalFeatures,
    isLoading: publicSettings.isLoading,
    error: publicSettings.error,
  }), [publicSettings]);
}
