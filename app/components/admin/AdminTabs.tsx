type AdminTab = {
  id: string;
  label: string;
};

type AdminTabsProps<T extends AdminTab> = {
  tabs: readonly T[];
  activeTab: T["id"];
  onChange: (tabId: T["id"]) => void;
};

export function AdminTabs<T extends AdminTab>({ tabs, activeTab, onChange }: AdminTabsProps<T>) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="max-w-full overflow-x-auto">
        <div className="flex min-w-max gap-1 p-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#2E75BD] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                type="button"
                onClick={() => onChange(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
