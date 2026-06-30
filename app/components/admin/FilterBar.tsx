type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

type FilterBarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
};

export function FilterBar({ search, onSearchChange, searchPlaceholder = "Search", filters = [] }: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      {onSearchChange ? (
        <input
          className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10 sm:max-w-sm"
          type="search"
          value={search ?? ""}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
        />
      ) : (
        <div />
      )}
      {filters.length > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {filters.map((filter) => (
            <label key={filter.label} className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              <span className="sr-only">{filter.label}</span>
              <select
                className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10"
                value={filter.value}
                onChange={(event) => filter.onChange(event.target.value)}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
