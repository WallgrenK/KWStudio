import type { ReactNode } from "react";

type AdminComingSoonProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function AdminComingSoon({ title, description, action }: AdminComingSoonProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2E75BD]">Coming soon</p>
      <h2 className="mt-3 text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
