export const SITE_SETTINGS_CATEGORIES = [
  "workspace",
  "business",
  "branding",
  "website",
  "ai",
  "email",
  "appearance",
  "security",
  "developer",
] as const;

export type SiteSettingsCategoryId = (typeof SITE_SETTINGS_CATEGORIES)[number];

export const SETTINGS_CATEGORIES = [...SITE_SETTINGS_CATEGORIES, "finance"] as const;

export type SettingsCategoryId = (typeof SETTINGS_CATEGORIES)[number];

export function isSettingsCategoryId(value: string): value is SettingsCategoryId {
  return (SETTINGS_CATEGORIES as readonly string[]).includes(value);
}

export type WorkspaceSettingsDto = {
  workspaceName: string;
  workspaceEmail: string;
  timezone: string;
  language: string;
  locale: string;
  updated_at: string | null;
};

export type BusinessSettingsDto = {
  companyName: string;
  organizationNumber: string;
  vatNumber: string;
  address: string;
  contactEmail: string;
  phone: string;
  website: string;
  description: string;
  updated_at: string | null;
};

export type BrandingSettingsDto = {
  brandColor: string;
  typography: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  updated_at: string | null;
};

export type WebsiteSettingsDto = {
  seoTitle: string;
  seoDescription: string;
  socialLinks: string;
  maintenanceMode: boolean;
  contactEmail: string;
  contactPhone: string;
  analyticsId: string;
  publicBaseUrl: string | null;
  portalTitle: string;
  uploadLimitMb: number;
  fileRetentionDays: number;
  allowedPortalFeatures: string[];
  updated_at: string | null;
};

export type FinanceSettingsDto = {
  fiscalYear: string;
  defaultCurrency: string;
  basAccountPlan: string;
  defaultPaymentAccount: string;
  reserveAccount: string;
  defaultVatRate: number;
  invoiceNumberPrefix: string;
  paymentTermsDays: number;
  invoiceFooter: string;
  companyName: string | null;
  organisationNumber: string | null;
  updated_at: string | null;
};

export type AISettingsDto = {
  defaultModel: string;
  systemPrompt: string;
  toolAccess: string;
  provider: string;
  temperature: number;
  maxTokens: number;
  updated_at: string | null;
};

export type EmailSettingsDto = {
  fromName: string;
  fromAddress: string;
  replyTo: string;
  signature: string;
  updated_at: string | null;
};

export type AppearanceSettingsDto = {
  theme: string;
  density: string;
  accentColor: string;
  sidebarBehavior: string;
  animations: boolean;
  updated_at: string | null;
};

export type SecuritySettingsDto = {
  sessionTimeoutMinutes: number;
  allowedOrigins: string[];
  inviteTtlDays: number;
  passwordMinLength: number;
  updated_at: string | null;
};

export type DeveloperCrmSettings = {
  defaultLeadOwner: string | null;
  defaultPipelineStage: string | null;
};

export type DeveloperProjectSettings = {
  defaultProjectStatus: string | null;
  deliveryStages: string[];
};

export type DeveloperDocumentSettings = {
  defaultSignatureExpiryDays: number;
  defaultTemplateId: string | null;
};

export type DeveloperSettingsDto = {
  featureFlags: Record<string, boolean>;
  crm: DeveloperCrmSettings;
  projects: DeveloperProjectSettings;
  documents: DeveloperDocumentSettings;
  updated_at: string | null;
};

export type SettingsDtoMap = {
  workspace: WorkspaceSettingsDto;
  business: BusinessSettingsDto;
  branding: BrandingSettingsDto;
  website: WebsiteSettingsDto;
  finance: FinanceSettingsDto;
  ai: AISettingsDto;
  email: EmailSettingsDto;
  appearance: AppearanceSettingsDto;
  security: SecuritySettingsDto;
  developer: DeveloperSettingsDto;
};

export type PublicSettingsDto = {
  business: Pick<BusinessSettingsDto, "companyName" | "contactEmail" | "phone" | "website" | "address" | "description">;
  branding: Pick<BrandingSettingsDto, "brandColor" | "typography" | "logoUrl" | "faviconUrl">;
  website: Pick<
    WebsiteSettingsDto,
    | "seoTitle"
    | "seoDescription"
    | "maintenanceMode"
    | "contactEmail"
    | "contactPhone"
    | "publicBaseUrl"
    | "portalTitle"
    | "uploadLimitMb"
    | "fileRetentionDays"
    | "allowedPortalFeatures"
  >;
};

export type AllSettingsDto = SettingsDtoMap;

export type SettingsDataSource = "default" | "api";

export type CategorySettingsState<K extends SettingsCategoryId = SettingsCategoryId> = {
  data: SettingsDtoMap[K];
  isLoading: boolean;
  error: string | null;
  source: SettingsDataSource;
};

export type PublicSettingsState = {
  data: PublicSettingsDto;
  isLoading: boolean;
  error: string | null;
  source: SettingsDataSource;
};
