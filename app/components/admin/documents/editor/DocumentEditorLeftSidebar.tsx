import type { DocumentBlockType } from "~/types/documents";
import { editorPluginRegistry } from "./plugins/registry";
import { useDocumentEditor } from "./useDocumentEditor";
import { DocumentEditorVersionPanel } from "./DocumentEditorVersionPanel";

export function DocumentEditorLeftSidebar() {
  const {
    editorState,
    selection,
    blockTypeMetadata,
    isReadOnly,
    selectBlock,
    insertBlock,
  } = useDocumentEditor();

  const plugins = editorPluginRegistry.list(blockTypeMetadata);
  const grouped = plugins.reduce<Record<string, typeof plugins>>((acc, plugin) => {
    acc[plugin.group] = acc[plugin.group] ?? [];
    acc[plugin.group].push(plugin);
    return acc;
  }, {});

  return (
    <aside className="flex h-full flex-col border-r border-gray-200 bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Navigator</h2>
        <div className="mt-3 max-h-56 space-y-1 overflow-y-auto">
          {editorState.blocks.length === 0 ? (
            <p className="text-sm text-gray-500">No blocks yet.</p>
          ) : (
            editorState.blocks.map((block, index) => {
              const plugin = editorPluginRegistry.get(block.blockType, blockTypeMetadata[block.blockType] ?? null);
              const summary = plugin?.getSummary(block) ?? block.blockType;
              const isSelected = selection.selectedBlockClientId === block.clientId;
              return (
                <button
                  key={block.clientId}
                  type="button"
                  className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                    isSelected ? "bg-[#eff6ff] text-kw-brand" : "text-gray-700 hover:bg-white"
                  }`}
                  onClick={() => selectBlock(block.clientId)}
                >
                  <span className="mt-0.5 text-xs text-gray-400">{index + 1}</span>
                  <span>
                    <span className="block font-medium">{plugin?.label ?? block.blockType}</span>
                    <span className="block truncate text-xs text-gray-500">{summary}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {!isReadOnly ? (
        <div className="border-b border-gray-200 px-4 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Add block</h2>
          <div className="mt-3 space-y-3">
            {Object.entries(grouped).map(([group, groupPlugins]) => (
              <div key={group}>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{group}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {groupPlugins.map((plugin) => (
                    <button
                      key={plugin.blockType}
                      type="button"
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:border-kw-brand"
                      onClick={() => insertBlock(plugin.blockType as DocumentBlockType)}
                    >
                      {plugin.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Document</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Reference</dt>
            <dd className="text-gray-800">{editorState.document.referenceNumber ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Currency</dt>
            <dd className="text-gray-800">{editorState.document.currency}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Blocks</dt>
            <dd className="text-gray-800">{editorState.blocks.length}</dd>
          </div>
        </dl>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <DocumentEditorVersionPanel />
      </div>
    </aside>
  );
}
