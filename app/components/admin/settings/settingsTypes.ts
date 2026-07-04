import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

export type SettingsCategoryId =
  | "workspace"
  | "business"
  | "branding"
  | "website"
  | "finance"
  | "tax"
  | "ai"
  | "email"
  | "integrations"
  | "appearance"
  | "security"
  | "developer";

export type SettingsStatus =
  | "configured"
  | "connected"
  | "missing"
  | "needs_attention"
  | "coming_soon"
  | "read_only"
  | "error";

export type SettingsSearchEntry = {
  categoryId: SettingsCategoryId;
  label: string;
  keywords: string[];
};

export type SettingsCategoryHandlers = {
  isDirty: boolean;
  save: () => Promise<void> | void;
  reset: () => void;
};

export type SettingsCategoryContextValue = {
  searchQuery: string;
  matchedLabels: Set<string>;
  registerHandlers: (categoryId: SettingsCategoryId, handlers: SettingsCategoryHandlers) => void;
  unregisterHandlers: (categoryId: SettingsCategoryId) => void;
  reportStatus: (categoryId: SettingsCategoryId, status: SettingsStatus | null) => void;
};

export type SettingsCategoryDefinition = {
  id: SettingsCategoryId;
  title: string;
  description: string;
  icon: LucideIcon;
  defaultStatus?: SettingsStatus;
  searchEntries: SettingsSearchEntry[];
  Component: ComponentType;
};

export type SettingsLocationState = {
  category?: SettingsCategoryId;
};
