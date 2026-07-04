import { useSettingsContext } from "./SettingsContext";

export function SettingsHeaderActions() {
  const { isDirty, isSaving, saveAll, resetAll, setIsSaving } = useSettingsContext();

  async function handleSaveAll() {
    setIsSaving(true);
    try {
      await saveAll();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="btn btn-outline"
        type="button"
        disabled={!isDirty || isSaving}
        onClick={() => resetAll()}
      >
        Reset all
      </button>
      <button
        className="btn btn-primary"
        type="button"
        disabled={!isDirty || isSaving}
        onClick={() => void handleSaveAll()}
      >
        {isSaving ? "Saving…" : "Save all"}
      </button>
    </div>
  );
}
