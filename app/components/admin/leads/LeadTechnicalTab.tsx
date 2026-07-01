import { LeadTechnicalDetails } from "~/components/admin/leads/LeadTechnicalDetails";
import type { LeadWorkspaceData } from "~/components/admin/leads/LeadWorkspaceTypes";

export function LeadTechnicalTab({ data }: { data: LeadWorkspaceData }) {
  return (
    <div className="grid gap-5">
      <LeadTechnicalDetails details={data.rawDetails} />
      {data.audit ? (
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Audit raw fields</p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">Technical audit values</h3>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.audit.rawFields.map((detail) => (
              <div key={detail.label} className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{detail.label}</dt>
                <dd className="mt-1 truncate text-sm font-medium text-gray-800">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
