import { createEditorBlock, readString, truncateSummary } from "./shared";
import type { EditorPlugin } from "./types";

const SIGNER_ROLES = ["client", "company", "witness"] as const;

export const signaturePlaceholderPlugin: EditorPlugin = {
  blockType: "signature_placeholder",
  label: "Signature",
  icon: "signature",
  group: "signature",
  order: 80,
  createDefaultBlock: (sortOrder) =>
    createEditorBlock("signature_placeholder", sortOrder, { label: "Signature", signerRole: "client" }),
  renderEditor: ({ block }) => (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
      <p className="text-sm font-medium text-gray-700">{readString(block.content.label, "Signature")}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
        {readString(block.content.signerRole, "client")} signer
      </p>
    </div>
  ),
  renderToolbar: () => null,
  renderProperties: ({ block, isReadOnly, updateBlock }) => (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Label</span>
        <input
          type="text"
          readOnly={isReadOnly}
          value={readString(block.content.label, "Signature")}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          onChange={(event) =>
            updateBlock(block.clientId, { content: { ...block.content, label: event.target.value } })
          }
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Signer role</span>
        <select
          disabled={isReadOnly}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          value={readString(block.content.signerRole, "client")}
          onChange={(event) =>
            updateBlock(block.clientId, { content: { ...block.content, signerRole: event.target.value } })
          }
        >
          {SIGNER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-gray-400">E-sign provider details are configured at publish/distribution time.</p>
    </div>
  ),
  getSummary: (block) => truncateSummary(readString(block.content.label, "Signature")),
  validateClientSide: (block) => {
    const errors: string[] = [];
    if (!readString(block.content.label).trim()) errors.push("Signature placeholder requires a label.");
    const role = block.content.signerRole;
    if (role !== undefined && role !== "client" && role !== "company" && role !== "witness") {
      errors.push("Signer role must be client, company, or witness.");
    }
    return errors;
  },
};
