type LeadTechnicalDetail = {
  label: string;
  value: string;
  href?: string;
};

type LeadTechnicalDetailsProps = {
  details: LeadTechnicalDetail[];
};

export function LeadTechnicalDetails({ details }: LeadTechnicalDetailsProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Technical Details</p>
        <h3 className="mt-1 text-lg font-semibold text-gray-900">Lead context</h3>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        {details.map((detail) => (
          <div key={detail.label} className="min-w-0">
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{detail.label}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-gray-800">
              {detail.href ? (
                <a className="text-[#2E75BD]" href={detail.href} target="_blank" rel="noreferrer">
                  {detail.value}
                </a>
              ) : (
                detail.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
