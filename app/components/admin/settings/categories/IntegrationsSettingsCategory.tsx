import type { SettingsStatus } from "../settingsTypes";
import { SettingsSection } from "../SettingsSection";
import { SettingsStatusBadge } from "../SettingsStatusBadge";

type IntegrationRow = {
  name: string;
  description: string;
  status: SettingsStatus;
};

const INTEGRATIONS: IntegrationRow[] = [
  { name: "OpenAI", description: "AI assistant and tooling", status: "coming_soon" },
  { name: "SCB", description: "Swedish statistics and registry data", status: "coming_soon" },
  { name: "Supabase", description: "Database, auth, and storage", status: "connected" },
  { name: "GitHub", description: "Repository and deployment hooks", status: "coming_soon" },
  { name: "PurelyMail", description: "Transactional and workspace email", status: "coming_soon" },
  { name: "Google", description: "Analytics and workspace services", status: "coming_soon" },
  { name: "Future integrations", description: "Additional services as KWStudio grows", status: "coming_soon" },
];

export function IntegrationsSettingsCategory() {
  return (
    <SettingsSection
      title="Integrations"
      description="Third-party services connected to KWStudio."
    >
      <div className="grid gap-3">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.name}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{integration.name}</p>
              <p className="text-xs text-gray-500">{integration.description}</p>
            </div>
            <SettingsStatusBadge status={integration.status} />
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
