export type RecommendedPackageName = "Starter" | "Business" | "Growth" | "Enterprise";

type LeadRecommendedPackageProps = {
  packageName: RecommendedPackageName;
  reason: string;
  estimatedValue: string;
};

const packageStyles: Record<RecommendedPackageName, string> = {
  Starter: "bg-sky-50 text-sky-700",
  Business: "bg-blue-50 text-kw-brand",
  Growth: "bg-emerald-50 text-emerald-700",
  Enterprise: "bg-gray-900 text-white",
};

export function LeadRecommendedPackage({
  packageName,
  reason,
  estimatedValue,
}: LeadRecommendedPackageProps) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Recommended Package</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{packageName}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${packageStyles[packageName]}`}>{packageName}</span>
      </div>
      <p className="text-sm leading-6 text-gray-600">{reason}</p>
      <div className="mt-5 rounded-2xl bg-gray-50 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Estimated value</span>
        <strong className="mt-1 block text-base text-gray-900">{estimatedValue}</strong>
      </div>
    </section>
  );
}
