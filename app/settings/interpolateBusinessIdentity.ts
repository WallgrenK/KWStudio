import { DEFAULT_PUBLIC_SETTINGS } from "./settingsDefaults";

export type BusinessIdentity = {
  companyName: string;
  contactEmail: string;
};

const DEFAULT_IDENTITY: BusinessIdentity = {
  companyName: DEFAULT_PUBLIC_SETTINGS.business.companyName,
  contactEmail: DEFAULT_PUBLIC_SETTINGS.business.contactEmail,
};

/** Replaces static KWStudio / hello@kwstudio.se placeholders in i18n copy at render time. */
export function interpolateBusinessIdentity(
  template: string,
  identity: Partial<BusinessIdentity> = {},
): string {
  const companyName = identity.companyName?.trim() || DEFAULT_IDENTITY.companyName;
  const contactEmail = identity.contactEmail?.trim() || DEFAULT_IDENTITY.contactEmail;

  return template
    .replaceAll("hello@kwstudio.se", contactEmail)
    .replaceAll("KWStudio", companyName);
}
