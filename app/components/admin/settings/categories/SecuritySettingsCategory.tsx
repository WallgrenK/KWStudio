import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  EMPTY_SECURITY_FORM,
  securityToFormState,
  securityToPatch,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function SecuritySettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "security",
    emptyForm: EMPTY_SECURITY_FORM,
    toFormState: securityToFormState,
    toPatch: securityToPatch,
  });

  return (
    <SettingsSection
      title="Security"
      description="Session, access, and portal security defaults."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading security settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="Session timeout (minutes)" htmlFor="security-session-timeout">
              <input
                id="security-session-timeout"
                className={settingsInputClassName()}
                value={values.sessionTimeoutMinutes}
                onChange={(event) => setField("sessionTimeoutMinutes", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Invite TTL (days)" htmlFor="security-invite-ttl">
              <input
                id="security-invite-ttl"
                className={settingsInputClassName()}
                value={values.inviteTtlDays}
                onChange={(event) => setField("inviteTtlDays", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Password min length" htmlFor="security-password-min">
              <input
                id="security-password-min"
                className={settingsInputClassName()}
                value={values.passwordMinLength}
                onChange={(event) => setField("passwordMinLength", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Allowed origins" htmlFor="security-allowed-origins">
              <input
                id="security-allowed-origins"
                className={settingsInputClassName()}
                value={values.allowedOrigins}
                placeholder="https://staging.kwstudio.se, https://preview.kwstudio.se"
                onChange={(event) => setField("allowedOrigins", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <p className="text-sm text-gray-500">
            Environment CORS origins are always allowed. Values here are additive. API keys and SMTP secrets remain in environment variables.
          </p>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
