import type { PortalActivityItem } from "~/data/portalDashboard";
import { PortalCard, PortalEmptyState } from "./PortalSection";

type PortalActivityProps = {
  items: PortalActivityItem[];
};

export function PortalActivity({ items }: PortalActivityProps) {
  if (items.length === 0) {
    return (
      <PortalCard>
        <PortalEmptyState title="No recent activity" description="Updates from KWStudio will appear here as your project progresses." />
      </PortalCard>
    );
  }

  return (
    <PortalCard>
      <ol className="space-y-0">
        {items.map((item, index) => (
          <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < items.length - 1 ? (
              <span className="absolute left-[7px] top-4 h-[calc(100%-0.5rem)] w-px bg-gray-200" aria-hidden="true" />
            ) : null}
            <span className="relative mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-[#2E75BD] bg-white" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">{item.timeLabel}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{item.title}</p>
              {item.actorLabel ? (
                <p className="mt-0.5 text-xs text-gray-500">{item.actorLabel}</p>
              ) : null}
              {item.description ? <p className="mt-1 text-sm leading-6 text-gray-500">{item.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </PortalCard>
  );
}
