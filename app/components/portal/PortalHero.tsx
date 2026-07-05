import type { PortalProjectInfo } from "~/data/portalDashboard";
import { PortalCard } from "./PortalSection";

type PortalHeroProps = {
  firstName: string;
  project: PortalProjectInfo | null;
  preparingSpace?: boolean;
};

export function PortalHero({ firstName, project, preparingSpace = false }: PortalHeroProps) {
  const headline = preparingSpace
    ? "KWStudio is preparing your project space."
    : "We're excited to build your project.";

  const subcopy = preparingSpace
    ? "Your dashboard will fill in with progress, tasks, and updates once your project is live."
    : "Everything regarding your project can be followed here.";

  return (
    <PortalCard padding="lg" className="overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)]">
      <div className="space-y-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-kw-brand">Welcome back, {firstName}</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
            {headline}
          </h1>
          <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">{subcopy}</p>
        </div>

        {project ? (
          <dl className="grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2 xl:grid-cols-4">
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">Project</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-gray-900">{project.name}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">Current phase</dt>
              <dd className="mt-1 text-sm font-semibold capitalize text-kw-brand">{project.currentPhase}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">Project owner</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-gray-900">{project.owner}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">Started</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">{project.startedDate}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </PortalCard>
  );
}
