import { RichTextEditor } from "../RichTextEditor";
import { createEditorBlock, readNumber, readString, truncateSummary } from "./shared";
import type { EditorPlugin } from "./types";

export const headingPlugin: EditorPlugin = {
  blockType: "heading",
  label: "Heading",
  icon: "heading",
  group: "text",
  order: 10,
  createDefaultBlock: (sortOrder) => createEditorBlock("heading", sortOrder, { text: "Heading", level: 2 }),
  renderEditor: ({ block, isReadOnly, updateBlock, setFocusedField }) => (
    <RichTextEditor
      label={`Heading H${readNumber(block.content.level, 2)}`}
      value={readString(block.content.text)}
      readOnly={isReadOnly}
      rows={2}
      placeholder="Heading text"
      onChange={(text) => updateBlock(block.clientId, { content: { ...block.content, text } })}
      onFocusField={(insertText) =>
        setFocusedField({ blockClientId: block.clientId, fieldKey: "text", insertText })
      }
      onBlurField={() => setFocusedField(null)}
    />
  ),
  renderToolbar: ({ block, isReadOnly, updateBlock }) =>
    isReadOnly ? null : (
      <label className="flex items-center gap-2 text-xs text-gray-600">
        Level
        <select
          className="rounded-md border border-gray-200 bg-white px-2 py-1"
          value={readNumber(block.content.level, 2)}
          onChange={(event) =>
            updateBlock(block.clientId, { content: { ...block.content, level: Number(event.target.value) } })
          }
        >
          {[1, 2, 3, 4].map((level) => (
            <option key={level} value={level}>
              H{level}
            </option>
          ))}
        </select>
      </label>
    ),
  renderProperties: ({ block, isReadOnly, updateBlock, setFocusedField }) => (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Level</span>
        <select
          disabled={isReadOnly}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          value={readNumber(block.content.level, 2)}
          onChange={(event) =>
            updateBlock(block.clientId, { content: { ...block.content, level: Number(event.target.value) } })
          }
        >
          {[1, 2, 3, 4].map((level) => (
            <option key={level} value={level}>
              H{level}
            </option>
          ))}
        </select>
      </label>
      <RichTextEditor
        label="Text"
        value={readString(block.content.text)}
        readOnly={isReadOnly}
        onChange={(text) => updateBlock(block.clientId, { content: { ...block.content, text } })}
        onFocusField={(insertText) =>
          setFocusedField({ blockClientId: block.clientId, fieldKey: "text", insertText })
        }
        onBlurField={() => setFocusedField(null)}
      />
    </div>
  ),
  getSummary: (block) => truncateSummary(readString(block.content.text, "Heading")),
  validateClientSide: (block) => {
    const errors: string[] = [];
    if (!readString(block.content.text).trim()) errors.push("Heading text is required.");
    const level = block.content.level;
    if (level !== undefined && (typeof level !== "number" || level < 1 || level > 4)) {
      errors.push("Heading level must be between 1 and 4.");
    }
    return errors;
  },
};
