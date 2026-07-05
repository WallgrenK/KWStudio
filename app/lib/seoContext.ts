import type { PublicSettingsDto } from "~/settings/settingsTypes";
import { DEFAULT_PUBLIC_SETTINGS } from "~/settings/settingsDefaults";

export type SeoContext = {
  siteUrl: string;
  siteName: string;
  contactEmail: string;
  defaultOgImage: string;
  logoUrl: string | null;
};

function normalizeSiteUrl(value: string | null | undefined, fallback: string): string {
  const candidate = value?.trim();
  if (!candidate) return fallback;
  try {
    const url = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    return url.origin;
  } catch {
    return fallback;
  }
}

export function buildSeoContextFromPublicSettings(
  publicSettings: PublicSettingsDto = DEFAULT_PUBLIC_SETTINGS,
): SeoContext {
  const fallbackUrl = normalizeSiteUrl(DEFAULT_PUBLIC_SETTINGS.website.publicBaseUrl, "https://kwstudio.se");
  const siteUrl = normalizeSiteUrl(publicSettings.website.publicBaseUrl, fallbackUrl);
  const siteName = publicSettings.business.companyName.trim() || DEFAULT_PUBLIC_SETTINGS.business.companyName;
  const contactEmail =
    publicSettings.website.contactEmail.trim()
    || publicSettings.business.contactEmail.trim()
    || DEFAULT_PUBLIC_SETTINGS.business.contactEmail;
  const logoUrl = publicSettings.branding.logoUrl;
  const defaultOgImage = logoUrl?.trim() || `${siteUrl}/og-image.svg`;

  return {
    siteUrl,
    siteName,
    contactEmail,
    defaultOgImage,
    logoUrl,
  };
}

export const DEFAULT_SEO_CONTEXT = buildSeoContextFromPublicSettings(DEFAULT_PUBLIC_SETTINGS);

export const SITE_URL = DEFAULT_SEO_CONTEXT.siteUrl;
export const SITE_NAME = DEFAULT_SEO_CONTEXT.siteName;
export const DEFAULT_OG_IMAGE = DEFAULT_SEO_CONTEXT.defaultOgImage;

export function interpolateCompanyName(template: string, companyName: string): string {
  return template.replaceAll("KWStudio", companyName);
}
