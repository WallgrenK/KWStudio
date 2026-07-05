import { StatusBadge } from "~/components/admin/StatusBadge";

export type TimelineItem = {
  id: string;
  title: string;
  meta: string;
  detail?: string;
  status?: string;
};

export function Timeline({ title = "Timeline", items }: { title?: string; items: TimelineItem[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="mt-5 space-y-5">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-kw-brand" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">{item.meta}</p>
                </div>
                {item.status ? <StatusBadge status={item.status} /> : null}
              </div>
              {item.detail ? <p className="mt-2 text-sm leading-6 text-gray-500">{item.detail}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
