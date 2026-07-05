import { useState, type FormEvent } from "react";

type ConversationComposerProps = {
  disabled?: boolean;
  busy?: boolean;
  onSend: (body: string) => Promise<void>;
};

export function ConversationComposer({ disabled, busy, onSend }: ConversationComposerProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || disabled || busy) return;

    setError(null);
    try {
      await onSend(trimmed);
      setBody("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not send message.");
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="border-t border-gray-200 bg-white p-4">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder="Write a message…"
          disabled={disabled || busy}
          className="min-h-[80px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-kw-brand focus:outline-none focus:ring-1 focus:ring-kw-brand disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={disabled || busy || !body.trim()}
          className="btn btn-primary self-end"
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
