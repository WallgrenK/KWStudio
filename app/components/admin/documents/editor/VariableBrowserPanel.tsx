import { useMemo, useState } from "react";
import { useDocumentEditor } from "./useDocumentEditor";

export function VariableBrowserPanel() {
  const { variables, insertVariable } = useDocumentEditor();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return variables;
    return variables.filter(
      (variable) =>
        variable.key.toLowerCase().includes(normalized) ||
        variable.label.toLowerCase().includes(normalized) ||
        variable.namespace.toLowerCase().includes(normalized),
    );
  }, [query, variables]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, variable) => {
      acc[variable.namespace] = acc[variable.namespace] ?? [];
      acc[variable.namespace].push(variable);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-gray-400" htmlFor="variable-search">
          Search variables
        </label>
        <input
          id="variable-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="client.name, project.title…"
          className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <p className="text-xs text-gray-500">Focus a text field, then insert {"{{variable.key}}"} at the cursor.</p>
      {Object.entries(grouped).map(([namespace, items]) => (
        <div key={namespace}>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{namespace}</p>
          <div className="mt-2 space-y-2">
            {items.map((variable) => (
              <button
                key={variable.key}
                type="button"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left hover:border-[#2E75BD]"
                onClick={() => insertVariable(variable.key)}
              >
                <span className="block text-sm font-medium text-gray-800">{variable.label}</span>
                <span className="block text-xs text-gray-500">{`{{${variable.key}}}`}</span>
                {variable.description ? (
                  <span className="mt-1 block text-xs text-gray-400">{variable.description}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ))}
      {!filtered.length ? <p className="text-sm text-gray-500">No variables match your search.</p> : null}
    </div>
  );
}
