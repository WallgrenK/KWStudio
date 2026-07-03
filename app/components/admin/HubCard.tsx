import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "~/components/admin/StatusBadge";

type HubCardProps = {
  title: string;
  description: string;
  href?: string;
  status?: string;
  icon?: LucideIcon;
};

export function HubCard({ title, description, href, status, icon: Icon }: HubCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Icon className="size-5 text-gray-700" aria-hidden="true" />
            </span>
          ) : null}
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        {status ? <StatusBadge status={status} /> : null}
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
    </>
  );

  const className = `rounded-2xl border border-gray-200 bg-white p-5 transition ${
    href ? "hover:border-[#2E75BD]" : "opacity-80"
  }`;

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
