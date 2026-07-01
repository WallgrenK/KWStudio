import { LeadAiSummary } from "~/components/admin/leads/LeadAiSummary";
import type { LeadWorkspaceActions, LeadWorkspaceData } from "~/components/admin/leads/LeadWorkspaceTypes";

export function LeadAiPitchTab({
  data,
  actions,
}: {
  data: LeadWorkspaceData;
  actions: LeadWorkspaceActions;
}) {
  return (
    <div className="grid gap-5">
      <LeadAiSummary
        opportunity={data.opportunityTitle}
        confidence={data.confidence}
        estimatedValue={data.estimatedValue}
        summary={data.summary}
        isLoading={data.isLoadingAiInsight}
        isGenerating={data.isGeneratingAiInsight}
        error={data.aiInsightError}
        copiedMessage={data.copiedMessage}
        hasInsight={data.hasInsight}
        canGenerate={data.canGenerate}
        onGenerate={actions.onGenerate}
      />

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Recommended service</p>
            <h3 className="mt-2 text-xl font-semibold text-gray-900">{data.hasInsight ? data.recommendedService : "No AI insight generated yet"}</h3>
            {data.aiInsightCreatedAt ? (
              <p className="mt-1 text-sm text-gray-500">Saved {data.aiInsightCreatedAt}</p>
            ) : null}
          </div>
          <button className="btn btn-primary" type="button" disabled={!data.canGenerate || data.isGeneratingAiInsight} onClick={actions.onGenerate}>
            {data.hasInsight ? "Regenerate" : "Generate AI Pitch"}
          </button>
        </div>
      </section>

      {data.hasInsight ? (
        <>
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pitch</p>
            <p className="mt-3 max-w-3xl text-base leading-8 text-gray-700">{data.salesAngle}</p>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Sales Angle</p>
            <p className="mt-3 max-w-3xl text-base leading-8 text-gray-700">{data.salesAngle}</p>
          </section>
        </>
      ) : null}
    </div>
  );
}
