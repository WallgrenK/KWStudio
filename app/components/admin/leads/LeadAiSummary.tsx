type LeadAiSummaryProps = {
  opportunity: string;
  confidence: {
    score: number;
    label: string;
  };
  estimatedValue: string;
  summary: string;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  copiedMessage: string | null;
  hasInsight: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
};

function SummarySkeleton() {
  return (
    <div className="grid animate-pulse gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-2xl bg-white/70 p-4">
            <div className="h-3 w-20 rounded-full bg-blue-100" />
            <div className="mt-3 h-5 w-28 rounded-full bg-blue-100" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-white/70 p-4">
        <div className="h-3 w-full rounded-full bg-blue-100" />
        <div className="mt-2 h-3 w-5/6 rounded-full bg-blue-100" />
        <div className="mt-2 h-3 w-3/5 rounded-full bg-blue-100" />
      </div>
    </div>
  );
}

export function LeadAiSummary({
  opportunity,
  confidence,
  estimatedValue,
  summary,
  isLoading,
  isGenerating,
  error,
  copiedMessage,
  hasInsight,
  canGenerate,
  onGenerate,
}: LeadAiSummaryProps) {
  const isBusy = isLoading || isGenerating;

  return (
    <section className="rounded-3xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-kw-brand">🤖 AI Sales Assistant</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Executive sales summary</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {copiedMessage ? (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-kw-brand shadow-sm">{copiedMessage}</span>
          ) : null}
          {!hasInsight && !isBusy ? (
            <button className="btn btn-primary" type="button" disabled={!canGenerate} onClick={onGenerate}>
              Generate AI Pitch
            </button>
          ) : null}
        </div>
      </div>

      {isBusy ? (
        <SummarySkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-white p-4">
          <p className="text-sm font-semibold text-gray-900">Couldn't generate AI insight.</p>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button className="mt-4 btn btn-outline" type="button" disabled={!canGenerate} onClick={onGenerate}>
            Try again
          </button>
        </div>
      ) : !hasInsight ? (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-white/70 p-4">
          <p className="text-sm font-medium text-gray-700">No AI insight generated yet.</p>
          <p className="mt-1 text-sm text-gray-500">Generate an AI pitch to load the saved summary, service recommendation, pitch and email draft.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Opportunity</span>
              <strong className="mt-2 block text-sm leading-5 text-gray-900">{opportunity}</strong>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Confidence</span>
              <strong className="mt-2 block text-sm text-gray-900">{confidence.score}%</strong>
              <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-kw-brand">{confidence.label}</span>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Estimated value</span>
              <strong className="mt-2 block text-sm text-gray-900">{estimatedValue}</strong>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Short summary</span>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-700">{summary}</p>
          </div>
        </div>
      )}
    </section>
  );
}
