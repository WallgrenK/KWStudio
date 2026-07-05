import { useState, type FormEvent } from "react";
import { PortalCard } from "~/components/portal/PortalSection";

type PortalDocumentApprovalPanelProps = {
  canApprove: boolean;
  canReject: boolean;
  status: string;
  approvalComment: string | null;
  onApprove: (comment: string) => Promise<void>;
  onReject: (comment: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
};

export function PortalDocumentApprovalPanel({
  canApprove,
  canReject,
  status,
  approvalComment,
  onApprove,
  onReject,
  loading,
  error,
  successMessage,
}: PortalDocumentApprovalPanelProps) {
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle");
  const [comment, setComment] = useState("");

  const showActions = canApprove && canReject;

  if (!showActions && status !== "approved" && status !== "rejected") {
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (mode === "approve") {
      await onApprove(comment);
    } else if (mode === "reject") {
      await onReject(comment);
    }
    setMode("idle");
    setComment("");
  }

  return (
    <PortalCard padding="md">
      <h2 className="text-base font-semibold text-gray-900">Your decision</h2>

      {status === "approved" ? (
        <div
          className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          <p className="font-medium">You approved this document.</p>
          {approvalComment ? <p className="mt-2 text-green-700">{approvalComment}</p> : null}
        </div>
      ) : null}

      {status === "rejected" ? (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="status"
        >
          <p className="font-medium">You rejected this document.</p>
          {approvalComment ? <p className="mt-2 text-red-700">{approvalComment}</p> : null}
        </div>
      ) : null}

      {successMessage ? (
        <p className="mt-4 text-sm text-green-700" role="status">
          {successMessage}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {showActions && mode === "idle" ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn btn-primary inline-flex justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-brand/40 focus-visible:ring-offset-2"
            onClick={() => setMode("approve")}
            disabled={loading}
            aria-label="Approve document"
          >
            Approve
          </button>
          <button
            type="button"
            className="btn inline-flex justify-center border border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2"
            onClick={() => setMode("reject")}
            disabled={loading}
            aria-label="Reject document"
          >
            Reject
          </button>
        </div>
      ) : null}

      {showActions && mode !== "idle" ? (
        <form className="mt-4 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <label htmlFor="approval-comment" className="block text-sm font-medium text-gray-700">
              {mode === "reject" ? "Comment (required)" : "Comment (optional)"}
            </label>
            <textarea
              id="approval-comment"
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-kw-brand focus:outline-none focus:ring-2 focus:ring-kw-brand/20"
              rows={4}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required={mode === "reject"}
              aria-required={mode === "reject"}
              placeholder={
                mode === "reject"
                  ? "Please explain what needs to change…"
                  : "Add an optional note for the team…"
              }
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className={
                mode === "approve"
                  ? "btn btn-primary inline-flex justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-brand/40 focus-visible:ring-offset-2"
                  : "btn inline-flex justify-center border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2"
              }
              disabled={loading || (mode === "reject" && !comment.trim())}
            >
              {loading ? "Saving…" : mode === "approve" ? "Confirm approval" : "Confirm rejection"}
            </button>
            <button
              type="button"
              className="btn inline-flex justify-center border border-gray-200 bg-white text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300/40 focus-visible:ring-offset-2"
              onClick={() => {
                setMode("idle");
                setComment("");
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </PortalCard>
  );
}
