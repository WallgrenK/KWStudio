import type { ReactNode } from "react";

export type KanbanColumn = {
  id: string;
  title: string;
  items: ReactNode[];
};

export function KanbanBoard({ columns }: { columns: KanbanColumn[] }) {
  return (
    <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => (
        <section key={column.id} className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">{column.title}</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {column.items.length}
            </span>
          </div>
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {column.items.length > 0 ? (
              column.items
            ) : (
              <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-500">
                No items in this stage.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
