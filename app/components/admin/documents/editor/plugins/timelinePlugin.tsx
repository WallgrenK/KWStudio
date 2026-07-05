import { createEditorBlock, readString, truncateSummary } from "./shared";
import type { EditorPlugin } from "./types";

type TimelineItem = {
  title: string;
  date: string;
  description: string;
};

function readTimelineItems(content: Record<string, unknown>): TimelineItem[] {
  const value = content.items;
  if (!Array.isArray(value) || !value.length) {
    return [{ title: "Kickoff", date: "", description: "" }];
  }
  return value.map((item) => {
    const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      title: readString(record.title, "Milestone"),
      date: readString(record.date),
      description: readString(record.description),
    };
  });
}

export const timelinePlugin: EditorPlugin = {
  blockType: "timeline",
  label: "Timeline",
  icon: "timeline",
  group: "layout",
  order: 50,
  createDefaultBlock: (sortOrder) =>
    createEditorBlock("timeline", sortOrder, { items: [{ title: "Kickoff", date: "", description: "" }] }),
  renderEditor: ({ block, isReadOnly, updateBlock }) => {
    const items = readTimelineItems(block.content);

    function patchItems(nextItems: TimelineItem[]) {
      updateBlock(block.clientId, { content: { ...block.content, items: nextItems } });
    }

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${block.clientId}-timeline-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
            <input
              type="text"
              readOnly={isReadOnly}
              value={item.title}
              placeholder="Title"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium"
              onChange={(event) => {
                const next = [...items];
                next[index] = { ...next[index], title: event.target.value };
                patchItems(next);
              }}
            />
            <input
              type="text"
              readOnly={isReadOnly}
              value={item.date}
              placeholder="Date"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              onChange={(event) => {
                const next = [...items];
                next[index] = { ...next[index], date: event.target.value };
                patchItems(next);
              }}
            />
            <textarea
              readOnly={isReadOnly}
              value={item.description}
              placeholder="Description"
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              onChange={(event) => {
                const next = [...items];
                next[index] = { ...next[index], description: event.target.value };
                patchItems(next);
              }}
            />
            {!isReadOnly ? (
              <button
                type="button"
                className="text-xs text-red-600 hover:underline"
                onClick={() => patchItems(items.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
        {!isReadOnly ? (
          <button
            type="button"
            className="text-sm text-kw-brand hover:underline"
            onClick={() => patchItems([...items, { title: "Milestone", date: "", description: "" }])}
          >
            Add milestone
          </button>
        ) : null}
      </div>
    );
  },
  renderToolbar: () => null,
  renderProperties: ({ block, isReadOnly, updateBlock }) => {
    const items = readTimelineItems(block.content);
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{items.length} milestone(s)</p>
        {items.map((item, index) => (
          <div key={`${block.clientId}-prop-${index}`} className="rounded-lg border border-gray-100 px-3 py-2 text-sm">
            <p className="font-medium text-gray-800">{item.title || "Untitled"}</p>
            {item.date ? <p className="text-gray-500">{item.date}</p> : null}
            {!isReadOnly ? (
              <button
                type="button"
                className="mt-1 text-xs text-red-600 hover:underline"
                onClick={() =>
                  updateBlock(block.clientId, {
                    content: { ...block.content, items: items.filter((_, i) => i !== index) },
                  })
                }
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>
    );
  },
  getSummary: (block) => {
    const items = readTimelineItems(block.content);
    return truncateSummary(items.map((item) => item.title).join(" · "));
  },
  validateClientSide: (block) => {
    const errors: string[] = [];
    const items = readTimelineItems(block.content);
    if (!items.length) errors.push("Timeline requires at least one item.");
    items.forEach((item, index) => {
      if (!item.title.trim()) errors.push(`Timeline item ${index + 1} requires a title.`);
    });
    return errors;
  },
};
