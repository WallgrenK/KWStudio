import type { EditorBlock } from "~/types/documentEditor";
import type { EditorPlugin } from "./plugins/types";
import { useDocumentEditor } from "./useDocumentEditor";

type DocumentBlockChromeProps = {
  block: EditorBlock;
  index: number;
  plugin: EditorPlugin;
};

export function DocumentBlockChrome({ block, index, plugin }: DocumentBlockChromeProps) {
  const {
    editorState,
    blockTypeMetadata,
    isReadOnly,
    updateBlock,
    setFocusedField,
    duplicateBlock,
    deleteBlock,
    moveBlockUp,
    moveBlockDown,
    toggleCollapse,
    copyBlock,
    pasteBlock,
    insertBlock,
  } = useDocumentEditor();

  const metadata = blockTypeMetadata[block.blockType] ?? null;
  const toolbar = plugin.renderToolbar({
    block,
    document: editorState.document,
    isReadOnly,
    metadata,
    updateBlock,
    setFocusedField,
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-gray-800">{plugin.label}</span>
        {block.collapsed ? <span className="text-xs text-gray-400">Collapsed</span> : null}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {toolbar}
        {!isReadOnly ? (
          <>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={(event) => { event.stopPropagation(); insertBlock(block.blockType, index); }}>Above</button>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={(event) => { event.stopPropagation(); insertBlock(block.blockType, index + 1); }}>Below</button>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={(event) => { event.stopPropagation(); moveBlockUp(block.clientId); }}>Up</button>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={(event) => { event.stopPropagation(); moveBlockDown(block.clientId); }}>Down</button>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={(event) => { event.stopPropagation(); duplicateBlock(block.clientId); }}>Duplicate</button>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={(event) => { event.stopPropagation(); copyBlock(block.clientId); }}>Copy</button>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={(event) => { event.stopPropagation(); pasteBlock(index + 1); }}>Paste</button>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100" onClick={(event) => { event.stopPropagation(); toggleCollapse(block.clientId); }}>{block.collapsed ? "Expand" : "Collapse"}</button>
            <button type="button" className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={(event) => { event.stopPropagation(); deleteBlock(block.clientId); }}>Delete</button>
          </>
        ) : null}
      </div>
    </div>
  );
}
