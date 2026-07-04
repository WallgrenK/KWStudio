import { Search } from "lucide-react";

type SettingsSearchProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
};

export function SettingsSearch({ value, onChange, resultCount }: SettingsSearchProps) {
  return (
    <div className="space-y-2">
      <label className="sr-only" htmlFor="settings-search">
        Search settings
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <input
          id="settings-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search settings…"
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800"
        />
      </div>
      {value.trim() ? (
        <p className="text-xs text-gray-500">
          {resultCount === 0 ? "No matching settings" : `${resultCount} matching ${resultCount === 1 ? "category" : "categories"}`}
        </p>
      ) : null}
    </div>
  );
}
