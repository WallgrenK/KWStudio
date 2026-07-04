import { useCallback } from "react";
import { settingsProfile } from "~/data/admin";
import { useSettingsContext } from "../SettingsContext";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsComingSoonBadge } from "../SettingsStatusBadge";
import { SettingsSection } from "../SettingsSection";
import { useSettingsCategoryRegistration, useSettingsForm } from "../useSettingsForm";

type BusinessFormState = {
  companyName: string;
  organizationNumber: string;
  vatNumber: string;
  address: string;
  contactEmail: string;
  description: string;
};

const INITIAL: BusinessFormState = {
  companyName: "KWStudio AB",
  organizationNumber: "",
  vatNumber: "",
  address: settingsProfile.location,
  contactEmail: settingsProfile.email,
  description: "Web design and development",
};

export function BusinessSettingsCategory() {
  const { registerHandlers, unregisterHandlers } = useSettingsContext();
  const { values, setField, isDirty, reset, markSaved } = useSettingsForm(INITIAL);

  const save = useCallback(() => {
    markSaved();
  }, [markSaved]);

  useSettingsCategoryRegistration("business", isDirty, save, reset, registerHandlers, unregisterHandlers);

  return (
    <SettingsSection
      title="Business"
      description="Company information used across invoices, reports, and client-facing materials."
    >
      <SettingsFieldStack>
        <SettingsFieldRow>
          <SettingsGroup label="Company name" htmlFor="business-company-name">
            <input
              id="business-company-name"
              className={settingsInputClassName()}
              value={values.companyName}
              onChange={(event) => setField("companyName", event.target.value)}
            />
          </SettingsGroup>
          <SettingsGroup label="Organization number" htmlFor="business-org-number">
            <input
              id="business-org-number"
              className={settingsInputClassName(true)}
              value={values.organizationNumber}
              placeholder="556000-0000"
              disabled
            />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsFieldRow>
          <SettingsGroup label="VAT number" htmlFor="business-vat-number">
            <input
              id="business-vat-number"
              className={settingsInputClassName(true)}
              value={values.vatNumber}
              placeholder="SE556000000001"
              disabled
            />
          </SettingsGroup>
          <SettingsGroup label="Contact email" htmlFor="business-contact-email">
            <input
              id="business-contact-email"
              type="email"
              className={settingsInputClassName()}
              value={values.contactEmail}
              onChange={(event) => setField("contactEmail", event.target.value)}
            />
          </SettingsGroup>
        </SettingsFieldRow>
        <SettingsGroup label="Address" htmlFor="business-address">
          <input
            id="business-address"
            className={settingsInputClassName()}
            value={values.address}
            onChange={(event) => setField("address", event.target.value)}
          />
        </SettingsGroup>
        <SettingsGroup label="Description" htmlFor="business-description">
          <textarea
            id="business-description"
            className={`${settingsInputClassName()} min-h-24 py-3`}
            value={values.description}
            onChange={(event) => setField("description", event.target.value)}
          />
        </SettingsGroup>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <SettingsComingSoonBadge />
          <span>Organization and VAT numbers will sync from company registry integrations.</span>
        </div>
      </SettingsFieldStack>
    </SettingsSection>
  );
}
