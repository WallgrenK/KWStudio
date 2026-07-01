import { LeadOpportunityCard } from "~/components/admin/leads/LeadOpportunityCard";
import { LeadScoreBreakdown } from "~/components/admin/leads/LeadScoreBreakdown";
import type { LeadWorkspaceData } from "~/components/admin/leads/LeadWorkspaceTypes";

export function LeadScoreTab({ data }: { data: LeadWorkspaceData }) {
  const businessFit = data.scoreBreakdown.find((item) => item.label === "Business fit");

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <LeadOpportunityCard
        stars={data.stars}
        leadScore={data.score}
        closeProbability={data.closeProbability}
        priority={data.priority}
      />
      <LeadScoreBreakdown items={data.scoreBreakdown} />
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Priority reasoning</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">{data.priority} priority based on lead score, website signals and current opportunity stage.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Business fit</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{businessFit ? `${businessFit.value}/100` : "-"}</p>
            <p className="mt-1 text-sm text-gray-500">{businessFit?.detail ?? "No business fit score available."}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Opportunity confidence</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{data.confidence.score}%</p>
            <p className="mt-1 text-sm text-gray-500">{data.confidence.label}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
