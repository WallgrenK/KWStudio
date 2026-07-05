import { useCallback, useRef } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onFocusField?: (insertText: (value: string) => void) => void;
  onBlurField?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
  label?: string;
};

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const nextValue = `${textarea.value.slice(0, start)}${before}${selected}${after}${textarea.value.slice(end)}`;
  const cursor = start + before.length + selected.length + after.length;
  queueMicrotask(() => {
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
  });
  return nextValue;
}

export function RichTextEditor({
  value,
  onChange,
  onFocusField,
  onBlurField,
  placeholder,
  readOnly = false,
  rows = 4,
  label,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback(
    (insertValue: string) => {
      const textarea = textareaRef.current;
      if (!textarea || readOnly) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextValue = `${value.slice(0, start)}${insertValue}${value.slice(end)}`;
      onChange(nextValue);
      const cursor = start + insertValue.length;
      queueMicrotask(() => {
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
      });
    },
    [onChange, readOnly, value],
  );

  function applyWrap(before: string, after: string) {
    const textarea = textareaRef.current;
    if (!textarea || readOnly) return;
    onChange(wrapSelection(textarea, before, after));
  }

  return (
    <div className="space-y-2">
      {label ? <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p> : null}
      {!readOnly ? (
        <div className="flex flex-wrap gap-1">
          {[
            { label: "B", action: () => applyWrap("**", "**"), title: "Bold" },
            { label: "I", action: () => applyWrap("_", "_"), title: "Italic" },
            { label: "U", action: () => applyWrap("__", "__"), title: "Underline" },
            { label: "Link", action: () => applyWrap("[", "](https://)"), title: "Link" },
            { label: "List", action: () => onChange(value ? `${value}\n- ` : "- "), title: "Bullet" },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              title={item.title}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:border-kw-brand hover:text-kw-brand"
              onMouseDown={(event) => event.preventDefault()}
              onClick={item.action}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        value={value}
        rows={rows}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-kw-brand focus:ring-2 focus:ring-kw-brand/20"
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => onFocusField?.(insertAtCursor)}
        onBlur={() => onBlurField?.()}
      />
      <p className="text-xs text-gray-400">Use {"{{variable.key}}"} placeholders in text fields.</p>
    </div>
  );
}
