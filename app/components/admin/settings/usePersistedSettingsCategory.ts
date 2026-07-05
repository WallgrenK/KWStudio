import { useCallback, useEffect, useState } from "react";
import { getSettingsCategory, updateSettingsCategory } from "~/services/settingsApi";
import { useSettings } from "~/settings/useSettings";
import type { SettingsCategoryId } from "~/settings/settingsTypes";
import { useSettingsContext } from "./SettingsContext";
import { useSettingsCategoryRegistration, useSettingsForm } from "./useSettingsForm";

type UsePersistedSettingsCategoryOptions<TForm extends Record<string, unknown>> = {
  categoryId: SettingsCategoryId;
  emptyForm: TForm;
  toFormState: (settings: never) => TForm;
  toPatch: (values: TForm) => Record<string, unknown>;
  invalidateCategories?: SettingsCategoryId[];
  refreshPublic?: boolean;
};

export function usePersistedSettingsCategory<TForm extends Record<string, unknown>>({
  categoryId,
  emptyForm,
  toFormState,
  toPatch,
  invalidateCategories = [],
  refreshPublic = false,
}: UsePersistedSettingsCategoryOptions<TForm>) {
  const { registerHandlers, unregisterHandlers, reportStatus } = useSettingsContext();
  const { invalidateSettings, refreshCategory, refreshPublicSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { values, setField, setBaseline, isDirty, reset } = useSettingsForm(emptyForm);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);

      const result = await getSettingsCategory(categoryId);
      if (cancelled) return;

      if (result.ok && result.data?.settings) {
        setBaseline(toFormState(result.data.settings as never));
        reportStatus(categoryId, "configured");
      } else {
        setLoadError(result.error ?? `Could not load ${categoryId} settings.`);
        reportStatus(categoryId, "error");
      }

      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [categoryId, reportStatus, setBaseline, toFormState]);

  const save = useCallback(async () => {
    setSaveError(null);

    const result = await updateSettingsCategory(categoryId, toPatch(values) as never);
    if (result.ok && result.data?.settings) {
      setBaseline(toFormState(result.data.settings as never));
      reportStatus(categoryId, "configured");

      invalidateSettings(categoryId);
      for (const relatedCategory of invalidateCategories) {
        invalidateSettings(relatedCategory);
      }

      void refreshCategory(categoryId);
      for (const relatedCategory of invalidateCategories) {
        void refreshCategory(relatedCategory);
      }

      if (refreshPublic) {
        void refreshPublicSettings();
      }
      return;
    }

    setSaveError(result.error ?? `Could not save ${categoryId} settings.`);
    reportStatus(categoryId, "error");
  }, [
    categoryId,
    invalidateCategories,
    invalidateSettings,
    refreshCategory,
    refreshPublic,
    refreshPublicSettings,
    reportStatus,
    setBaseline,
    toFormState,
    toPatch,
    values,
  ]);

  useSettingsCategoryRegistration(categoryId, isDirty, save, reset, registerHandlers, unregisterHandlers);

  return {
    values,
    setField,
    isLoading,
    loadError,
    saveError,
    isDirty,
    reset,
  };
}
