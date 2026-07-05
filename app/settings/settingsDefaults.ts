import type {
  AISettingsDto,
  AllSettingsDto,
  AppearanceSettingsDto,
  BrandingSettingsDto,
  BusinessSettingsDto,
  DeveloperSettingsDto,
  EmailSettingsDto,
  FinanceSettingsDto,
  PublicSettingsDto,
  SecuritySettingsDto,
  SettingsCategoryId,
  SettingsDtoMap,
  WebsiteSettingsDto,
  WorkspaceSettingsDto,
} from "./settingsTypes";

const DEFAULT_UPDATED_AT: string | null = null;

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettingsDto = {
  workspaceName: "KWStudio",
  workspaceEmail: "hello@kwstudio.se",
  timezone: "Europe/Stockholm",
  language: "Swedish",
  locale: "sv-SE",
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettingsDto = {
  companyName: "KWStudio AB",
  organizationNumber: "",
  vatNumber: "",
  address: "Stockholm, Sweden",
  contactEmail: "hello@kwstudio.se",
  phone: "",
  website: "kwstudio.se",
  description: "Web design and development",
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_BRANDING_SETTINGS: BrandingSettingsDto = {
  brandColor: "#2E75BD",
  typography: "Inter",
  logoUrl: null,
  faviconUrl: null,
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettingsDto = {
  seoTitle: "",
  seoDescription: "",
  socialLinks: "",
  maintenanceMode: false,
  contactEmail: "",
  contactPhone: "",
  analyticsId: "",
  publicBaseUrl: null,
  portalTitle: "KWStudio Client Portal",
  uploadLimitMb: 50,
  fileRetentionDays: 365,
  allowedPortalFeatures: [],
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_FINANCE_SETTINGS: FinanceSettingsDto = {
  fiscalYear: "Calendar year (Jan–Dec)",
  defaultCurrency: "SEK",
  basAccountPlan: "BAS 2024",
  defaultPaymentAccount: "1930",
  reserveAccount: "2018",
  defaultVatRate: 25,
  invoiceNumberPrefix: "",
  paymentTermsDays: 30,
  invoiceFooter: "",
  companyName: DEFAULT_BUSINESS_SETTINGS.companyName,
  organisationNumber: null,
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_AI_SETTINGS: AISettingsDto = {
  defaultModel: "gpt-4.1",
  systemPrompt: "",
  toolAccess: "Enabled for admin tools",
  provider: "openai",
  temperature: 0.7,
  maxTokens: 4096,
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_EMAIL_SETTINGS: EmailSettingsDto = {
  fromName: "KWStudio",
  fromAddress: "hello@kwstudio.se",
  replyTo: "hello@kwstudio.se",
  signature: "",
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettingsDto = {
  theme: "System",
  density: "Comfortable",
  accentColor: DEFAULT_BRANDING_SETTINGS.brandColor,
  sidebarBehavior: "Expanded on desktop",
  animations: true,
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettingsDto = {
  sessionTimeoutMinutes: 480,
  allowedOrigins: [],
  inviteTtlDays: 7,
  passwordMinLength: 8,
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_DEVELOPER_SETTINGS: DeveloperSettingsDto = {
  featureFlags: {},
  crm: {
    defaultLeadOwner: null,
    defaultPipelineStage: null,
  },
  projects: {
    defaultProjectStatus: null,
    deliveryStages: [],
  },
  documents: {
    defaultSignatureExpiryDays: 30,
    defaultTemplateId: null,
  },
  updated_at: DEFAULT_UPDATED_AT,
};

export const DEFAULT_PUBLIC_SETTINGS: PublicSettingsDto = {
  business: {
    companyName: DEFAULT_BUSINESS_SETTINGS.companyName,
    contactEmail: DEFAULT_BUSINESS_SETTINGS.contactEmail,
    phone: DEFAULT_BUSINESS_SETTINGS.phone,
    website: DEFAULT_BUSINESS_SETTINGS.website,
    address: DEFAULT_BUSINESS_SETTINGS.address,
    description: DEFAULT_BUSINESS_SETTINGS.description,
  },
  branding: {
    brandColor: DEFAULT_BRANDING_SETTINGS.brandColor,
    typography: DEFAULT_BRANDING_SETTINGS.typography,
    logoUrl: DEFAULT_BRANDING_SETTINGS.logoUrl,
    faviconUrl: DEFAULT_BRANDING_SETTINGS.faviconUrl,
  },
  website: {
    seoTitle: DEFAULT_WEBSITE_SETTINGS.seoTitle,
    seoDescription: DEFAULT_WEBSITE_SETTINGS.seoDescription,
    maintenanceMode: DEFAULT_WEBSITE_SETTINGS.maintenanceMode,
    contactEmail: DEFAULT_WEBSITE_SETTINGS.contactEmail || DEFAULT_BUSINESS_SETTINGS.contactEmail,
    contactPhone: DEFAULT_WEBSITE_SETTINGS.contactPhone || DEFAULT_BUSINESS_SETTINGS.phone,
    publicBaseUrl: DEFAULT_WEBSITE_SETTINGS.publicBaseUrl,
    portalTitle: DEFAULT_WEBSITE_SETTINGS.portalTitle,
    uploadLimitMb: DEFAULT_WEBSITE_SETTINGS.uploadLimitMb,
    fileRetentionDays: DEFAULT_WEBSITE_SETTINGS.fileRetentionDays,
    allowedPortalFeatures: DEFAULT_WEBSITE_SETTINGS.allowedPortalFeatures,
  },
};

export const DEFAULT_ALL_SETTINGS: AllSettingsDto = {
  workspace: DEFAULT_WORKSPACE_SETTINGS,
  business: DEFAULT_BUSINESS_SETTINGS,
  branding: DEFAULT_BRANDING_SETTINGS,
  website: DEFAULT_WEBSITE_SETTINGS,
  finance: DEFAULT_FINANCE_SETTINGS,
  ai: DEFAULT_AI_SETTINGS,
  email: DEFAULT_EMAIL_SETTINGS,
  appearance: DEFAULT_APPEARANCE_SETTINGS,
  security: DEFAULT_SECURITY_SETTINGS,
  developer: DEFAULT_DEVELOPER_SETTINGS,
};

export function getDefaultCategorySettings<K extends SettingsCategoryId>(category: K): SettingsDtoMap[K] {
  return DEFAULT_ALL_SETTINGS[category];
}

export const DEFAULT_BRAND_COLOR = DEFAULT_BRANDING_SETTINGS.brandColor;
