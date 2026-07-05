import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";

export type QuickActionItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export function QuickActions({ title = "Quick actions", actions }: { title?: string; actions: QuickActionItem[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="mt-5 grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              to={action.href}
              className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-kw-brand hover:bg-gray-50"
            >
              <Icon className="h-5 w-5 text-gray-500" aria-hidden="true" />
              <span>
                <span className="block">{action.label}</span>
                {action.description ? <span className="mt-0.5 block text-xs font-normal text-gray-500">{action.description}</span> : null}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
