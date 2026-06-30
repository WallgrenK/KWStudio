import type { AdminStatus } from "~/data/admin";
import { StatusBadge } from "~/components/admin/StatusBadge";

export type TaskListItem = {
  id: string;
  title: string;
  meta: string;
  description?: string;
  status?: AdminStatus;
};

export function TaskList({ items }: { items: TaskListItem[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between ${
            index === 0 ? "" : "border-t border-gray-100"
          }`}
        >
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
            <p className="mt-1 text-xs font-medium text-gray-500">{item.meta}</p>
            {item.description ? <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p> : null}
          </div>
          {item.status ? <StatusBadge status={item.status} /> : null}
        </div>
      ))}
    </div>
  );
}
