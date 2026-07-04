import type { PortalContactInfo } from "~/data/portalDashboard";
import { PortalCard, PortalEmptyState } from "./PortalSection";

type PortalContactCardProps = {
  contact: PortalContactInfo | null;
};

export function PortalContactCard({ contact }: PortalContactCardProps) {
  if (!contact) {
    return (
      <PortalCard>
        <PortalEmptyState
          title="Contact details coming soon"
          description="Your KWStudio project manager will appear here once assigned."
        />
      </PortalCard>
    );
  }

  return (
    <PortalCard>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">{contact.role}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{contact.name}</p>
        </div>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-gray-400">Email</dt>
            <dd className="mt-0.5 break-all font-medium text-gray-800">{contact.email}</dd>
          </div>
          <div>
            <dt className="text-gray-400">Expected response</dt>
            <dd className="mt-0.5 font-medium text-gray-800">{contact.responseTime}</dd>
          </div>
        </dl>
        <button
          className="btn btn-primary w-full transition-opacity duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2"
          type="button"
          disabled
        >
          Contact KWStudio
        </button>
        <p className="text-center text-xs text-gray-400">Messaging will be available in a future update.</p>
      </div>
    </PortalCard>
  );
}

type PortalProjectInfoCardProps = {
  project: {
    name: string;
    status: string;
    owner: string;
    estimatedLaunch: string;
    projectType: string;
  } | null;
};

export function PortalProjectInfoCard({ project }: PortalProjectInfoCardProps) {
  if (!project) {
    return (
      <PortalCard>
        <PortalEmptyState
          title="No project yet"
          description="Your project details will appear here once assigned."
        />
      </PortalCard>
    );
  }

  return (
    <PortalCard>
      <dl className="space-y-4 text-sm">
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gray-400">Project</dt>
          <dd className="min-w-0 text-right font-medium text-gray-900">{project.name}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gray-400">Status</dt>
          <dd className="text-right font-medium capitalize text-gray-900">{project.status}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gray-400">Project owner</dt>
          <dd className="min-w-0 text-right font-medium text-gray-900">{project.owner}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gray-400">Estimated launch</dt>
          <dd className="text-right font-medium text-gray-900">{project.estimatedLaunch}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="shrink-0 text-gray-400">Project type</dt>
          <dd className="min-w-0 text-right font-medium text-gray-900">{project.projectType}</dd>
        </div>
      </dl>
    </PortalCard>
  );
}
