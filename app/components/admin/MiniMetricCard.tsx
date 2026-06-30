import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";

type MiniMetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  href?: string;
  icon?: LucideIcon;
};

export function MiniMetricCard({ label, value, detail, href, icon: Icon }: MiniMetricCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-gray-500">{label}</span>
          <strong className="mt-2 block text-2xl font-bold text-gray-800">{value}</strong>
        </div>
        {Icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Icon className="size-5 text-gray-700" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {detail ? <p className="mt-3 text-sm leading-6 text-gray-500">{detail}</p> : null}
    </>
  );

  const className = "rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#2E75BD]";

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
