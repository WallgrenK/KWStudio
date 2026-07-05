import { RichTextEditor } from "../RichTextEditor";
import { createEditorBlock, readString, truncateSummary } from "./shared";
import type { EditorPlugin } from "./types";

const VARIANTS = ["info", "warning", "success"] as const;

export const calloutPlugin: EditorPlugin = {
  blockType: "callout",
  label: "Callout",
  icon: "callout",
  group: "layout",
  order: 60,
  createDefaultBlock: (sortOrder) => createEditorBlock("callout", sortOrder, { text: "", variant: "info" }),
  renderEditor: ({ block, isReadOnly, updateBlock, setFocusedField }) => (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-gray-600">
        Variant
        <select
          disabled={isReadOnly}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
          value={readString(block.content.variant, "info")}
          onChange={(event) =>
            updateBlock(block.clientId, { content: { ...block.content, variant: event.target.value } })
          }
        >
          {VARIANTS.map((variant) => (
            <option key={variant} value={variant}>
              {variant}
            </option>
          ))}
        </select>
      </label>
      <RichTextEditor
        value={readString(block.content.text)}
        readOnly={isReadOnly}
        rows={4}
        placeholder="Callout text"
        onChange={(text) => updateBlock(block.clientId, { content: { ...block.content, text } })}
        onFocusField={(insertText) =>
          setFocusedField({ blockClientId: block.clientId, fieldKey: "text", insertText })
        }
        onBlurField={() => setFocusedField(null)}
      />
    </div>
  ),
  renderToolbar: ({ block, isReadOnly, updateBlock }) =>
    isReadOnly ? null : (
      <select
        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
        value={readString(block.content.variant, "info")}
        onChange={(event) =>
          updateBlock(block.clientId, { content: { ...block.content, variant: event.target.value } })
        }
      >
        {VARIANTS.map((variant) => (
          <option key={variant} value={variant}>
            {variant}
          </option>
        ))}
      </select>
    ),
  renderProperties: ({ block, isReadOnly, updateBlock, setFocusedField }) => (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Variant</span>
        <select
          disabled={isReadOnly}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          value={readString(block.content.variant, "info")}
          onChange={(event) =>
            updateBlock(block.clientId, { content: { ...block.content, variant: event.target.value } })
          }
        >
          {VARIANTS.map((variant) => (
            <option key={variant} value={variant}>
              {variant}
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
  getSummary: (block) => truncateSummary(readString(block.content.text, "Callout")),
  validateClientSide: (block) => {
    const errors: string[] = [];
    if (!readString(block.content.text).trim()) errors.push("Callout text is required.");
    const variant = block.content.variant;
    if (variant !== undefined && variant !== "info" && variant !== "warning" && variant !== "success") {
      errors.push("Callout variant must be info, warning, or success.");
    }
    return errors;
  },
};
