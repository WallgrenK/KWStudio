import { useMemo } from "react";
import { usePublicPortalSettings } from "./usePublicPortalSettings";
import { DEFAULT_PUBLIC_SETTINGS } from "./settingsDefaults";

export function usePublicWebsiteSettings() {
  const portal = usePublicPortalSettings();

  return useMemo(() => ({
    ...portal,
    contactEmail:
      portal.data.website.contactEmail.trim()
      || portal.data.business.contactEmail.trim()
      || DEFAULT_PUBLIC_SETTINGS.business.contactEmail,
    contactPhone:
      portal.data.website.contactPhone.trim()
      || portal.data.business.phone.trim()
      || DEFAULT_PUBLIC_SETTINGS.business.phone,
    address: portal.data.business.address || DEFAULT_PUBLIC_SETTINGS.business.address,
    seoTitle: portal.data.website.seoTitle || DEFAULT_PUBLIC_SETTINGS.website.seoTitle,
    seoDescription: portal.data.website.seoDescription || DEFAULT_PUBLIC_SETTINGS.website.seoDescription,
    maintenanceMode: portal.data.website.maintenanceMode ?? DEFAULT_PUBLIC_SETTINGS.website.maintenanceMode,
    publicBaseUrl: portal.data.website.publicBaseUrl ?? DEFAULT_PUBLIC_SETTINGS.website.publicBaseUrl,
    logoUrl: portal.data.branding.logoUrl ?? DEFAULT_PUBLIC_SETTINGS.branding.logoUrl,
    faviconUrl: portal.data.branding.faviconUrl ?? DEFAULT_PUBLIC_SETTINGS.branding.faviconUrl,
  }), [portal]);
}
