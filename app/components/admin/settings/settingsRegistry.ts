import {
  BriefcaseBusiness,
  Building2,
  Code2,
  Globe2,
  Mail,
  MonitorSmartphone,
  Palette,
  Plug,
  ReceiptText,
  Settings2,
  Shield,
  Sparkles,
} from "lucide-react";
import type { SettingsCategoryDefinition } from "./settingsTypes";
import { AISettingsCategory } from "./categories/AISettingsCategory";
import { AppearanceSettingsCategory } from "./categories/AppearanceSettingsCategory";
import { BrandingSettingsCategory } from "./categories/BrandingSettingsCategory";
import { BusinessSettingsCategory } from "./categories/BusinessSettingsCategory";
import { DeveloperSettingsCategory } from "./categories/DeveloperSettingsCategory";
import { EmailSettingsCategory } from "./categories/EmailSettingsCategory";
import { FinanceSettingsCategory } from "./categories/FinanceSettingsCategory";
import { IntegrationsSettingsCategory } from "./categories/IntegrationsSettingsCategory";
import { SecuritySettingsCategory } from "./categories/SecuritySettingsCategory";
import { TaxSettingsCategory } from "./categories/TaxSettingsCategory";
import { WebsiteSettingsCategory } from "./categories/WebsiteSettingsCategory";
import { WorkspaceSettingsCategory } from "./categories/WorkspaceSettingsCategory";

export const SETTINGS_CATEGORIES: SettingsCategoryDefinition[] = [
  {
    id: "workspace",
    title: "Workspace",
    description: "Workspace name, email, timezone, language, and locale.",
    icon: Settings2,
    defaultStatus: "configured",
    searchEntries: [
      { categoryId: "workspace", label: "Workspace name", keywords: ["studio", "workspace", "name"] },
      { categoryId: "workspace", label: "Workspace email", keywords: ["email", "contact"] },
      { categoryId: "workspace", label: "Timezone", keywords: ["timezone", "time", "stockholm"] },
      { categoryId: "workspace", label: "Language", keywords: ["language", "swedish", "english"] },
      { categoryId: "workspace", label: "Locale", keywords: ["locale", "sv-se", "region"] },
    ],
    Component: WorkspaceSettingsCategory,
  },
  {
    id: "business",
    title: "Business",
    description: "Company name, organization details, and contact information.",
    icon: Building2,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "business", label: "Company name", keywords: ["company", "business", "kwstudio"] },
      { categoryId: "business", label: "Organization number", keywords: ["org", "organization", "orgnr"] },
      { categoryId: "business", label: "VAT number", keywords: ["vat", "moms", "f-tax"] },
      { categoryId: "business", label: "Address", keywords: ["address", "location", "stockholm"] },
      { categoryId: "business", label: "Contact email", keywords: ["email", "contact"] },
      { categoryId: "business", label: "Description", keywords: ["description", "about"] },
    ],
    Component: BusinessSettingsCategory,
  },
  {
    id: "branding",
    title: "Branding",
    description: "Logo, brand color, typography, and favicon.",
    icon: Palette,
    defaultStatus: "configured",
    searchEntries: [
      { categoryId: "branding", label: "Logo", keywords: ["logo", "brand", "image"] },
      { categoryId: "branding", label: "Brand color", keywords: ["color", "brand", "primary"] },
      { categoryId: "branding", label: "Typography", keywords: ["font", "typography", "inter"] },
      { categoryId: "branding", label: "Favicon", keywords: ["favicon", "icon"] },
    ],
    Component: BrandingSettingsCategory,
  },
  {
    id: "website",
    title: "Website",
    description: "SEO, social links, maintenance mode, contact, and analytics.",
    icon: Globe2,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "website", label: "SEO title", keywords: ["seo", "title", "meta"] },
      { categoryId: "website", label: "SEO description", keywords: ["seo", "description", "meta"] },
      { categoryId: "website", label: "Social links", keywords: ["social", "linkedin", "instagram"] },
      { categoryId: "website", label: "Maintenance mode", keywords: ["maintenance", "offline"] },
      { categoryId: "website", label: "Contact email", keywords: ["contact", "email"] },
      { categoryId: "website", label: "Analytics ID", keywords: ["analytics", "ga4", "tracking"] },
    ],
    Component: WebsiteSettingsCategory,
  },
  {
    id: "finance",
    title: "Finance",
    description: "Fiscal year, currency, BAS plan, accounts, and default VAT rate.",
    icon: ReceiptText,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "finance", label: "Fiscal year", keywords: ["fiscal", "year", "period"] },
      { categoryId: "finance", label: "Default currency", keywords: ["currency", "sek", "money"] },
      { categoryId: "finance", label: "BAS account plan", keywords: ["bas", "chart", "accounts", "kontoplan"] },
      { categoryId: "finance", label: "Default payment account", keywords: ["payment", "bank", "1930"] },
      { categoryId: "finance", label: "Reserve account", keywords: ["reserve", "account", "2018"] },
      { categoryId: "finance", label: "Default VAT rate", keywords: ["vat", "moms", "rate", "25"] },
    ],
    Component: FinanceSettingsCategory,
  },
  {
    id: "tax",
    title: "Tax",
    description: "Swedish tax rates, accounts, and forecast defaults.",
    icon: BriefcaseBusiness,
    defaultStatus: "configured",
    searchEntries: [
      { categoryId: "tax", label: "Municipality code", keywords: ["municipality", "kommun", "tax"] },
      { categoryId: "tax", label: "Municipal tax rate", keywords: ["municipal", "tax", "rate"] },
      { categoryId: "tax", label: "Church tax", keywords: ["church", "tax", "kyrko"] },
      { categoryId: "tax", label: "Egenavgifter rate", keywords: ["egenavgifter", "social", "fee"] },
      { categoryId: "tax", label: "State income tax", keywords: ["state", "income", "tax", "statlig"] },
      { categoryId: "tax", label: "Tax reserve account", keywords: ["tax", "reserve", "vat", "account"] },
      { categoryId: "tax", label: "Operating bank account", keywords: ["operating", "bank", "account"] },
      { categoryId: "tax", label: "Default forecast mode", keywords: ["forecast", "projection", "ytd"] },
      { categoryId: "tax", label: "VAT settings", keywords: ["vat", "moms", "tax"] },
    ],
    Component: TaxSettingsCategory,
  },
  {
    id: "ai",
    title: "AI",
    description: "AI assistant defaults and tool access.",
    icon: Sparkles,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "ai", label: "Default model", keywords: ["ai", "model", "gpt", "openai"] },
      { categoryId: "ai", label: "System prompt", keywords: ["prompt", "assistant", "ai"] },
      { categoryId: "ai", label: "Tool access", keywords: ["tools", "ai", "access"] },
    ],
    Component: AISettingsCategory,
  },
  {
    id: "email",
    title: "Email",
    description: "Outbound email identity and signature defaults.",
    icon: Mail,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "email", label: "From name", keywords: ["email", "sender", "from"] },
      { categoryId: "email", label: "From address", keywords: ["email", "address", "smtp"] },
      { categoryId: "email", label: "Reply-to address", keywords: ["reply", "email"] },
      { categoryId: "email", label: "Signature", keywords: ["signature", "email"] },
    ],
    Component: EmailSettingsCategory,
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connected services and third-party integrations.",
    icon: Plug,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "integrations", label: "OpenAI", keywords: ["openai", "ai", "gpt"] },
      { categoryId: "integrations", label: "SCB", keywords: ["scb", "statistics", "sweden"] },
      { categoryId: "integrations", label: "Supabase", keywords: ["supabase", "database", "auth"] },
      { categoryId: "integrations", label: "GitHub", keywords: ["github", "git", "repo"] },
      { categoryId: "integrations", label: "PurelyMail", keywords: ["purelymail", "email", "mail"] },
      { categoryId: "integrations", label: "Google", keywords: ["google", "analytics", "workspace"] },
      { categoryId: "integrations", label: "Future integrations", keywords: ["integrations", "connect", "api"] },
    ],
    Component: IntegrationsSettingsCategory,
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Theme, density, accent color, sidebar, and animations.",
    icon: MonitorSmartphone,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "appearance", label: "Theme", keywords: ["theme", "dark", "light"] },
      { categoryId: "appearance", label: "Density", keywords: ["density", "compact", "spacing"] },
      { categoryId: "appearance", label: "Accent color", keywords: ["accent", "color", "brand"] },
      { categoryId: "appearance", label: "Sidebar behavior", keywords: ["sidebar", "navigation", "collapse"] },
      { categoryId: "appearance", label: "Animations", keywords: ["animation", "motion", "transitions"] },
    ],
    Component: AppearanceSettingsCategory,
  },
  {
    id: "security",
    title: "Security",
    description: "Authentication, sessions, roles, audit logs, and API keys.",
    icon: Shield,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "security", label: "Authentication", keywords: ["auth", "login", "supabase"] },
      { categoryId: "security", label: "Sessions", keywords: ["session", "login", "timeout"] },
      { categoryId: "security", label: "Roles", keywords: ["roles", "permissions", "access"] },
      { categoryId: "security", label: "Audit logs", keywords: ["audit", "logs", "history"] },
      { categoryId: "security", label: "API keys", keywords: ["api", "keys", "token"] },
    ],
    Component: SecuritySettingsCategory,
  },
  {
    id: "developer",
    title: "Developer",
    description: "Environment, database, migrations, diagnostics, and feature flags.",
    icon: Code2,
    defaultStatus: "coming_soon",
    searchEntries: [
      { categoryId: "developer", label: "Version", keywords: ["version", "release", "build"] },
      { categoryId: "developer", label: "Environment", keywords: ["environment", "dev", "prod"] },
      { categoryId: "developer", label: "Database", keywords: ["database", "postgres", "supabase"] },
      { categoryId: "developer", label: "Migrations", keywords: ["migrations", "schema", "sql"] },
      { categoryId: "developer", label: "Diagnostics", keywords: ["diagnostics", "health", "debug"] },
      { categoryId: "developer", label: "Logs", keywords: ["logs", "logging", "trace"] },
      { categoryId: "developer", label: "Feature flags", keywords: ["feature", "flags", "toggle"] },
      { categoryId: "developer", label: "Export diagnostics", keywords: ["export", "diagnostics", "support"] },
    ],
    Component: DeveloperSettingsCategory,
  },
];

export function getSettingsCategoryById(id: string) {
  return SETTINGS_CATEGORIES.find((category) => category.id === id);
}

export function searchSettingsCategories(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return {
      categories: SETTINGS_CATEGORIES,
      matchedLabels: new Set<string>(),
    };
  }

  const matchedLabels = new Set<string>();
  const matchedCategoryIds = new Set<string>();

  for (const category of SETTINGS_CATEGORIES) {
    if (category.title.toLowerCase().includes(normalized)) {
      matchedCategoryIds.add(category.id);
    }

    for (const entry of category.searchEntries) {
      const labelMatch = entry.label.toLowerCase().includes(normalized);
      const keywordMatch = entry.keywords.some(
        (keyword) => keyword.includes(normalized) || normalized.includes(keyword),
      );

      if (labelMatch || keywordMatch) {
        matchedCategoryIds.add(category.id);
        matchedLabels.add(entry.label);
      }
    }
  }

  return {
    categories: SETTINGS_CATEGORIES.filter((category) => matchedCategoryIds.has(category.id)),
    matchedLabels,
  };
}
