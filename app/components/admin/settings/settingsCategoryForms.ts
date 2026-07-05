import type {
  AISettingsDto,
  AppearanceSettingsDto,
  BrandingSettingsDto,
  BusinessSettingsDto,
  DeveloperSettingsDto,
  EmailSettingsDto,
  FinanceSettingsDto,
  SecuritySettingsDto,
  WebsiteSettingsDto,
  WorkspaceSettingsDto,
} from "~/settings/settingsTypes";
import {
  DEFAULT_AI_SETTINGS,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_BRANDING_SETTINGS,
  DEFAULT_BUSINESS_SETTINGS,
  DEFAULT_DEVELOPER_SETTINGS,
  DEFAULT_EMAIL_SETTINGS,
  DEFAULT_FINANCE_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_WEBSITE_SETTINGS,
  DEFAULT_WORKSPACE_SETTINGS,
} from "~/settings/settingsDefaults";

export type WorkspaceFormState = {
  workspaceName: string;
  workspaceEmail: string;
  timezone: string;
  language: string;
  locale: string;
};

export type BusinessFormState = {
  companyName: string;
  organizationNumber: string;
  vatNumber: string;
  address: string;
  contactEmail: string;
  phone: string;
  website: string;
  description: string;
};

export type BrandingFormState = {
  brandColor: string;
  typography: string;
  logoUrl: string;
  faviconUrl: string;
};

export type WebsiteFormState = {
  seoTitle: string;
  seoDescription: string;
  socialLinks: string;
  maintenanceMode: boolean;
  contactEmail: string;
  contactPhone: string;
  analyticsId: string;
  publicBaseUrl: string;
  portalTitle: string;
  uploadLimitMb: string;
  fileRetentionDays: string;
  allowedPortalFeatures: string;
};

export type FinanceFormState = {
  fiscalYear: string;
  defaultCurrency: string;
  basAccountPlan: string;
  defaultPaymentAccount: string;
  reserveAccount: string;
  defaultVatRate: string;
  invoiceNumberPrefix: string;
  paymentTermsDays: string;
  invoiceFooter: string;
};

export type AIFormState = {
  defaultModel: string;
  systemPrompt: string;
  toolAccess: string;
  provider: string;
  temperature: string;
  maxTokens: string;
};

export type EmailFormState = {
  fromName: string;
  fromAddress: string;
  replyTo: string;
  signature: string;
};

export type AppearanceFormState = {
  theme: string;
  density: string;
  accentColor: string;
  sidebarBehavior: string;
  animations: boolean;
};

export type SecurityFormState = {
  sessionTimeoutMinutes: string;
  allowedOrigins: string;
  inviteTtlDays: string;
  passwordMinLength: string;
};

export type DeveloperFormState = {
  featureFlagsJson: string;
  defaultLeadOwner: string;
  defaultPipelineStage: string;
  defaultProjectStatus: string;
  deliveryStages: string;
  defaultSignatureExpiryDays: string;
  defaultTemplateId: string;
};

export const EMPTY_WORKSPACE_FORM: WorkspaceFormState = {
  workspaceName: DEFAULT_WORKSPACE_SETTINGS.workspaceName,
  workspaceEmail: DEFAULT_WORKSPACE_SETTINGS.workspaceEmail,
  timezone: DEFAULT_WORKSPACE_SETTINGS.timezone,
  language: DEFAULT_WORKSPACE_SETTINGS.language,
  locale: DEFAULT_WORKSPACE_SETTINGS.locale,
};

export const EMPTY_BUSINESS_FORM: BusinessFormState = {
  companyName: DEFAULT_BUSINESS_SETTINGS.companyName,
  organizationNumber: DEFAULT_BUSINESS_SETTINGS.organizationNumber,
  vatNumber: DEFAULT_BUSINESS_SETTINGS.vatNumber,
  address: DEFAULT_BUSINESS_SETTINGS.address,
  contactEmail: DEFAULT_BUSINESS_SETTINGS.contactEmail,
  phone: DEFAULT_BUSINESS_SETTINGS.phone,
  website: DEFAULT_BUSINESS_SETTINGS.website,
  description: DEFAULT_BUSINESS_SETTINGS.description,
};

export const EMPTY_BRANDING_FORM: BrandingFormState = {
  brandColor: DEFAULT_BRANDING_SETTINGS.brandColor,
  typography: DEFAULT_BRANDING_SETTINGS.typography,
  logoUrl: "",
  faviconUrl: "",
};

export const EMPTY_WEBSITE_FORM: WebsiteFormState = {
  seoTitle: DEFAULT_WEBSITE_SETTINGS.seoTitle,
  seoDescription: DEFAULT_WEBSITE_SETTINGS.seoDescription,
  socialLinks: DEFAULT_WEBSITE_SETTINGS.socialLinks,
  maintenanceMode: DEFAULT_WEBSITE_SETTINGS.maintenanceMode,
  contactEmail: DEFAULT_WEBSITE_SETTINGS.contactEmail,
  contactPhone: DEFAULT_WEBSITE_SETTINGS.contactPhone,
  analyticsId: DEFAULT_WEBSITE_SETTINGS.analyticsId,
  publicBaseUrl: DEFAULT_WEBSITE_SETTINGS.publicBaseUrl ?? "",
  portalTitle: DEFAULT_WEBSITE_SETTINGS.portalTitle,
  uploadLimitMb: String(DEFAULT_WEBSITE_SETTINGS.uploadLimitMb),
  fileRetentionDays: String(DEFAULT_WEBSITE_SETTINGS.fileRetentionDays),
  allowedPortalFeatures: DEFAULT_WEBSITE_SETTINGS.allowedPortalFeatures.join(", "),
};

export const EMPTY_FINANCE_FORM: FinanceFormState = {
  fiscalYear: DEFAULT_FINANCE_SETTINGS.fiscalYear,
  defaultCurrency: DEFAULT_FINANCE_SETTINGS.defaultCurrency,
  basAccountPlan: DEFAULT_FINANCE_SETTINGS.basAccountPlan,
  defaultPaymentAccount: DEFAULT_FINANCE_SETTINGS.defaultPaymentAccount,
  reserveAccount: DEFAULT_FINANCE_SETTINGS.reserveAccount,
  defaultVatRate: String(DEFAULT_FINANCE_SETTINGS.defaultVatRate),
  invoiceNumberPrefix: DEFAULT_FINANCE_SETTINGS.invoiceNumberPrefix,
  paymentTermsDays: String(DEFAULT_FINANCE_SETTINGS.paymentTermsDays),
  invoiceFooter: DEFAULT_FINANCE_SETTINGS.invoiceFooter,
};

export const EMPTY_AI_FORM: AIFormState = {
  defaultModel: DEFAULT_AI_SETTINGS.defaultModel,
  systemPrompt: DEFAULT_AI_SETTINGS.systemPrompt,
  toolAccess: DEFAULT_AI_SETTINGS.toolAccess,
  provider: DEFAULT_AI_SETTINGS.provider,
  temperature: String(DEFAULT_AI_SETTINGS.temperature),
  maxTokens: String(DEFAULT_AI_SETTINGS.maxTokens),
};

export const EMPTY_EMAIL_FORM: EmailFormState = {
  fromName: DEFAULT_EMAIL_SETTINGS.fromName,
  fromAddress: DEFAULT_EMAIL_SETTINGS.fromAddress,
  replyTo: DEFAULT_EMAIL_SETTINGS.replyTo,
  signature: DEFAULT_EMAIL_SETTINGS.signature,
};

export const EMPTY_APPEARANCE_FORM: AppearanceFormState = {
  theme: DEFAULT_APPEARANCE_SETTINGS.theme,
  density: DEFAULT_APPEARANCE_SETTINGS.density,
  accentColor: DEFAULT_BRANDING_SETTINGS.brandColor,
  sidebarBehavior: DEFAULT_APPEARANCE_SETTINGS.sidebarBehavior,
  animations: DEFAULT_APPEARANCE_SETTINGS.animations,
};

export const EMPTY_SECURITY_FORM: SecurityFormState = {
  sessionTimeoutMinutes: String(DEFAULT_SECURITY_SETTINGS.sessionTimeoutMinutes),
  allowedOrigins: "",
  inviteTtlDays: String(DEFAULT_SECURITY_SETTINGS.inviteTtlDays),
  passwordMinLength: String(DEFAULT_SECURITY_SETTINGS.passwordMinLength),
};

export const EMPTY_DEVELOPER_FORM: DeveloperFormState = {
  featureFlagsJson: "{}",
  defaultLeadOwner: "",
  defaultPipelineStage: "",
  defaultProjectStatus: "",
  deliveryStages: "",
  defaultSignatureExpiryDays: String(DEFAULT_DEVELOPER_SETTINGS.documents.defaultSignatureExpiryDays),
  defaultTemplateId: "",
};

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInteger(value: string): number | null {
  const parsed = parseOptionalNumber(value);
  if (parsed === null || !Number.isInteger(parsed)) return null;
  return parsed;
}

export function workspaceToFormState(settings: WorkspaceSettingsDto): WorkspaceFormState {
  return {
    workspaceName: settings.workspaceName,
    workspaceEmail: settings.workspaceEmail,
    timezone: settings.timezone,
    language: settings.language,
    locale: settings.locale,
  };
}

export function workspaceToPatch(values: WorkspaceFormState) {
  return {
    workspaceName: values.workspaceName.trim(),
    workspaceEmail: values.workspaceEmail.trim(),
    timezone: values.timezone.trim(),
    language: values.language.trim(),
    locale: values.locale.trim(),
  };
}

export function businessToFormState(settings: BusinessSettingsDto): BusinessFormState {
  return {
    companyName: settings.companyName,
    organizationNumber: settings.organizationNumber,
    vatNumber: settings.vatNumber,
    address: settings.address,
    contactEmail: settings.contactEmail,
    phone: settings.phone,
    website: settings.website,
    description: settings.description,
  };
}

export function businessToPatch(values: BusinessFormState) {
  return {
    companyName: values.companyName.trim(),
    organizationNumber: values.organizationNumber.trim(),
    vatNumber: values.vatNumber.trim(),
    address: values.address.trim(),
    contactEmail: values.contactEmail.trim(),
    phone: values.phone.trim(),
    website: values.website.trim(),
    description: values.description.trim(),
  };
}

export function brandingToFormState(settings: BrandingSettingsDto): BrandingFormState {
  return {
    brandColor: settings.brandColor,
    typography: settings.typography,
    logoUrl: settings.logoUrl ?? "",
    faviconUrl: settings.faviconUrl ?? "",
  };
}

export function brandingToPatch(values: BrandingFormState) {
  return {
    brandColor: values.brandColor.trim(),
    typography: values.typography.trim(),
    logoUrl: values.logoUrl.trim() || null,
    faviconUrl: values.faviconUrl.trim() || null,
  };
}

export function websiteToFormState(settings: WebsiteSettingsDto): WebsiteFormState {
  return {
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    socialLinks: settings.socialLinks,
    maintenanceMode: settings.maintenanceMode,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    analyticsId: settings.analyticsId,
    publicBaseUrl: settings.publicBaseUrl ?? "",
    portalTitle: settings.portalTitle,
    uploadLimitMb: String(settings.uploadLimitMb),
    fileRetentionDays: String(settings.fileRetentionDays),
    allowedPortalFeatures: settings.allowedPortalFeatures.join(", "),
  };
}

export function websiteToPatch(values: WebsiteFormState) {
  return {
    seoTitle: values.seoTitle.trim(),
    seoDescription: values.seoDescription.trim(),
    socialLinks: values.socialLinks.trim(),
    maintenanceMode: values.maintenanceMode,
    contactEmail: values.contactEmail.trim(),
    contactPhone: values.contactPhone.trim(),
    analyticsId: values.analyticsId.trim(),
    publicBaseUrl: values.publicBaseUrl.trim() || null,
    portalTitle: values.portalTitle.trim(),
    uploadLimitMb: parseOptionalInteger(values.uploadLimitMb) ?? undefined,
    fileRetentionDays: parseOptionalInteger(values.fileRetentionDays) ?? undefined,
    allowedPortalFeatures: parseCommaList(values.allowedPortalFeatures),
  };
}

export function financeToFormState(settings: FinanceSettingsDto): FinanceFormState {
  return {
    fiscalYear: settings.fiscalYear,
    defaultCurrency: settings.defaultCurrency,
    basAccountPlan: settings.basAccountPlan,
    defaultPaymentAccount: settings.defaultPaymentAccount,
    reserveAccount: settings.reserveAccount,
    defaultVatRate: String(settings.defaultVatRate),
    invoiceNumberPrefix: settings.invoiceNumberPrefix,
    paymentTermsDays: String(settings.paymentTermsDays),
    invoiceFooter: settings.invoiceFooter,
  };
}

export function financeToPatch(values: FinanceFormState) {
  const vatRate = parseOptionalNumber(values.defaultVatRate);
  const paymentTerms = parseOptionalInteger(values.paymentTermsDays);

  return {
    fiscalYear: values.fiscalYear.trim(),
    defaultCurrency: values.defaultCurrency.trim(),
    basAccountPlan: values.basAccountPlan.trim(),
    defaultPaymentAccount: values.defaultPaymentAccount.trim(),
    reserveAccount: values.reserveAccount.trim(),
    defaultVatRate: vatRate ?? undefined,
    invoiceNumberPrefix: values.invoiceNumberPrefix.trim(),
    paymentTermsDays: paymentTerms ?? undefined,
    invoiceFooter: values.invoiceFooter.trim(),
  };
}

export function aiToFormState(settings: AISettingsDto): AIFormState {
  return {
    defaultModel: settings.defaultModel,
    systemPrompt: settings.systemPrompt,
    toolAccess: settings.toolAccess,
    provider: settings.provider,
    temperature: String(settings.temperature),
    maxTokens: String(settings.maxTokens),
  };
}

export function aiToPatch(values: AIFormState) {
  const temperature = parseOptionalNumber(values.temperature);
  const maxTokens = parseOptionalInteger(values.maxTokens);

  return {
    defaultModel: values.defaultModel.trim(),
    systemPrompt: values.systemPrompt,
    toolAccess: values.toolAccess.trim(),
    provider: values.provider.trim(),
    temperature: temperature ?? undefined,
    maxTokens: maxTokens ?? undefined,
  };
}

export function emailToFormState(settings: EmailSettingsDto): EmailFormState {
  return {
    fromName: settings.fromName,
    fromAddress: settings.fromAddress,
    replyTo: settings.replyTo,
    signature: settings.signature,
  };
}

export function emailToPatch(values: EmailFormState) {
  return {
    fromName: values.fromName.trim(),
    fromAddress: values.fromAddress.trim(),
    replyTo: values.replyTo.trim(),
    signature: values.signature,
  };
}

export function appearanceToFormState(settings: AppearanceSettingsDto): AppearanceFormState {
  return {
    theme: settings.theme,
    density: settings.density,
    accentColor: settings.accentColor,
    sidebarBehavior: settings.sidebarBehavior,
    animations: settings.animations,
  };
}

export function appearanceToPatch(values: AppearanceFormState) {
  return {
    theme: values.theme.trim(),
    density: values.density.trim(),
    sidebarBehavior: values.sidebarBehavior.trim(),
    animations: values.animations,
  };
}

export function securityToFormState(settings: SecuritySettingsDto): SecurityFormState {
  return {
    sessionTimeoutMinutes: String(settings.sessionTimeoutMinutes),
    allowedOrigins: settings.allowedOrigins.join(", "),
    inviteTtlDays: String(settings.inviteTtlDays),
    passwordMinLength: String(settings.passwordMinLength),
  };
}

export function securityToPatch(values: SecurityFormState) {
  const sessionTimeout = parseOptionalInteger(values.sessionTimeoutMinutes);
  const inviteTtl = parseOptionalInteger(values.inviteTtlDays);
  const passwordMin = parseOptionalInteger(values.passwordMinLength);

  return {
    sessionTimeoutMinutes: sessionTimeout ?? undefined,
    allowedOrigins: parseCommaList(values.allowedOrigins),
    inviteTtlDays: inviteTtl ?? undefined,
    passwordMinLength: passwordMin ?? undefined,
  };
}

export function developerToFormState(settings: DeveloperSettingsDto): DeveloperFormState {
  return {
    featureFlagsJson: JSON.stringify(settings.featureFlags, null, 2),
    defaultLeadOwner: settings.crm.defaultLeadOwner ?? "",
    defaultPipelineStage: settings.crm.defaultPipelineStage ?? "",
    defaultProjectStatus: settings.projects.defaultProjectStatus ?? "",
    deliveryStages: settings.projects.deliveryStages.join(", "),
    defaultSignatureExpiryDays: String(settings.documents.defaultSignatureExpiryDays),
    defaultTemplateId: settings.documents.defaultTemplateId ?? "",
  };
}

export function developerToPatch(values: DeveloperFormState) {
  let featureFlags: Record<string, boolean> = {};
  try {
    const parsed = JSON.parse(values.featureFlagsJson || "{}") as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      featureFlags = Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).map(([key, flag]) => [key, Boolean(flag)]),
      );
    }
  } catch {
    featureFlags = {};
  }

  const signatureExpiry = parseOptionalInteger(values.defaultSignatureExpiryDays);

  return {
    featureFlags,
    crm: {
      defaultLeadOwner: values.defaultLeadOwner.trim() || null,
      defaultPipelineStage: values.defaultPipelineStage.trim() || null,
    },
    projects: {
      defaultProjectStatus: values.defaultProjectStatus.trim() || null,
      deliveryStages: parseCommaList(values.deliveryStages),
    },
    documents: {
      defaultSignatureExpiryDays: signatureExpiry ?? undefined,
      defaultTemplateId: values.defaultTemplateId.trim() || null,
    },
  };
}
