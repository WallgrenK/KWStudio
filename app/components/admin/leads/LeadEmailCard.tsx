type LeadEmailCardProps = {
  subject: string;
  body: string;
  hasInsight: boolean;
  isBusy: boolean;
  canRegenerate: boolean;
  onCopySubject: () => void;
  onCopyEmail: () => void;
  onRegenerate: () => void;
};

function EmailSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gray-50 p-4">
      <div className="h-3 w-20 rounded-full bg-gray-200" />
      <div className="mt-3 h-4 w-3/4 rounded-full bg-gray-200" />
      <div className="mt-6 h-3 w-16 rounded-full bg-gray-200" />
      <div className="mt-3 h-3 w-full rounded-full bg-gray-200" />
      <div className="mt-2 h-3 w-5/6 rounded-full bg-gray-200" />
      <div className="mt-2 h-3 w-2/3 rounded-full bg-gray-200" />
    </div>
  );
}

export function LeadEmailCard({
  subject,
  body,
  hasInsight,
  isBusy,
  canRegenerate,
  onCopySubject,
  onCopyEmail,
  onRegenerate,
}: LeadEmailCardProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Suggested email</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">Outreach draft</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasInsight ? <button className="btn btn-outline" type="button" onClick={onCopySubject}>Copy Subject</button> : null}
          {hasInsight ? <button className="btn btn-outline" type="button" onClick={onCopyEmail}>Copy Email</button> : null}
          <button className="btn btn-primary" type="button" disabled={!canRegenerate || isBusy} onClick={onRegenerate}>
            {hasInsight ? "Regenerate" : "Generate AI Pitch"}
          </button>
        </div>
      </div>

      {isBusy ? (
        <EmailSkeleton />
      ) : !hasInsight ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">No AI insight generated yet.</p>
          <p className="mt-1 text-sm text-gray-500">Generate an AI pitch to create a saved email draft.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-50 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Subject</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{subject}</p>
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Body</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-700">{body}</p>
          </div>
          <div className="mt-5 border-t border-gray-200 pt-4 text-sm leading-6 text-gray-700">
            <p>Kim Wallgren</p>
            <p>Founder</p>
            <p>KWStudio</p>
          </div>
        </div>
      )}
    </section>
  );
}
