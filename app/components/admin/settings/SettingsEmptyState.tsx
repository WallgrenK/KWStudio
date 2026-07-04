import { SearchX } from "lucide-react";

type SettingsEmptyStateProps = {
  query: string;
};

export function SettingsEmptyState({ query }: SettingsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <SearchX className="size-10 text-gray-300" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-gray-800">No settings match your search</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        No categories or fields matched &ldquo;{query}&rdquo;. Try searching for tax, VAT, branding, or integrations.
      </p>
    </div>
  );
}
