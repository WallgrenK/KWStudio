type DocumentPreviewPanelProps = {
  html: string | null;
  loading: boolean;
  error: string | null;
  warnings: string[];
};

export function DocumentPreviewPanel({ html, loading, error, warnings }: DocumentPreviewPanelProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" aria-label="Document preview">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
          <p className="mt-1 text-sm text-gray-500">Rendered HTML from the document engine.</p>
        </div>
      </div>

      {warnings.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">Preview warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {loading ? <p className="mt-5 text-sm text-gray-500">Loading preview…</p> : null}
      {error ? (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {!loading && !error && !html ? (
        <div className="mt-5 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          No preview available.
        </div>
      ) : null}

      {html ? (
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          <iframe
            title="Document HTML preview"
            className="h-[min(70vh,900px)] w-full bg-white"
            sandbox=""
            srcDoc={html}
          />
        </div>
      ) : null}
    </section>
  );
}
