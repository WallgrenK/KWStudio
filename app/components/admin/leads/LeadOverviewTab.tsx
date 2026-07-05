import { LeadRecommendedPackage } from "~/components/admin/leads/LeadRecommendedPackage";
import { LeadTopIssues } from "~/components/admin/leads/LeadTopIssues";
import type { LeadWorkspaceData } from "~/components/admin/leads/LeadWorkspaceTypes";

export function LeadOverviewTab({ data }: { data: LeadWorkspaceData }) {
  return (
    <div className="grid gap-5">
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Company</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{data.companyName}</h2>
            <p className="mt-1 text-sm text-gray-500">{data.location}</p>
          </div>
          <div className="flex flex-wrap gap-2">{data.badges}</div>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-kw-brand">Opportunity summary</p>
        <h3 className="mt-2 text-xl font-semibold text-gray-900">{data.opportunityTitle}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">{data.summary}</p>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <LeadRecommendedPackage packageName={data.packageName} reason={data.packageReason} estimatedValue={data.estimatedValue} />
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Next action</p>
          <p className="mt-3 text-base leading-7 text-gray-700">{data.nextAction}</p>
          <div className="mt-5 rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Recommended service</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{data.recommendedService}</p>
          </div>
        </section>
      </div>

      <LeadTopIssues issues={data.topIssues} />
    </div>
  );
}
