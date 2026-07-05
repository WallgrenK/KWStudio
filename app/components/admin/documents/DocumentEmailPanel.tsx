import { useEffect, useState } from "react";
import {
  getDocumentEmailPreview,
  getDocumentEmailStatus,
  sendDocumentByEmail,
} from "~/services/documentsApi";
import type { DocumentEmailPreviewDto, DocumentEmailProviderStatusDto } from "~/types/documents";

type DocumentEmailPanelProps = {
  documentId: string;
  canSendEmail: boolean;
  defaultRecipientEmail?: string | null;
  onSent?: () => void;
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DocumentEmailPanel({
  documentId,
  canSendEmail,
  defaultRecipientEmail,
  onSent,
}: DocumentEmailPanelProps) {
  const [open, setOpen] = useState(false);
  const [providerStatus, setProviderStatus] = useState<DocumentEmailProviderStatusDto | null>(null);
  const [preview, setPreview] = useState<DocumentEmailPreviewDto | null>(null);
  const [recipientEmail, setRecipientEmail] = useState(defaultRecipientEmail ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRecipientEmail(defaultRecipientEmail ?? "");
  }, [defaultRecipientEmail]);

  useEffect(() => {
    void getDocumentEmailStatus().then((result) => {
      if (result.ok && result.data?.status) setProviderStatus(result.data.status);
    });
  }, []);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    const result = await getDocumentEmailPreview(documentId, {
      recipientEmail: recipientEmail.trim() || undefined,
      message: message.trim() || undefined,
    });
    setLoading(false);
    if (result.ok && result.data?.preview) {
      setPreview(result.data.preview);
      setRecipientEmail(result.data.preview.recipientEmail);
    } else {
      setPreview(null);
      setError(result.error ?? "Could not load email preview.");
    }
  }

  async function handleOpen() {
    setOpen(true);
    setFeedback(null);
    setError(null);
    await loadPreview();
  }

  async function handleSend() {
    setLoading(true);
    setFeedback(null);
    setError(null);
    const result = await sendDocumentByEmail(documentId, {
      recipientEmail: recipientEmail.trim() || undefined,
      message: message.trim() || undefined,
    });
    setLoading(false);

    if (result.ok && result.data) {
      setFeedback(
        result.data.devMode
          ? `Email logged in dev mode to ${result.data.recipientEmail}.`
          : `Email sent to ${result.data.recipientEmail}.`,
      );
      setOpen(false);
      onSent?.();
    } else {
      setError(result.error ?? "Could not send email.");
    }
  }

  const emailAvailable = providerStatus?.available ?? true;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" aria-label="Email delivery">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Email</h2>
          <p className="mt-1 text-sm text-gray-500">
            Send a secure portal link by email. PDF attachments are not included in this release.
          </p>
          {providerStatus && !emailAvailable ? (
            <p className="mt-2 text-sm text-amber-700" role="status">
              {providerStatus.message ?? "Email is not configured."}
            </p>
          ) : null}
          {providerStatus?.mode === "dev" ? (
            <p className="mt-2 text-sm text-gray-500">Dev mode: emails are logged, not delivered.</p>
          ) : null}
          {preview?.lastEmailSentAt ? (
            <p className="mt-2 text-sm text-gray-600">Last email sent: {formatDateTime(preview.lastEmailSentAt)}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="btn inline-flex border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2"
          disabled={!canSendEmail || !emailAvailable || loading}
          onClick={() => void handleOpen()}
        >
          Send by Email
        </button>
      </div>

      {feedback ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{feedback}</div>
      ) : null}
      {error && !open ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {open ? (
        <div
          className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 md:p-5"
          role="dialog"
          aria-labelledby="document-email-dialog-title"
        >
          <h3 id="document-email-dialog-title" className="text-base font-semibold text-gray-900">
            Confirm email delivery
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="document-email-recipient" className="block text-sm font-medium text-gray-700">
                Recipient email
              </label>
              <input
                id="document-email-recipient"
                type="email"
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="document-email-message" className="block text-sm font-medium text-gray-700">
                Optional message
              </label>
              <textarea
                id="document-email-message"
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
          </div>

          {loading ? <p className="mt-4 text-sm text-gray-500">Loading preview…</p> : null}
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

          {preview ? (
            <div className="mt-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
              <p><span className="font-medium">Subject:</span> {preview.subject}</p>
              <p><span className="font-medium">Portal link:</span> {preview.portalLink}</p>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 whitespace-pre-wrap">{preview.text}</div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-primary inline-flex"
              disabled={loading || !recipientEmail.trim()}
              onClick={() => void handleSend()}
            >
              {loading ? "Sending…" : "Send email"}
            </button>
            <button
              type="button"
              className="btn inline-flex border border-gray-200 bg-white text-gray-700"
              disabled={loading}
              onClick={() => void loadPreview()}
            >
              Refresh preview
            </button>
            <button
              type="button"
              className="btn inline-flex border border-gray-200 bg-white text-gray-700"
              disabled={loading}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
