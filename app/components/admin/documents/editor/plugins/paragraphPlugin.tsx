import { RichTextEditor } from "../RichTextEditor";
import { createEditorBlock, readString, truncateSummary } from "./shared";
import type { EditorPlugin } from "./types";

export const paragraphPlugin: EditorPlugin = {
  blockType: "paragraph",
  label: "Paragraph",
  icon: "paragraph",
  group: "text",
  order: 20,
  createDefaultBlock: (sortOrder) => createEditorBlock("paragraph", sortOrder, { text: "" }),
  renderEditor: ({ block, isReadOnly, updateBlock, setFocusedField }) => (
    <RichTextEditor
      value={readString(block.content.text)}
      readOnly={isReadOnly}
      rows={5}
      placeholder="Write paragraph text…"
      onChange={(text) => updateBlock(block.clientId, { content: { ...block.content, text } })}
      onFocusField={(insertText) =>
        setFocusedField({ blockClientId: block.clientId, fieldKey: "text", insertText })
      }
      onBlurField={() => setFocusedField(null)}
    />
  ),
  renderToolbar: () => null,
  renderProperties: ({ block, isReadOnly, updateBlock, setFocusedField }) => (
    <RichTextEditor
      label="Text"
      value={readString(block.content.text)}
      readOnly={isReadOnly}
      rows={6}
      onChange={(text) => updateBlock(block.clientId, { content: { ...block.content, text } })}
      onFocusField={(insertText) =>
        setFocusedField({ blockClientId: block.clientId, fieldKey: "text", insertText })
      }
      onBlurField={() => setFocusedField(null)}
    />
  ),
  getSummary: (block) => truncateSummary(readString(block.content.text, "Paragraph")),
  validateClientSide: (block) =>
    typeof block.content.text === "string" ? [] : ["Paragraph requires a text field."],
};
