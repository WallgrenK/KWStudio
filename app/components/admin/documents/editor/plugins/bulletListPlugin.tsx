import { createEditorBlock, readString, truncateSummary } from "./shared";
import type { EditorPlugin } from "./types";

function readItems(content: Record<string, unknown>): string[] {
  const value = content.items;
  if (!Array.isArray(value)) return ["Item 1"];
  return value.map((item) => (typeof item === "string" ? item : "")).filter(Boolean);
}

export const bulletListPlugin: EditorPlugin = {
  blockType: "bullet_list",
  label: "Bullet list",
  icon: "list",
  group: "text",
  order: 30,
  createDefaultBlock: (sortOrder) => createEditorBlock("bullet_list", sortOrder, { items: ["Item 1"] }),
  renderEditor: ({ block, isReadOnly, updateBlock }) => {
    const items = readItems(block.content);

    function updateItems(nextItems: string[]) {
      updateBlock(block.clientId, { content: { ...block.content, items: nextItems } });
    }

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${block.clientId}-${index}`} className="flex items-center gap-2">
            <span className="text-gray-400">•</span>
            <input
              type="text"
              readOnly={isReadOnly}
              value={item}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              onChange={(event) => {
                const next = [...items];
                next[index] = event.target.value;
                updateItems(next);
              }}
            />
            {!isReadOnly ? (
              <button
                type="button"
                className="text-xs text-red-600 hover:underline"
                onClick={() => updateItems(items.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
        {!isReadOnly ? (
          <button
            type="button"
            className="text-sm text-[#2E75BD] hover:underline"
            onClick={() => updateItems([...items, "New item"])}
          >
            Add item
          </button>
        ) : null}
      </div>
    );
  },
  renderToolbar: () => null,
  renderProperties: ({ block, isReadOnly, updateBlock }) => {
    const items = readItems(block.content);
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Items</p>
        {items.map((item, index) => (
          <input
            key={`${block.clientId}-prop-${index}`}
            type="text"
            readOnly={isReadOnly}
            value={item}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            onChange={(event) => {
              const next = [...items];
              next[index] = event.target.value;
              updateBlock(block.clientId, { content: { ...block.content, items: next } });
            }}
          />
        ))}
      </div>
    );
  },
  getSummary: (block) => {
    const items = readItems(block.content);
    return truncateSummary(items.join(", "));
  },
  validateClientSide: (block) => {
    const items = readItems(block.content).filter((item) => item.trim());
    return items.length ? [] : ["Bullet list requires at least one item."];
  },
};
