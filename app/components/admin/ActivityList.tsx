type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time?: string;
  meta?: string;
};

export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-lg font-semibold text-gray-800">Recent activity</h2>
      <div className="mt-5 space-y-5">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#2E75BD]" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.detail}</p>
              <p className="mt-1 text-xs font-medium text-gray-400">{item.time ?? item.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
