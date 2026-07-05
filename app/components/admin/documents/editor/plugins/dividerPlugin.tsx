import { createEditorBlock } from "./shared";
import type { EditorPlugin } from "./types";

export const dividerPlugin: EditorPlugin = {
  blockType: "divider",
  label: "Divider",
  icon: "divider",
  group: "layout",
  order: 90,
  createDefaultBlock: (sortOrder) => createEditorBlock("divider", sortOrder, {}),
  renderEditor: () => <hr className="my-2 border-t border-gray-300" />,
  renderToolbar: () => null,
  renderProperties: () => (
    <p className="text-sm text-gray-500">Visual section divider with no editable content.</p>
  ),
  getSummary: () => "Divider",
  validateClientSide: (block) =>
    block.content && typeof block.content === "object" && Object.keys(block.content).length > 0
      ? ["Divider block content must be empty."]
      : [],
};
