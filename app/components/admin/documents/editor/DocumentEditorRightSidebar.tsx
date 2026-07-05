import { useDocumentEditor } from "./useDocumentEditor";
import { VariableBrowserPanel } from "./VariableBrowserPanel";
import { editorPluginRegistry } from "./plugins/registry";

const TABS = [
  { id: "properties" as const, label: "Properties" },
  { id: "preview" as const, label: "Preview" },
  { id: "variables" as const, label: "Variables" },
];

export function DocumentEditorRightSidebar() {
  const {
    editorState,
    selection,
    blockTypeMetadata,
    isReadOnly,
    rightTab,
    setRightTab,
    updateBlock,
    setFocusedField,
    previewHtml,
    previewWarnings,
    previewLoading,
    previewError,
    dirtyState,
    refreshPreview,
    actionLoading,
  } = useDocumentEditor();

  const selectedBlock =
    editorState.blocks.find((block) => block.clientId === selection.selectedBlockClientId) ?? null;
  const plugin = selectedBlock
    ? editorPluginRegistry.get(selectedBlock.blockType, blockTypeMetadata[selectedBlock.blockType] ?? null)
    : null;

  return (
    <aside className="flex h-full flex-col border-l border-gray-200 bg-white">
      <div className="flex border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`flex-1 px-3 py-3 text-sm font-medium ${
              rightTab === tab.id ? "border-b-2 border-[#2E75BD] text-[#2E75BD]" : "text-gray-500"
            }`}
            onClick={() => setRightTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {rightTab === "properties" ? (
          selectedBlock && plugin ? (
            plugin.renderProperties({
              block: selectedBlock,
              document: editorState.document,
              isReadOnly,
              metadata: blockTypeMetadata[selectedBlock.blockType] ?? null,
              updateBlock,
              setFocusedField,
            })
          ) : (
            <div className="space-y-3 text-sm text-gray-600">
              <p>Select a block to edit its properties.</p>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400">Title</dt>
                  <dd>{editorState.document.title}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400">Status</dt>
                  <dd>{editorState.document.status}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400">Version</dt>
                  <dd>v{editorState.document.versionNumber} · {editorState.document.versionStatus}</dd>
                </div>
              </dl>
            </div>
          )
        ) : null}

        {rightTab === "preview" ? (
          <div className="space-y-4">
            <button
              type="button"
              className="btn border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD]"
              disabled={Boolean(actionLoading) || previewLoading}
              onClick={() => void refreshPreview()}
            >
              {previewLoading || actionLoading === "preview" ? "Rendering…" : "Refresh preview"}
            </button>
            {dirtyState.isDirty ? (
              <p className="text-sm text-amber-700">Save draft before preview to see latest changes.</p>
            ) : null}
            {previewWarnings.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700">
                {previewWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
            {previewError ? <p className="text-sm text-red-600">{previewError}</p> : null}
            {previewHtml ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                <iframe title="Document preview" className="h-[min(60vh,700px)] w-full bg-white" sandbox="" srcDoc={previewHtml} />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No preview loaded yet.</p>
            )}
          </div>
        ) : null}

        {rightTab === "variables" ? <VariableBrowserPanel /> : null}
      </div>
    </aside>
  );
}
