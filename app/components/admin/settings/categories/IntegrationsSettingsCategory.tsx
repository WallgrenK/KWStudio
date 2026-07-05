import { useEffect, useState } from "react";
import type { SettingsStatus } from "../settingsTypes";
import { SettingsSection } from "../SettingsSection";
import { SettingsStatusBadge } from "../SettingsStatusBadge";
import { getIntegrationRuntimeStatus, type IntegrationRuntimeStatus } from "~/services/settingsApi";
import { useCompanyInfo } from "~/settings/useCompanyInfo";

type IntegrationRow = {
  name: string;
  description: string;
};

const INTEGRATIONS: IntegrationRow[] = [
  { name: "OpenAI", description: "AI assistant and tooling" },
  { name: "SCB", description: "Swedish statistics and registry data" },
  { name: "Supabase", description: "Database, auth, and storage" },
  { name: "GitHub", description: "Repository and deployment hooks" },
  { name: "PurelyMail", description: "Transactional and workspace email" },
  { name: "Google", description: "Analytics and workspace services" },
  { name: "Future integrations", description: "Additional services as your workspace grows" },
];

function resolveIntegrationStatus(
  name: string,
  runtime: IntegrationRuntimeStatus | null,
): SettingsStatus {
  if (name === "OpenAI") return runtime?.openai ? "connected" : "coming_soon";
  if (name === "SCB") return runtime?.scb ? "connected" : "coming_soon";
  if (name === "Supabase") return runtime?.supabase === false ? "coming_soon" : "connected";
  if (name === "PurelyMail") return runtime?.smtp ? "connected" : "coming_soon";
  return "coming_soon";
}

export function IntegrationsSettingsCategory() {
  const company = useCompanyInfo();
  const [runtime, setRuntime] = useState<IntegrationRuntimeStatus | null>(null);

  useEffect(() => {
    void getIntegrationRuntimeStatus().then((result) => {
      if (result.ok && result.data?.status) {
        setRuntime(result.data.status);
      }
    });
  }, []);

  return (
    <SettingsSection
      title="Integrations"
      description={`Third-party services connected to ${company.data.companyName}.`}
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
            <SettingsStatusBadge
              status={resolveIntegrationStatus(integration.name, runtime)}
            />
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
