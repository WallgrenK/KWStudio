import { SettingsSection } from "./SettingsSection";

const DANGER_ACTIONS = [
  "Export settings",
  "Import settings",
  "Reset demo data",
  "Clear cache",
  "Delete workspace",
] as const;

export function SettingsDangerZone() {
  return (
    <SettingsSection
      title="Danger Zone"
      description="Destructive workspace actions are disabled in this demo. These controls will be wired when backend support is available."
    >
      <div className="space-y-3">
        {DANGER_ACTIONS.map((action) => (
          <div
            key={action}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50/40 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{action}</p>
              <p className="text-xs text-gray-500">Not available yet</p>
            </div>
            <button className="btn btn-outline opacity-60" type="button" disabled>
              {action}
            </button>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
