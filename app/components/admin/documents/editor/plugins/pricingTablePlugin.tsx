import { RichTextEditor } from "../RichTextEditor";
import { createEditorBlock, readNumber, readString, truncateSummary } from "./shared";
import type { EditorPlugin, EditorPluginRenderContext } from "./types";

type PricingLineItem = {
  label: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  type: "one_time" | "recurring";
};

type PricingDiscount = {
  label: string;
  amount?: number;
  percentage?: number;
};

function readLineItems(content: Record<string, unknown>): PricingLineItem[] {
  const value = content.lineItems;
  if (!Array.isArray(value) || !value.length) {
    return [{ label: "Service", quantity: 1, unitPrice: 0, vatRate: 25, type: "one_time" }];
  }
  return value.map((item) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      label: readString(record.label, "Service"),
      description: readString(record.description),
      quantity: readNumber(record.quantity, 1),
      unitPrice: readNumber(record.unitPrice, 0),
      vatRate: readNumber(record.vatRate, 25),
      type: record.type === "recurring" ? "recurring" : "one_time",
    };
  });
}

function readDiscounts(content: Record<string, unknown>): PricingDiscount[] {
  const value = content.discounts;
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      label: readString(record.label, "Discount"),
      amount: typeof record.amount === "number" ? record.amount : undefined,
      percentage: typeof record.percentage === "number" ? record.percentage : undefined,
    };
  });
}

function PricingFields({ block, isReadOnly, updateBlock, setFocusedField }: EditorPluginRenderContext) {
  const lineItems = readLineItems(block.content);
  const discounts = readDiscounts(block.content);
  const currency = readString(block.content.currency, "SEK");
  const notes = readString(block.content.notes);

  function patchContent(patch: Record<string, unknown>) {
    updateBlock(block.clientId, { content: { ...block.content, ...patch } });
  }

  return (
    <div className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Currency</span>
        <input
          type="text"
          readOnly={isReadOnly}
          value={currency}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          onChange={(event) => patchContent({ currency: event.target.value.toUpperCase() })}
        />
      </label>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Line items</p>
        {lineItems.map((item, index) => (
          <div key={`${block.clientId}-line-${index}`} className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <input
              type="text"
              readOnly={isReadOnly}
              value={item.label}
              placeholder="Label"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              onChange={(event) => {
                const next = [...lineItems];
                next[index] = { ...next[index], label: event.target.value };
                patchContent({ lineItems: next });
              }}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                readOnly={isReadOnly}
                value={item.quantity}
                min={0}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                onChange={(event) => {
                  const next = [...lineItems];
                  next[index] = { ...next[index], quantity: Number(event.target.value) };
                  patchContent({ lineItems: next });
                }}
              />
              <input
                type="number"
                readOnly={isReadOnly}
                value={item.unitPrice}
                min={0}
                step="0.01"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                onChange={(event) => {
                  const next = [...lineItems];
                  next[index] = { ...next[index], unitPrice: Number(event.target.value) };
                  patchContent({ lineItems: next });
                }}
              />
              <input
                type="number"
                readOnly={isReadOnly}
                value={item.vatRate}
                min={0}
                max={100}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                onChange={(event) => {
                  const next = [...lineItems];
                  next[index] = { ...next[index], vatRate: Number(event.target.value) };
                  patchContent({ lineItems: next });
                }}
              />
              <select
                disabled={isReadOnly}
                value={item.type}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                onChange={(event) => {
                  const next = [...lineItems];
                  next[index] = { ...next[index], type: event.target.value as PricingLineItem["type"] };
                  patchContent({ lineItems: next });
                }}
              >
                <option value="one_time">One-time</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            {!isReadOnly ? (
              <button
                type="button"
                className="text-xs text-red-600 hover:underline"
                onClick={() => patchContent({ lineItems: lineItems.filter((_, i) => i !== index) })}
              >
                Remove line
              </button>
            ) : null}
          </div>
        ))}
        {!isReadOnly ? (
          <button
            type="button"
            className="text-sm text-[#2E75BD] hover:underline"
            onClick={() =>
              patchContent({
                lineItems: [...lineItems, { label: "Service", quantity: 1, unitPrice: 0, vatRate: 25, type: "one_time" }],
              })
            }
          >
            Add line item
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Discounts</p>
        {discounts.map((discount, index) => (
          <div key={`${block.clientId}-discount-${index}`} className="grid grid-cols-3 gap-2">
            <input
              type="text"
              readOnly={isReadOnly}
              value={discount.label}
              className="col-span-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              onChange={(event) => {
                const next = [...discounts];
                next[index] = { ...next[index], label: event.target.value };
                patchContent({ discounts: next });
              }}
            />
            <input
              type="number"
              readOnly={isReadOnly}
              placeholder="Amount"
              value={discount.amount ?? ""}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              onChange={(event) => {
                const next = [...discounts];
                next[index] = { ...next[index], amount: Number(event.target.value) };
                patchContent({ discounts: next });
              }}
            />
            <input
              type="number"
              readOnly={isReadOnly}
              placeholder="%"
              value={discount.percentage ?? ""}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              onChange={(event) => {
                const next = [...discounts];
                next[index] = { ...next[index], percentage: Number(event.target.value) };
                patchContent({ discounts: next });
              }}
            />
          </div>
        ))}
        {!isReadOnly ? (
          <button
            type="button"
            className="text-sm text-[#2E75BD] hover:underline"
            onClick={() => patchContent({ discounts: [...discounts, { label: "Discount" }] })}
          >
            Add discount
          </button>
        ) : null}
      </div>

      <RichTextEditor
        label="Notes"
        value={notes}
        readOnly={isReadOnly}
        rows={3}
        onChange={(text) => patchContent({ notes: text })}
        onFocusField={(insertText) =>
          setFocusedField({ blockClientId: block.clientId, fieldKey: "notes", insertText })
        }
        onBlurField={() => setFocusedField(null)}
      />
    </div>
  );
}

export const pricingTablePlugin: EditorPlugin = {
  blockType: "pricing_table",
  label: "Pricing table",
  icon: "table",
  group: "pricing",
  order: 40,
  createDefaultBlock: (sortOrder) =>
    createEditorBlock("pricing_table", sortOrder, {
      lineItems: [{ label: "Service", quantity: 1, unitPrice: 0, vatRate: 25, type: "one_time" }],
      currency: "SEK",
      discounts: [],
      notes: "",
    }),
  renderEditor: (ctx) => <PricingFields {...ctx} />,
  renderToolbar: () => null,
  renderProperties: (ctx) => <PricingFields {...ctx} />,
  getSummary: (block) => {
    const items = readLineItems(block.content);
    const currency = readString(block.content.currency, "SEK");
    return truncateSummary(`${items.length} line item(s) · ${currency}`);
  },
  validateClientSide: (block) => {
    const errors: string[] = [];
    const items = readLineItems(block.content);
    if (!items.length) errors.push("Pricing table requires at least one line item.");
    items.forEach((item, index) => {
      if (!item.label.trim()) errors.push(`Line item ${index + 1} requires a label.`);
      if (item.quantity < 0) errors.push(`Line item ${index + 1} quantity must be zero or greater.`);
      if (item.unitPrice < 0) errors.push(`Line item ${index + 1} unit price must be zero or greater.`);
      if (item.vatRate < 0 || item.vatRate > 100) errors.push(`Line item ${index + 1} VAT must be 0–100%.`);
    });
    return errors;
  },
};
