import type { PortalQuickAccessItem } from "~/data/portalDashboard";
import type { PublicSettingsDto } from "./settingsTypes";
import { DEFAULT_BUSINESS_SETTINGS, DEFAULT_WEBSITE_SETTINGS } from "./settingsDefaults";

const PORTAL_FEATURE_ALIASES: Record<string, string[]> = {
  documents: ["documents"],
  assets: ["files", "assets"],
  conversations: ["messages", "conversations"],
  invoices: ["invoices"],
  support: ["support"],
};

export function filterPortalQuickAccess(
  items: PortalQuickAccessItem[],
  allowedPortalFeatures: string[],
): PortalQuickAccessItem[] {
  if (allowedPortalFeatures.length === 0) return items;

  const normalizedAllowed = new Set(
    allowedPortalFeatures.map((feature) => feature.trim().toLowerCase()).filter(Boolean),
  );

  return items.filter((item) => {
    for (const [settingKey, portalIds] of Object.entries(PORTAL_FEATURE_ALIASES)) {
      if (normalizedAllowed.has(settingKey) && portalIds.includes(item.id.toLowerCase())) {
        return true;
      }
    }
    return normalizedAllowed.has(item.id.toLowerCase());
  });
}

export function buildFallbackPortalContact(
  publicSettings: Pick<PublicSettingsDto, "business">,
): { name: string; role: string; email: string; responseTime: string } {
  return {
    name: publicSettings.business.companyName,
    role: "Project team",
    email: publicSettings.business.contactEmail,
    responseTime: "Within 1 business day",
  };
}

export function resolveLeadOwnerLabel(
  assignedTo: string | null | undefined,
  defaultOwner: string | null | undefined,
): string {
  if (assignedTo?.trim()) return assignedTo.trim();
  if (defaultOwner?.trim()) return defaultOwner.trim();
  return "Unassigned";
}

export function resolveConfiguredLeadStage(
  configuredStage: string | null | undefined,
  leadStageOrder: readonly string[],
  mapLeadStage: (status: string) => string,
): "All" | (typeof leadStageOrder)[number] {
  if (!configuredStage?.trim()) return "All";
  const mapped = mapLeadStage(configuredStage.trim().toLowerCase());
  return (leadStageOrder as readonly string[]).includes(mapped) ? mapped : "All";
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultSignatureExpiryInput(defaultSignatureExpiryDays: number): string {
  const days = defaultSignatureExpiryDays > 0 ? defaultSignatureExpiryDays : 30;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDatetimeLocalValue(date);
}

export function getPortalBrandInitials(companyName: string): string {
  const parts = companyName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KW";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function getPortalWorkspaceLabel(publicSettings: PublicSettingsDto): string {
  return publicSettings.website.portalTitle || `${publicSettings.business.companyName} Client Portal`;
}

export const DEFAULT_PORTAL_COMPANY_NAME = DEFAULT_BUSINESS_SETTINGS.companyName;
export const DEFAULT_PORTAL_UPLOAD_LIMIT_MB = DEFAULT_WEBSITE_SETTINGS.uploadLimitMb;
