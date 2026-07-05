import { useCallback, useEffect, useState } from "react";
import { listAdminProjectAssetFolders, listAdminProjectAssets } from "~/services/assetsApi";
import type { AssetDto } from "~/types/assets";
import { createEditorBlock, readString, truncateSummary } from "./shared";
import type { EditorPlugin } from "./types";

function AssetPicker({
  projectId,
  selectedAssetId,
  disabled,
  onSelect,
}: {
  projectId: string | null;
  selectedAssetId: string;
  disabled: boolean;
  onSelect: (asset: AssetDto) => void;
}) {
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    if (!projectId) {
      setAssets([]);
      return;
    }
    setLoading(true);
    setError(null);
    const foldersResult = await listAdminProjectAssetFolders(projectId);
    if (!foldersResult.ok || !foldersResult.data?.folders.length) {
      setError(foldersResult.error ?? "No asset folders found for this project.");
      setAssets([]);
      setLoading(false);
      return;
    }
    const folderId = foldersResult.data.folders[0]?.id;
    const assetsResult = await listAdminProjectAssets(projectId, folderId);
    if (assetsResult.ok && assetsResult.data) {
      setAssets(assetsResult.data.assets);
    } else {
      setError(assetsResult.error ?? "Could not load project assets.");
      setAssets([]);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  if (!projectId) {
    return <p className="text-sm text-gray-500">Link a project to this document to pick assets.</p>;
  }

  return (
    <div className="space-y-2">
      {loading ? <p className="text-sm text-gray-500">Loading assets…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && assets.length === 0 ? (
        <p className="text-sm text-gray-500">No assets available in the default folder.</p>
      ) : null}
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            disabled={disabled}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
              selectedAssetId === asset.id
                ? "border-kw-brand bg-[#eff6ff] text-kw-brand"
                : "border-gray-200 bg-white text-gray-700 hover:border-kw-brand"
            }`}
            onClick={() => onSelect(asset)}
          >
            <span>{asset.title}</span>
            <span className="text-xs text-gray-400">{asset.currentVersion?.mimeType ?? asset.assetType}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export const imagePlugin: EditorPlugin = {
  blockType: "image",
  label: "Image",
  icon: "image",
  group: "media",
  order: 70,
  createDefaultBlock: (sortOrder) =>
    createEditorBlock("image", sortOrder, { src: "", alt: "", caption: "" }, { alignment: "center" }),
  renderEditor: ({ block, document, isReadOnly, updateBlock }) => {
    const src = readString(block.content.src);
    const alignment = readString(block.settings.alignment, "center");
    return (
      <div className="space-y-3">
        {src ? (
          <img
            src={src}
            alt={readString(block.content.alt, "Document image")}
            className={`max-h-64 rounded-xl border border-gray-200 object-contain ${
              alignment === "left" ? "mr-auto" : alignment === "right" ? "ml-auto" : "mx-auto"
            }`}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
            Select an asset in Properties to attach an image.
          </div>
        )}
        {!isReadOnly ? (
          <p className="text-xs text-gray-400">
            Asset ID: {typeof block.settings.assetId === "string" ? block.settings.assetId : "None"} · Save draft to resolve URL.
          </p>
        ) : null}
        {!document.projectId ? (
          <p className="text-xs text-amber-700">Document has no project — asset picker unavailable.</p>
        ) : null}
      </div>
    );
  },
  renderToolbar: () => null,
  renderProperties: ({ block, document, isReadOnly, updateBlock }) => (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Alignment</span>
        <select
          disabled={isReadOnly}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          value={readString(block.settings.alignment, "center")}
          onChange={(event) =>
            updateBlock(block.clientId, { settings: { ...block.settings, alignment: event.target.value } })
          }
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Alt text</span>
        <input
          type="text"
          readOnly={isReadOnly}
          value={readString(block.content.alt)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          onChange={(event) =>
            updateBlock(block.clientId, { content: { ...block.content, alt: event.target.value } })
          }
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Caption</span>
        <input
          type="text"
          readOnly={isReadOnly}
          value={readString(block.content.caption)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          onChange={(event) =>
            updateBlock(block.clientId, { content: { ...block.content, caption: event.target.value } })
          }
        />
      </label>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Project asset</p>
        <AssetPicker
          projectId={document.projectId}
          selectedAssetId={typeof block.settings.assetId === "string" ? block.settings.assetId : ""}
          disabled={isReadOnly}
          onSelect={(asset) =>
            updateBlock(block.clientId, {
              settings: { ...block.settings, assetId: asset.id },
              content: { ...block.content, alt: block.content.alt || asset.title },
            })
          }
        />
      </div>
    </div>
  ),
  getSummary: (block) => truncateSummary(readString(block.content.caption, readString(block.content.alt, "Image"))),
  validateClientSide: (block) => {
    const errors: string[] = [];
    if (typeof block.content.src !== "undefined" && typeof block.content.src !== "string") {
      errors.push("Image src must be a string.");
    }
    return errors;
  },
};
