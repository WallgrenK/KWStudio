import { Link } from "react-router";
import { StatusBadge } from "~/components/admin/StatusBadge";
import { useDocumentEditor } from "./useDocumentEditor";

export function DocumentEditorToolbar() {
  const {
    editorState,
    dirtyState,
    isReadOnly,
    validationState,
    actionLoading,
    actionMessage,
    saveDraft,
    discardChanges,
    publish,
    validateServer,
  } = useDocumentEditor();

  const clientErrorCount = Object.values(validationState.clientErrors).flat().length;

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={editorState.document.status} />
            <StatusBadge status={editorState.document.versionStatus} />
            {editorState.document.isReadOnly ? (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {editorState.document.status === "signed"
                  ? "Signed"
                  : editorState.document.versionStatus === "published"
                    ? "Immutable"
                    : "Read-only"}
              </span>
            ) : null}
            {dirtyState.isDirty ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                Unsaved changes
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 truncate text-xl font-semibold text-gray-900">{editorState.document.title}</h1>
          <p className="text-sm text-gray-500">
            Version v{editorState.document.versionNumber}
            {dirtyState.lastSavedAt
              ? ` · Saved ${new Date(dirtyState.lastSavedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
            to={`/admin/documents/${editorState.document.id}`}
          >
            Back to detail
          </Link>
          {!isReadOnly ? (
            <>
              <button
                type="button"
                className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
                disabled={Boolean(actionLoading) || !dirtyState.isDirty}
                onClick={() => void discardChanges()}
              >
                Discard changes
              </button>
              <button
                type="button"
                className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
                disabled={Boolean(actionLoading)}
                onClick={() => void validateServer()}
              >
                {actionLoading === "validate" ? "Validating…" : "Validate"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={Boolean(actionLoading)}
                onClick={() => void saveDraft()}
              >
                {actionLoading === "save" ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={Boolean(actionLoading) || dirtyState.isDirty}
                onClick={() => void publish()}
              >
                {actionLoading === "publish" ? "Publishing…" : "Publish"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {actionMessage ? (
        <p className="mt-3 text-sm text-gray-600">{actionMessage}</p>
      ) : null}
      {clientErrorCount > 0 ? (
        <p className="mt-2 text-sm text-red-600">{clientErrorCount} client validation issue(s).</p>
      ) : null}
      {validationState.serverErrors.length > 0 ? (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {validationState.serverErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
      {validationState.serverWarnings.length > 0 ? (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {validationState.serverWarnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
