import type { ReactNode } from "react";

type FormCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormCard({ eyebrow, title, description, children }: FormCardProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      {eyebrow ? <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2E75BD]">{eyebrow}</span> : null}
      <h2 className="mt-1 text-lg font-semibold text-gray-800">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
