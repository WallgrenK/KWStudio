import type { PortalProjectSummary } from "~/data/portalDashboard";
import { PortalCard } from "./PortalSection";

type PortalProjectSwitcherProps = {
  projects: PortalProjectSummary[];
  selectedProjectId: string;
  onSelect: (projectId: string) => void;
};

export function PortalProjectSwitcher({
  projects,
  selectedProjectId,
  onSelect,
}: PortalProjectSwitcherProps) {
  if (projects.length <= 1) {
    return null;
  }

  const selected = projects.find((project) => project.id === selectedProjectId) ?? projects[0];

  return (
    <PortalCard padding="sm" className="overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">Active project</p>
          <p className="mt-1 truncate text-sm font-semibold text-gray-900">{selected.title}</p>
          <p className="mt-1 text-xs capitalize text-gray-500">{selected.status}</p>
        </div>

        <label className="flex w-full min-w-0 flex-col gap-1 sm:w-auto sm:min-w-[240px]">
          <span className="text-xs font-medium text-gray-500">Switch project</span>
          <select
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40"
            value={selectedProjectId}
            onChange={(event) => onSelect(event.target.value)}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      </div>
    </PortalCard>
  );
}
