import type { ReactNode } from "react";

export type KanbanColumn = {
  id: string;
  title: string;
  items: ReactNode[];
};

export function KanbanBoard({ columns }: { columns: KanbanColumn[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column) => (
        <section key={column.id} className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">{column.title}</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {column.items.length}
            </span>
          </div>
          <div className="space-y-3">{column.items}</div>
        </section>
      ))}
    </div>
  );
}
