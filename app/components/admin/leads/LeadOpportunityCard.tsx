import type { LeadPriority } from "~/data/admin";

type LeadOpportunityCardProps = {
  stars: number;
  leadScore: number;
  closeProbability: number;
  priority: LeadPriority;
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-gray-100">
      <div className="h-2 rounded-full bg-kw-brand" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}

export function LeadOpportunityCard({
  stars,
  leadScore,
  closeProbability,
  priority,
}: LeadOpportunityCardProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Opportunity</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">Score card</h3>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-kw-brand">{priority}</span>
      </div>

      <div className="mb-5 flex gap-1 text-lg text-kw-brand" aria-label={`${stars} of 5 opportunity stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= stars ? "text-kw-brand" : "text-gray-200"}>{star <= stars ? "★" : "☆"}</span>
        ))}
      </div>

      <div className="grid gap-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Lead score</span>
            <strong className="text-gray-900">{leadScore} / 100</strong>
          </div>
          <ProgressBar value={leadScore} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Estimated close probability</span>
            <strong className="text-gray-900">{closeProbability}%</strong>
          </div>
          <ProgressBar value={closeProbability} />
        </div>
      </div>
    </section>
  );
}
