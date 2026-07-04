import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { SettingsDangerZone } from "./SettingsDangerZone";
import { SettingsEmptyState } from "./SettingsEmptyState";
import { SettingsHeaderActions } from "./SettingsHeaderActions";
import { SettingsProvider } from "./SettingsContext";
import { SettingsSearch } from "./SettingsSearch";
import { SettingsSidebar } from "./SettingsSidebar";
import { searchSettingsCategories, SETTINGS_CATEGORIES } from "./settingsRegistry";
import type { SettingsCategoryId, SettingsLocationState } from "./settingsTypes";

export function SettingsShell() {
  const location = useLocation();
  const locationState = location.state as SettingsLocationState | null;
  const initialCategory = locationState?.category ?? SETTINGS_CATEGORIES[0]?.id ?? "workspace";

  const [activeCategoryId, setActiveCategoryId] = useState<SettingsCategoryId>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (locationState?.category) {
      setActiveCategoryId(locationState.category);
    }
  }, [locationState?.category]);

  const searchResult = useMemo(
    () => searchSettingsCategories(searchQuery),
    [searchQuery],
  );

  const visibleCategories = searchQuery.trim() ? searchResult.categories : SETTINGS_CATEGORIES;
  const activeCategory = visibleCategories.find((category) => category.id === activeCategoryId)
    ?? visibleCategories[0]
    ?? SETTINGS_CATEGORIES[0];

  useEffect(() => {
    if (activeCategory && activeCategory.id !== activeCategoryId) {
      setActiveCategoryId(activeCategory.id);
    }
  }, [activeCategory, activeCategoryId]);

  const ActiveComponent = activeCategory?.Component;

  return (
    <SettingsProvider searchQuery={searchQuery} matchedLabels={searchResult.matchedLabels}>
      <AdminShell
        title="Settings"
        description="Profile, company, brand and workspace preferences for KWStudio admin."
        action={<SettingsHeaderActions />}
      >
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <SettingsSearch
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={visibleCategories.length}
            />
            <div className="rounded-2xl border border-gray-200 bg-white p-3">
              <SettingsSidebar
                categories={visibleCategories}
                activeCategoryId={activeCategory?.id ?? activeCategoryId}
                onSelect={(categoryId) => setActiveCategoryId(categoryId as SettingsCategoryId)}
              />
            </div>
          </aside>

          <div className="space-y-6">
            {searchQuery.trim() && visibleCategories.length === 0 ? (
              <SettingsEmptyState query={searchQuery} />
            ) : ActiveComponent ? (
              <ActiveComponent />
            ) : null}
            <SettingsDangerZone />
          </div>
        </div>
      </AdminShell>
    </SettingsProvider>
  );
}
