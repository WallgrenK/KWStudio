import { Check } from "lucide-react";
import type { PortalTimelinePhase } from "~/data/portalDashboard";
import { PortalCard, PortalEmptyState } from "./PortalSection";

type PortalTimelineProps = {
  phases: PortalTimelinePhase[];
};

export function PortalTimeline({ phases }: PortalTimelineProps) {
  if (phases.length === 0) {
    return (
      <PortalCard>
        <PortalEmptyState
          title="No project timeline yet"
          description="Your project phases will appear here once work begins."
        />
      </PortalCard>
    );
  }

  return (
    <PortalCard className="overflow-hidden">
      <ol className="flex flex-col gap-0 md:flex-row md:items-start md:justify-between md:gap-2 lg:gap-3">
        {phases.map((phase, index) => {
          const isCompleted = phase.status === "completed";
          const isCurrent = phase.status === "current";

          return (
            <li
              key={phase.id}
              className={`relative flex min-w-0 flex-1 items-start gap-3 pb-6 md:flex-col md:items-center md:pb-0 md:text-center ${
                index < phases.length - 1
                  ? "md:after:absolute md:after:left-[calc(50%+1.25rem)] md:after:top-5 md:after:h-px md:after:w-[calc(100%-2.5rem)] md:after:bg-gray-200"
                  : ""
              }`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200 ${
                  isCompleted
                    ? "border-[#2E75BD] bg-[#2E75BD] text-white"
                    : isCurrent
                      ? "border-[#2E75BD] bg-[#eff6ff] text-[#2E75BD] ring-4 ring-[#eff6ff]"
                      : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1 pt-1 md:flex-none md:pt-3">
                <p
                  className={`text-sm font-medium leading-5 ${
                    isCurrent ? "text-gray-900" : isCompleted ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {phase.label}
                </p>
                {isCurrent ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-[#2E75BD]">Current</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </PortalCard>
  );
}
