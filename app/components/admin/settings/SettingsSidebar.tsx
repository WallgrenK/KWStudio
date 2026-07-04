import type { SettingsCategoryDefinition } from "./settingsTypes";
import { SettingsStatusBadge } from "./SettingsStatusBadge";

type SettingsSidebarProps = {
  categories: SettingsCategoryDefinition[];
  activeCategoryId: string;
  onSelect: (categoryId: string) => void;
};

export function SettingsSidebar({ categories, activeCategoryId, onSelect }: SettingsSidebarProps) {
  return (
    <nav aria-label="Settings categories" className="space-y-1">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = category.id === activeCategoryId;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
              isActive
                ? "bg-[#eff6ff] text-[#2E75BD]"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{category.title}</span>
                <span className="block truncate text-xs text-gray-500">{category.description}</span>
              </span>
            </span>
            {category.defaultStatus ? (
              <SettingsStatusBadge status={category.defaultStatus} />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
