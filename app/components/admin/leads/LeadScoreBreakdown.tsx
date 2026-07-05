export type LeadScoreBreakdownItem = {
  label: string;
  value: number;
  detail: string;
};

type LeadScoreBreakdownProps = {
  items: LeadScoreBreakdownItem[];
};

export function LeadScoreBreakdown({ items }: LeadScoreBreakdownProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Score Breakdown</p>
        <h3 className="mt-1 text-lg font-semibold text-gray-900">Quality signals</h3>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-800">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900">{item.value}/100</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-kw-brand" style={{ width: `${Math.min(Math.max(item.value, 0), 100)}%` }} />
            </div>
            <p className="mt-2 text-sm leading-5 text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
