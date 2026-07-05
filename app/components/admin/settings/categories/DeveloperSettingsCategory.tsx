import {
  FinanceErrorBanner,
  FinanceLoadingMessage,
} from "~/components/admin/finance/FinanceFeedback";
import { SettingsFieldRow, SettingsFieldStack, SettingsGroup, settingsInputClassName } from "../SettingsGroup";
import { SettingsSection } from "../SettingsSection";
import {
  developerToFormState,
  developerToPatch,
  EMPTY_DEVELOPER_FORM,
} from "../settingsCategoryForms";
import { usePersistedSettingsCategory } from "../usePersistedSettingsCategory";

export function DeveloperSettingsCategory() {
  const { values, setField, isLoading, loadError, saveError } = usePersistedSettingsCategory({
    categoryId: "developer",
    emptyForm: EMPTY_DEVELOPER_FORM,
    toFormState: developerToFormState,
    toPatch: developerToPatch,
  });

  return (
    <SettingsSection
      title="Developer"
      description="Feature flags and domain defaults for CRM, projects, and documents."
    >
      {isLoading ? (
        <FinanceLoadingMessage message="Loading developer settings…" />
      ) : loadError ? (
        <FinanceErrorBanner message={loadError} />
      ) : (
        <SettingsFieldStack>
          <SettingsGroup label="Feature flags (JSON)" htmlFor="developer-feature-flags">
            <textarea
              id="developer-feature-flags"
              className={`${settingsInputClassName()} min-h-28 py-3 font-mono text-xs`}
              value={values.featureFlagsJson}
              onChange={(event) => setField("featureFlagsJson", event.target.value)}
            />
          </SettingsGroup>
          <SettingsFieldRow>
            <SettingsGroup label="Default lead owner" htmlFor="developer-lead-owner">
              <input
                id="developer-lead-owner"
                className={settingsInputClassName()}
                value={values.defaultLeadOwner}
                onChange={(event) => setField("defaultLeadOwner", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Default pipeline stage" htmlFor="developer-pipeline-stage">
              <input
                id="developer-pipeline-stage"
                className={settingsInputClassName()}
                value={values.defaultPipelineStage}
                onChange={(event) => setField("defaultPipelineStage", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Default project status" htmlFor="developer-project-status">
              <input
                id="developer-project-status"
                className={settingsInputClassName()}
                value={values.defaultProjectStatus}
                onChange={(event) => setField("defaultProjectStatus", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Delivery stages" htmlFor="developer-delivery-stages">
              <input
                id="developer-delivery-stages"
                className={settingsInputClassName()}
                value={values.deliveryStages}
                placeholder="Discovery, Design, Build, Launch"
                onChange={(event) => setField("deliveryStages", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          <SettingsFieldRow>
            <SettingsGroup label="Signature expiry (days)" htmlFor="developer-signature-expiry">
              <input
                id="developer-signature-expiry"
                className={settingsInputClassName()}
                value={values.defaultSignatureExpiryDays}
                onChange={(event) => setField("defaultSignatureExpiryDays", event.target.value)}
              />
            </SettingsGroup>
            <SettingsGroup label="Default template ID" htmlFor="developer-template-id">
              <input
                id="developer-template-id"
                className={settingsInputClassName()}
                value={values.defaultTemplateId}
                onChange={(event) => setField("defaultTemplateId", event.target.value)}
              />
            </SettingsGroup>
          </SettingsFieldRow>
          {saveError ? <FinanceErrorBanner message={saveError} /> : null}
        </SettingsFieldStack>
      )}
    </SettingsSection>
  );
}
