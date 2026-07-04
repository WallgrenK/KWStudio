import { useCallback } from "react";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type DeveloperFormState = {
  version: string;
  environment: string;
  database: string;
  migrations: string;
  diagnostics: string;
  logs: string;
  featureFlags: string;
  exportDiagnostics: string;
};

const INITIAL: DeveloperFormState = {
  version: "KWStudio admin (local demo)",
  environment: "Development",
  database: "Supabase PostgreSQL",
  migrations: "Managed via supabase/migrations",
  diagnostics: "Not available",
  logs: "Not available",
  featureFlags: "Not available",
  exportDiagnostics: "Not available",
};

export function DeveloperSettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("developer", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Developer"
      description="Environment, database, diagnostics, and feature flag visibility."
    >
      <SettingsFieldStack>
        <SettingsFieldRow>
          <SettingsGroup label="Version" htmlFor="developer-version">
            <input id="developer-version" className={settingsInputClassName(true)} value={values.version} disabled />
          </SettingsGroup>
          <SettingsGroup label="Environment" htmlFor="developer-environment">
            <input id="developer-environment" className={settingsInputClassName(true)} value={values.environment} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="Database" htmlFor="developer-database">
            <input id="developer-database" className={settingsInputClassName(true)} value={values.database} disabled />
          </SettingsGroup>
          <SettingsGroup label="Migrations" htmlFor="developer-migrations">
            <input id="developer-migrations" className={settingsInputClassName(true)} value={values.migrations} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="Diagnostics" htmlFor="developer-diagnostics">
            <input id="developer-diagnostics" className={settingsInputClassName(true)} value={values.diagnostics} disabled />
          </SettingsGroup>
          <SettingsGroup label="Logs" htmlFor="developer-logs">
            <input id="developer-logs" className={settingsInputClassName(true)} value={values.logs} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="Feature flags" htmlFor="developer-feature-flags">
            <input id="developer-feature-flags" className={settingsInputClassName(true)} value={values.featureFlags} disabled />
          </SettingsGroup>
          <SettingsGroup label="Export diagnostics" htmlFor="developer-export-diagnostics">
            <input id="developer-export-diagnostics" className={settingsInputClassName(true)} value={values.exportDiagnostics} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>Developer tooling is read-only until diagnostic endpoints are implemented.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
