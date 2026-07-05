import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  emailToFormState,
  emailToPatch,
  EMPTY_EMAIL_FORM,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function EmailSettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "email",
    emptyForm: EMPTY_EMAIL_FORM,
    toFormState: emailToFormState,
    toPatch: emailToPatch,
  });

  return (
    <SettingsSection
      title="Email"
      description="Outbound email identity and signature defaults for client communication."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading email settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsFieldRow>
            <SettingsGroup label="From name" htmlFor="email-from-name">
              <input
                id="email-from-name"
                className={settingsInputClassName()}
                value={values.fromName}
                onChange={(event) => setField("fromName", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="From address" htmlFor="email-from-address">
              <input
                id="email-from-address"
                type="email"
                className={settingsInputClassName()}
                value={values.fromAddress}
                onChange={(event) => setField("fromAddress", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Reply-to address" htmlFor="email-reply-to">
              <input
                id="email-reply-to"
                type="email"
                className={settingsInputClassName()}
                value={values.replyTo}
                onChange={(event) => setField("replyTo", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Signature" htmlFor="email-signature">
              <textarea
                id="email-signature"
                className={`${settingsInputClassName()} min-h-20 py-3`}
                value={values.signature}
                onChange={(event) => setField("signature", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <p className="text-sm text-gray-500">
            SMTP credentials and provider routing remain in environment variables.
          </p>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
