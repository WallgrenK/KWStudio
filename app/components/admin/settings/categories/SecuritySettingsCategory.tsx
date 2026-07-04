import { useCallback } from "react";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type SecurityFormState = {
  authentication: string;
  sessions: string;
  roles: string;
  auditLogs: string;
  apiKeys: string;
};

const INITIAL: SecurityFormState = {
  authentication: "Supabase Auth (session active in admin)",
  sessions: "Not configured",
  roles: "Not configured",
  auditLogs: "Not configured",
  apiKeys: "Not configured",
};

export function SecuritySettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("security", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Security"
      description="Authentication, access control, and audit visibility."
    >
      <SettingsFieldStack>
        <SettingsGroup label="Authentication" htmlFor="security-authentication">
          <input id="security-authentication" className={settingsInputClassName(true)} value={values.authentication} disabled />
        </SettingsGroup>
        <SettingsGroup label="Sessions" htmlFor="security-sessions">
          <input id="security-sessions" className={settingsInputClassName(true)} value={values.sessions} disabled />
        </SettingsGroup>
        <SettingsGroup label="Roles" htmlFor="security-roles">
          <input id="security-roles" className={settingsInputClassName(true)} value={values.roles} disabled />
        </SettingsGroup>
        <SettingsGroup label="Audit logs" htmlFor="security-audit-logs">
          <input id="security-audit-logs" className={settingsInputClassName(true)} value={values.auditLogs} disabled />
        </SettingsGroup>
        <SettingsGroup label="API keys" htmlFor="security-api-keys">
          <input id="security-api-keys" className={settingsInputClassName(true)} value={values.apiKeys} disabled />
        </SettingsGroup>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>Sessions, roles, audit logs, and API keys will be configurable when backend support is added.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
