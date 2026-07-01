import type { LeadWorkspaceActions, LeadWorkspaceData } from "~/components/admin/leads/LeadWorkspaceTypes";

export function LeadPreviewPanel({
  data,
  actions,
  onClose,
  onOpenWorkspace,
}: {
  data: LeadWorkspaceData;
  actions: LeadWorkspaceActions;
  onClose: () => void;
  onOpenWorkspace: () => void;
}) {
  const isBusy = data.isLoadingAiInsight || data.isGeneratingAiInsight;

  return (
    <aside className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 xl:sticky xl:top-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Lead preview</p>
          <h2 className="mt-1 truncate text-xl font-semibold text-gray-900">{data.companyName}</h2>
          <p className="mt-1 truncate text-sm text-gray-500">{data.location}</p>
        </div>
        <button
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-[#2E75BD] hover:text-[#2E75BD]"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">{data.badges}</div>

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2E75BD]">AI summary</p>
        {isBusy ? (
          <div className="mt-3 animate-pulse space-y-2">
            <div className="h-3 rounded-full bg-gray-100" />
            <div className="h-3 w-5/6 rounded-full bg-gray-100" />
            <div className="h-3 w-3/5 rounded-full bg-gray-100" />
          </div>
        ) : (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-700">
            {data.hasInsight ? data.summary : "No AI insight generated yet."}
          </p>
        )}
        {data.aiInsightError ? (
          <p className="mt-2 text-sm text-red-600">Couldn't generate AI insight.</p>
        ) : null}
      </div>

      <div className="mb-5 grid gap-4 border-y border-gray-100 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Recommended service</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{data.recommendedService}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Estimated value</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{data.estimatedValue}</p>
        </div>
      </div>

      {data.copiedMessage ? (
        <p className="mb-3 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-[#2E75BD]">{data.copiedMessage}</p>
      ) : null}

      <div className="grid gap-2">
        <button className="btn btn-primary" type="button" onClick={onOpenWorkspace}>
          Open workspace
        </button>
        {data.hasInsight ? (
          <button className="btn btn-outline" type="button" onClick={actions.onCopyEmail}>
            Copy email
          </button>
        ) : null}
        <button className="btn btn-outline" type="button" disabled={!data.canGenerate || isBusy} onClick={actions.onGenerate}>
          {data.hasInsight ? "Regenerate AI Pitch" : "Generate AI Pitch"}
        </button>
        {data.websiteUrl ? (
          <a className="btn btn-outline text-center" href={data.websiteUrl} target="_blank" rel="noreferrer">
            Open website
          </a>
        ) : (
          <button className="btn btn-outline" type="button" disabled title="No verified website found">
            Open website
          </button>
        )}
      </div>
    </aside>
  );
}
