import { StatusBadge } from "~/components/admin/StatusBadge";
import type { DocumentVersionDto } from "~/types/documents";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DocumentVersionPanelProps = {
  versions: DocumentVersionDto[];
  activeVersionId: string | null;
  selectedVersionId: string | null;
  onSelectVersion: (versionId: string) => void;
  onPublish: (versionId: string) => void;
  onCreateNewVersion: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onCancel: () => void;
  onRefreshPreview: () => void;
  actionLoading: string | null;
  documentStatus: string;
};

export function DocumentVersionPanel({
  versions,
  activeVersionId,
  selectedVersionId,
  onSelectVersion,
  onPublish,
  onCreateNewVersion,
  onDuplicate,
  onArchive,
  onCancel,
  onRefreshPreview,
  actionLoading,
  documentStatus,
}: DocumentVersionPanelProps) {
  const selectedVersion = versions.find((version) => version.id === selectedVersionId) ?? null;
  const canPublish = selectedVersion?.status === "draft" && documentStatus !== "archived" && documentStatus !== "cancelled";
  const isMutable = documentStatus !== "archived" && documentStatus !== "cancelled";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Versions</h2>
          <p className="mt-1 text-sm text-gray-500">Manage published snapshots and draft revisions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPublish ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={Boolean(actionLoading)}
              onClick={() => selectedVersion && onPublish(selectedVersion.id)}
            >
              {actionLoading === "publish" ? "Publishing…" : "Publish"}
            </button>
          ) : null}
          {isMutable ? (
            <button
              type="button"
              className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
              disabled={Boolean(actionLoading)}
              onClick={onCreateNewVersion}
            >
              {actionLoading === "new-version" ? "Creating…" : "Create new version"}
            </button>
          ) : null}
          <button
            type="button"
            className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
            disabled={Boolean(actionLoading)}
            onClick={onDuplicate}
          >
            {actionLoading === "duplicate" ? "Duplicating…" : "Duplicate"}
          </button>
          {documentStatus !== "archived" ? (
            <button
              type="button"
              className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
              disabled={Boolean(actionLoading)}
              onClick={onArchive}
            >
              {actionLoading === "archive" ? "Archiving…" : "Archive"}
            </button>
          ) : null}
          {documentStatus !== "cancelled" ? (
            <button
              type="button"
              className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
              disabled={Boolean(actionLoading)}
              onClick={onCancel}
            >
              {actionLoading === "cancel" ? "Cancelling…" : "Cancel"}
            </button>
          ) : null}
          <button
            type="button"
            className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
            disabled={Boolean(actionLoading) || !selectedVersionId}
            onClick={onRefreshPreview}
          >
            {actionLoading === "refresh-preview" ? "Refreshing…" : "Refresh preview"}
          </button>
        </div>
      </div>

      {!versions.length ? (
        <p className="mt-5 text-sm text-gray-500">No versions.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Created by</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => {
                const isActive = version.id === activeVersionId;
                const isSelected = version.id === selectedVersionId;
                return (
                  <tr
                    key={version.id}
                    className={`cursor-pointer border-b border-gray-50 transition hover:bg-gray-50 ${
                      isSelected ? "bg-[#eff6ff]" : ""
                    }`}
                    onClick={() => onSelectVersion(version.id)}
                  >
                    <td className="px-3 py-3 font-medium text-gray-800">
                      v{version.version_number}
                      {isActive ? (
                        <span className="ml-2 rounded-full bg-kw-brand px-2 py-0.5 text-xs font-semibold text-white">
                          Active
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={version.status} />
                        {version.status === "published" ? (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            Immutable
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{formatDate(version.published_at)}</td>
                    <td className="px-3 py-3 text-gray-600">{formatDate(version.created_at)}</td>
                    <td className="px-3 py-3 text-gray-500">{version.created_by ? "User" : "System"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
