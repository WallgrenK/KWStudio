import type { LeadWorkspaceActions, LeadWorkspaceData } from "~/components/admin/leads/LeadWorkspaceTypes";

function BoolValue({ value }: { value: boolean | null }) {
  if (value === null) return <>-</>;
  return <>{value ? "Yes" : "No"}</>;
}

export function LeadAuditTab({
  data,
  actions,
}: {
  data: LeadWorkspaceData;
  actions: LeadWorkspaceActions;
}) {
  const audit = data.audit;

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Audit</p>
          <h3 className="mt-1 text-xl font-semibold text-gray-900">Website audit</h3>
        </div>
        <button className="btn btn-outline" type="button" disabled={!data.canGenerate || !data.websiteUrl} onClick={actions.onAudit}>
          Audit Again
        </button>
      </div>

      {audit ? (
        <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div><dt className="text-xs text-gray-400">SEO score</dt><dd className="mt-1 font-semibold text-gray-900">{audit.seoScore ?? "-"}/100</dd></div>
          <div><dt className="text-xs text-gray-400">SSL</dt><dd className="mt-1 font-semibold text-gray-900"><BoolValue value={audit.hasSsl} /></dd></div>
          <div><dt className="text-xs text-gray-400">Robots</dt><dd className="mt-1 font-semibold text-gray-900"><BoolValue value={audit.hasRobotsTxt} /></dd></div>
          <div><dt className="text-xs text-gray-400">Sitemap</dt><dd className="mt-1 font-semibold text-gray-900"><BoolValue value={audit.hasSitemap} /></dd></div>
          <div><dt className="text-xs text-gray-400">Meta</dt><dd className="mt-1 font-semibold text-gray-900"><BoolValue value={audit.hasMetaDescription} /></dd></div>
          <div><dt className="text-xs text-gray-400">Title</dt><dd className="mt-1 font-semibold text-gray-900"><BoolValue value={audit.hasTitle} /></dd></div>
          <div><dt className="text-xs text-gray-400">Status</dt><dd className="mt-1 font-semibold text-gray-900">{audit.statusCode ?? "-"}</dd></div>
          <div><dt className="text-xs text-gray-400">Audit date</dt><dd className="mt-1 font-semibold text-gray-900">{audit.createdAt ?? "-"}</dd></div>
          <div className="sm:col-span-2 xl:col-span-4">
            <dt className="text-xs text-gray-400">Audit summary</dt>
            <dd className="mt-2 max-w-3xl leading-7 text-gray-600">{audit.summary ?? "No audit summary"}</dd>
          </div>
        </dl>
      ) : (
        <div className="rounded-2xl bg-gray-50 p-5">
          <p className="text-sm text-gray-600">{data.websiteUrl ? "Audit pending." : "No verified website found."}</p>
        </div>
      )}
    </section>
  );
}
