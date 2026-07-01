type LeadTopIssuesProps = {
  issues: Array<{
    label: string;
    tooltip: string;
  }>;
};

export function LeadTopIssues({ issues }: LeadTopIssuesProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Top Issues</p>
        <h3 className="mt-1 text-lg font-semibold text-gray-900">What to lead with</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {issues.map((issue) => (
          <span
            key={issue.label}
            className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600"
            title={issue.tooltip}
          >
            {issue.label}
          </span>
        ))}
      </div>
    </section>
  );
}
