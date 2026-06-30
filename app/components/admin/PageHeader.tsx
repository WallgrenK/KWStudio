import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow = "KWStudio Admin", title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <span className="text-xs font-semibold uppercase leading-5 tracking-[0.08em] text-gray-500">{eyebrow}</span>
        ) : null}
        <h1 className="mt-1 text-3xl font-bold text-gray-800">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
