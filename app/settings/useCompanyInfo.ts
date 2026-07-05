import { useMemo } from "react";
import { DEFAULT_BUSINESS_SETTINGS, DEFAULT_WORKSPACE_SETTINGS } from "./settingsDefaults";
import { useSettingsCategory } from "./useSettingsCategory";

export type CompanyInfo = {
  companyName: string;
  organizationNumber: string;
  vatNumber: string;
  address: string;
  contactEmail: string;
  phone: string;
  website: string;
  description: string;
  workspaceName: string;
  workspaceEmail: string;
  timezone: string;
  language: string;
  locale: string;
};

export type UseCompanyInfoResult = {
  data: CompanyInfo;
  isLoading: boolean;
  error: string | null;
};

export function useCompanyInfo(): UseCompanyInfoResult {
  const business = useSettingsCategory("business");
  const workspace = useSettingsCategory("workspace");

  const data = useMemo<CompanyInfo>(() => ({
    companyName: business.data.companyName || DEFAULT_BUSINESS_SETTINGS.companyName,
    organizationNumber: business.data.organizationNumber,
    vatNumber: business.data.vatNumber,
    address: business.data.address || DEFAULT_BUSINESS_SETTINGS.address,
    contactEmail: business.data.contactEmail || DEFAULT_BUSINESS_SETTINGS.contactEmail,
    phone: business.data.phone,
    website: business.data.website || DEFAULT_BUSINESS_SETTINGS.website,
    description: business.data.description,
    workspaceName: workspace.data.workspaceName || DEFAULT_WORKSPACE_SETTINGS.workspaceName,
    workspaceEmail: workspace.data.workspaceEmail || business.data.contactEmail || DEFAULT_WORKSPACE_SETTINGS.workspaceEmail,
    timezone: workspace.data.timezone || DEFAULT_WORKSPACE_SETTINGS.timezone,
    language: workspace.data.language || DEFAULT_WORKSPACE_SETTINGS.language,
    locale: workspace.data.locale || DEFAULT_WORKSPACE_SETTINGS.locale,
  }), [business.data, workspace.data]);

  return {
    data,
    isLoading: business.isLoading || workspace.isLoading,
    error: business.error ?? workspace.error,
  };
}
