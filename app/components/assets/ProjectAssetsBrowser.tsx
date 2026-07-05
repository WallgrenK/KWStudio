import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatusBadge } from "~/components/admin/StatusBadge";
import {
  addAdminAssetComment,
  addPortalAssetComment,
  archiveAdminProjectAsset,
  deleteAdminProjectAsset,
  downloadAdminAsset,
  downloadPortalAsset,
  formatAssetSize,
  isAssetsApiConfigured,
  listAdminAssetComments,
  listAdminAssetHistory,
  listAdminProjectAssetFolders,
  listAdminProjectAssets,
  listPortalAssetComments,
  listPortalAssetHistory,
  listPortalProjectAssetFolders,
  listPortalProjectAssets,
  moveAdminProjectAsset,
  renameAdminProjectAsset,
  replaceAdminProjectAsset,
  replacePortalProjectAsset,
  uploadAdminProjectAsset,
  uploadPortalProjectAsset,
} from "~/services/assetsApi";
import type {
  AssetCommentDto,
  AssetDto,
  AssetFolderDto,
  AssetRequestDto,
  AssetVersionDto,
} from "~/types/assets";

type ProjectAssetsBrowserProps = {
  projectId: string;
  mode: "portal" | "admin";
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProjectAssetsBrowser({ projectId, mode }: ProjectAssetsBrowserProps) {
  const isAdmin = mode === "admin";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [folders, setFolders] = useState<AssetFolderDto[]>([]);
  const [requests, setRequests] = useState<AssetRequestDto[]>([]);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetDto | null>(null);
  const [versions, setVersions] = useState<AssetVersionDto[]>([]);
  const [comments, setComments] = useState<AssetCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadRequestId, setUploadRequestId] = useState<string | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [renameTitle, setRenameTitle] = useState("");
  const [moveFolderId, setMoveFolderId] = useState("");

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) ?? folders[0] ?? null,
    [folders, selectedFolderId],
  );

  const folderRequests = useMemo(
    () => requests.filter((request) => request.status === "pending" && request.folderId === selectedFolder?.id),
    [requests, selectedFolder?.id],
  );

  const loadFolders = useCallback(async () => {
    const result = isAdmin
      ? await listAdminProjectAssetFolders(projectId)
      : await listPortalProjectAssetFolders(projectId);

    if (result.ok && result.data) {
      setFolders(result.data.folders);
      setRequests(result.data.requests);
      setSelectedFolderId((current) => current ?? result.data!.folders[0]?.id ?? null);
    } else {
      setError(result.error ?? "Could not load folders.");
    }
  }, [isAdmin, projectId]);

  const loadAssets = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      setAssets([]);
      return;
    }

    const result = isAdmin
      ? await listAdminProjectAssets(projectId, folderId)
      : await listPortalProjectAssets(projectId, folderId);

    if (result.ok && result.data) {
      setAssets(result.data.assets);
    } else {
      setError(result.error ?? "Could not load assets.");
    }
  }, [isAdmin, projectId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    await loadFolders();
    setLoading(false);
  }, [loadFolders]);

  useEffect(() => {
    if (!isAssetsApiConfigured) {
      setLoading(false);
      setError("Assets API is not configured.");
      return;
    }
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedFolder?.id) return;
    void loadAssets(selectedFolder.id);
  }, [loadAssets, selectedFolder?.id]);

  const loadAssetDetail = useCallback(async (asset: AssetDto) => {
    setSelectedAsset(asset);
    setRenameTitle(asset.title);
    setMoveFolderId(asset.folderId);

    const historyResult = isAdmin
      ? await listAdminAssetHistory(projectId, asset.id)
      : await listPortalAssetHistory(projectId, asset.id);
    if (historyResult.ok && historyResult.data) {
      setVersions(historyResult.data.versions);
    }

    const commentsResult = isAdmin
      ? await listAdminAssetComments(projectId, asset.id)
      : await listPortalAssetComments(projectId, asset.id);
    if (commentsResult.ok && commentsResult.data) {
      setComments(commentsResult.data.comments);
    }
  }, [isAdmin, projectId]);

  const handleUploadClick = (requestId?: string | null) => {
    setUploadRequestId(requestId ?? null);
    setReplaceMode(false);
    fileInputRef.current?.click();
  };

  const handleReplaceClick = () => {
    setReplaceMode(true);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedFolder) return;

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      if (replaceMode && selectedAsset) {
        const result = isAdmin
          ? await replaceAdminProjectAsset(projectId, selectedAsset.id, { file, changeNote: changeNote || undefined })
          : await replacePortalProjectAsset(projectId, selectedAsset.id, { file, changeNote: changeNote || undefined });

        if (!result.ok || !result.data) {
          setError(result.error ?? "Replace failed.");
        } else {
          setMessage("File replaced.");
          setChangeNote("");
          await loadAssets(selectedFolder.id);
          await loadAssetDetail(result.data.asset);
        }
      } else {
        const result = isAdmin
          ? await uploadAdminProjectAsset(projectId, {
              folderId: selectedFolder.id,
              file,
              requestId: uploadRequestId ?? undefined,
            })
          : await uploadPortalProjectAsset(projectId, {
              folderId: selectedFolder.id,
              file,
              requestId: uploadRequestId ?? undefined,
            });

        if (!result.ok || !result.data) {
          setError(result.error ?? "Upload failed.");
        } else {
          setMessage("File uploaded.");
          setUploadRequestId(null);
          await loadFolders();
          await loadAssets(selectedFolder.id);
          await loadAssetDetail(result.data.asset);
        }
      }
    } finally {
      setBusy(false);
      setReplaceMode(false);
    }
  };

  const handleDownload = async (asset: AssetDto) => {
    const fileName = asset.currentVersion?.fileName ?? asset.title;
    const result = isAdmin
      ? await downloadAdminAsset(projectId, asset.id, fileName)
      : await downloadPortalAsset(projectId, asset.id, fileName);
    if (!result.ok) setError(result.error ?? "Download failed.");
  };

  const handleAddComment = async () => {
    if (!selectedAsset || !commentBody.trim()) return;
    setBusy(true);
    const result = isAdmin
      ? await addAdminAssetComment(projectId, selectedAsset.id, commentBody.trim())
      : await addPortalAssetComment(projectId, selectedAsset.id, commentBody.trim());
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not add comment.");
      return;
    }
    setCommentBody("");
    await loadAssetDetail(selectedAsset);
  };

  const handleRename = async () => {
    if (!selectedAsset || !isAdmin) return;
    setBusy(true);
    const result = await renameAdminProjectAsset(projectId, selectedAsset.id, renameTitle);
    setBusy(false);
    if (!result.ok || !result.data) {
      setError(result.error ?? "Rename failed.");
      return;
    }
    setMessage("Asset renamed.");
    if (selectedFolder) await loadAssets(selectedFolder.id);
    await loadAssetDetail(result.data.asset);
  };

  const handleMove = async () => {
    if (!selectedAsset || !isAdmin || !moveFolderId) return;
    setBusy(true);
    const result = await moveAdminProjectAsset(projectId, selectedAsset.id, moveFolderId);
    setBusy(false);
    if (!result.ok || !result.data) {
      setError(result.error ?? "Move failed.");
      return;
    }
    setMessage("Asset moved.");
    await loadFolders();
    await loadAssets(selectedFolder?.id ?? moveFolderId);
    await loadAssetDetail(result.data.asset);
  };

  const handleArchive = async () => {
    if (!selectedAsset || !isAdmin) return;
    setBusy(true);
    const result = await archiveAdminProjectAsset(projectId, selectedAsset.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Archive failed.");
      return;
    }
    setMessage("Asset archived.");
    setSelectedAsset(null);
    if (selectedFolder) await loadAssets(selectedFolder.id);
  };

  const handleDelete = async () => {
    if (!selectedAsset || !isAdmin) return;
    setBusy(true);
    const result = await deleteAdminProjectAsset(projectId, selectedAsset.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Delete failed.");
      return;
    }
    setMessage("Asset deleted.");
    setSelectedAsset(null);
    if (selectedFolder) await loadAssets(selectedFolder.id);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading assets…</p>;
  }

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}

      <div className="grid gap-4 lg:grid-cols-[220px_1fr_320px]">
        <aside className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Folders</p>
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => {
                setSelectedFolderId(folder.id);
                setSelectedAsset(null);
              }}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selectedFolder?.id === folder.id
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">{folder.name}</span>
              {folder.icon ? <span className="ml-2 text-xs opacity-70">{folder.icon}</span> : null}
            </button>
          ))}
        </aside>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{selectedFolder?.name ?? "Assets"}</h3>
              {folderRequests.length > 0 ? (
                <p className="mt-1 text-sm text-amber-700">
                  {folderRequests.length} pending upload request{folderRequests.length === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !selectedFolder}
              onClick={() => handleUploadClick(folderRequests[0]?.id)}
            >
              Upload file
            </button>
          </div>

          {folderRequests.map((request) => (
            <div key={request.id} className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <p className="font-medium text-amber-900">{request.title}</p>
              {request.description ? <p className="text-amber-800">{request.description}</p> : null}
              <button
                type="button"
                className="mt-2 text-sm font-medium text-amber-900 underline"
                onClick={() => handleUploadClick(request.id)}
              >
                Upload for this request
              </button>
            </div>
          ))}

          {assets.length === 0 ? (
            <p className="text-sm text-gray-500">No files in this folder yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">Updated</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                        selectedAsset?.id === asset.id ? "bg-gray-50" : ""
                      }`}
                      onClick={() => void loadAssetDetail(asset)}
                    >
                      <td className="py-2 pr-4 font-medium text-gray-900">{asset.title}</td>
                      <td className="py-2 pr-4 capitalize text-gray-600">{asset.assetType}</td>
                      <td className="py-2 pr-4 text-gray-600">
                        {asset.currentVersion ? formatAssetSize(asset.currentVersion.sizeBytes) : "—"}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{formatDate(asset.updatedAt)}</td>
                      <td className="py-2"><StatusBadge status={asset.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-xl border border-gray-200 bg-white p-4">
          {!selectedAsset ? (
            <p className="text-sm text-gray-500">Select an asset to view details.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{selectedAsset.title}</h3>
                {selectedAsset.description ? <p className="mt-1 text-sm text-gray-600">{selectedAsset.description}</p> : null}
              </div>

              {selectedAsset.currentVersion?.mimeType.startsWith("image/") ? (
                <p className="text-xs text-gray-500">Image preview available after download.</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void handleDownload(selectedAsset)}>
                  Download
                </button>
                <button type="button" className="btn btn-secondary" disabled={busy} onClick={handleReplaceClick}>
                  Replace
                </button>
              </div>

              {replaceMode || selectedAsset ? (
                <label className="block text-sm">
                  <span className="text-gray-600">Change note (replace)</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                    value={changeNote}
                    onChange={(event) => setChangeNote(event.target.value)}
                    placeholder="Updated logo"
                  />
                </label>
              ) : null}

              {isAdmin ? (
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  <label className="block text-sm">
                    <span className="text-gray-600">Rename</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      value={renameTitle}
                      onChange={(event) => setRenameTitle(event.target.value)}
                    />
                  </label>
                  <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void handleRename()}>
                    Rename
                  </button>

                  <label className="block text-sm">
                    <span className="text-gray-600">Move to folder</span>
                    <select
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2"
                      value={moveFolderId}
                      onChange={(event) => setMoveFolderId(event.target.value)}
                    >
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void handleMove()}>
                    Move
                  </button>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => void handleArchive()}>
                      Archive
                    </button>
                    <button type="button" className="btn btn-secondary text-red-700" disabled={busy} onClick={() => void handleDelete()}>
                      Delete
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-sm font-semibold text-gray-900">Version history</h4>
                {versions.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">No versions.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {versions.map((version) => (
                      <li key={version.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                        <p className="font-medium text-gray-900">v{version.version} · {version.fileName}</p>
                        <p className="text-gray-600">{formatDate(version.uploadedAt)} · {formatAssetSize(version.sizeBytes)}</p>
                        {version.changeNote ? <p className="text-gray-700">{version.changeNote}</p> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-sm font-semibold text-gray-900">Comments</h4>
                <ul className="mt-2 space-y-2">
                  {comments.map((comment) => (
                    <li key={comment.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800">
                      {comment.body}
                      <p className="mt-1 text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </li>
                  ))}
                </ul>
                <textarea
                  className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Add a comment"
                />
                <button type="button" className="btn btn-secondary mt-2" disabled={busy} onClick={() => void handleAddComment()}>
                  Post comment
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
