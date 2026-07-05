import { editorPluginRegistry } from "./plugins/registry";
import { useDocumentEditor } from "./useDocumentEditor";
import { DocumentBlockChrome } from "./DocumentBlockChrome";

export function DocumentEditorCanvas() {
  const {
    editorState,
    selection,
    validationState,
    blockTypeMetadata,
    isReadOnly,
    selectBlock,
    hoverBlock,
    updateBlock,
    setFocusedField,
  } = useDocumentEditor();

  if (editorState.blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">Start building your document</h2>
          <p className="mt-2 text-sm text-gray-500">
            {isReadOnly
              ? "This version is read-only."
              : "Add blocks from the left sidebar to compose your draft."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-6">
      {editorState.blocks.map((block, index) => {
        const metadata = blockTypeMetadata[block.blockType] ?? null;
        const plugin = editorPluginRegistry.get(block.blockType, metadata);
        if (!plugin) return null;

        const isSelected = selection.selectedBlockClientId === block.clientId;
        const errors = validationState.clientErrors[block.clientId] ?? [];

        const renderContext = {
          block,
          document: editorState.document,
          isReadOnly,
          metadata,
          updateBlock,
          setFocusedField,
        };

        return (
          <div
            key={block.clientId}
            className={`rounded-2xl border bg-white transition ${
              isSelected ? "border-[#2E75BD] shadow-sm" : "border-gray-200 hover:border-gray-300"
            }`}
            onMouseEnter={() => hoverBlock(block.clientId)}
            onMouseLeave={() => hoverBlock(null)}
            onClick={() => selectBlock(block.clientId)}
          >
            <DocumentBlockChrome block={block} index={index} plugin={plugin} />
            {!block.collapsed ? (
              <div className="border-t border-gray-100 px-4 py-4">
                {plugin.renderEditor(renderContext)}
                {errors.length ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-600">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
