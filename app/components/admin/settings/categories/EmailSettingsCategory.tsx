import { useCallback } from "react";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type EmailFormState = {
  fromName: string;
  fromAddress: string;
  replyTo: string;
  signature: string;
};

const INITIAL: EmailFormState = {
  fromName: "KWStudio",
  fromAddress: "hello@kwstudio.se",
  replyTo: "hello@kwstudio.se",
  signature: "",
};

export function EmailSettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("email", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Email"
      description="Outbound email identity and signature defaults for client communication."
    >
      <SettingsFieldStack>
        <SettingsFieldRow>
          <SettingsGroup label="From name" htmlFor="email-from-name">
            <input id="email-from-name" className={settingsInputClassName(true)} value={values.fromName} disabled />
          </SettingsGroup>
          <SettingsGroup label="From address" htmlFor="email-from-address">
            <input id="email-from-address" className={settingsInputClassName(true)} value={values.fromAddress} disabled />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="Reply-to address" htmlFor="email-reply-to">
            <input id="email-reply-to" className={settingsInputClassName(true)} value={values.replyTo} disabled />
          </SettingsGroup>
          <SettingsGroup label="Signature" htmlFor="email-signature">
            <textarea
              id="email-signature"
              className={`${settingsInputClassName(true)} min-h-20 py-3`}
              value={values.signature}
              disabled
            />
          </SettingsGroup>
        </SettingsFieldRow>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>SMTP and provider routing will be configured in a future release.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
