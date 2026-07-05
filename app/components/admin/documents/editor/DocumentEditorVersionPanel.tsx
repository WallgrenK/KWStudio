import { StatusBadge } from "~/components/admin/StatusBadge";
import { useDocumentEditor } from "./useDocumentEditor";

export function DocumentEditorVersionPanel() {
  const {
    editorState,
    versions,
    isReadOnly,
    actionLoading,
    loadVersion,
    createDraftVersion,
    createNewVersion,
    discardDraftVersion,
  } = useDocumentEditor();

  const currentVersionId = editorState.document.versionId;
  const hasDraft = versions.some((version) => version.status === "draft");
  const canEditCurrent = !isReadOnly;

  return (
    <section aria-label="Version panel">
      <h2 className="text-sm font-semibold text-gray-800">Versions</h2>
      <p className="mt-1 text-xs text-gray-500">Switch versions or create a new draft.</p>

      <div className="mt-3 space-y-2">
        {versions.map((version) => {
          const isCurrent = version.id === currentVersionId;
          return (
            <button
              key={version.id}
              type="button"
              className={`w-full rounded-xl border px-3 py-2 text-left ${
                isCurrent ? "border-kw-brand bg-[#eff6ff]" : "border-gray-200 bg-white hover:border-kw-brand"
              }`}
              onClick={() => void loadVersion(version.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-800">v{version.version_number}</span>
                <StatusBadge status={version.status} />
              </div>
              {version.status === "published" ? (
                <p className="mt-1 text-xs text-gray-500">Immutable snapshot</p>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {!hasDraft && !isReadOnly ? (
          <button
            type="button"
            className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
            disabled={Boolean(actionLoading)}
            onClick={() => void createDraftVersion()}
          >
            {actionLoading === "create-draft" ? "Creating…" : "Create draft"}
          </button>
        ) : null}
        <button
          type="button"
          className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
          disabled={Boolean(actionLoading)}
          onClick={() => void createNewVersion()}
        >
          {actionLoading === "new-version" ? "Creating…" : "Create new version"}
        </button>
        {canEditCurrent && editorState.document.versionStatus === "draft" ? (
          <button
            type="button"
            className="btn border border-red-200 bg-white text-red-700 hover:border-red-400"
            disabled={Boolean(actionLoading)}
            onClick={() => void discardDraftVersion()}
          >
            {actionLoading === "discard-draft" ? "Discarding…" : "Discard draft"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
