import { useEffect, useState } from "react";
import {
  cancelDocumentSignatureRequest,
  createDocumentSignatureRequest,
  getDocumentSignature,
} from "~/services/documentsApi";
import type { DocumentSignatureDetailDto } from "~/types/documents";
import { DocumentHandwrittenSignaturePanel } from "~/components/admin/documents/DocumentHandwrittenSignaturePanel";
import { useSettingsCategory } from "~/settings/useSettingsCategory";
import { defaultSignatureExpiryInput } from "~/settings/portalHelpers";

type DocumentSignaturePanelProps = {
  documentId: string;
  canCreateSignature: boolean;
  defaultParticipant?: { name: string; email: string } | null;
  onChanged?: () => void;
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

function formatProvider(provider: string): string {
  return provider.replace(/_/g, " ");
}

export function DocumentSignaturePanel({
  documentId,
  canCreateSignature,
  defaultParticipant,
  onChanged,
}: DocumentSignaturePanelProps) {
  const developerSettings = useSettingsCategory("developer");
  const [detail, setDetail] = useState<DocumentSignatureDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState(defaultParticipant?.name ?? "");
  const [participantEmail, setParticipantEmail] = useState(defaultParticipant?.email ?? "");
  const [expiresAt, setExpiresAt] = useState("");
  const [expiryInitialized, setExpiryInitialized] = useState(false);

  useEffect(() => {
    setParticipantName(defaultParticipant?.name ?? "");
    setParticipantEmail(defaultParticipant?.email ?? "");
  }, [defaultParticipant?.email, defaultParticipant?.name]);

  useEffect(() => {
    if (expiryInitialized || developerSettings.isLoading) return;
    setExpiresAt(defaultSignatureExpiryInput(developerSettings.data.documents.defaultSignatureExpiryDays));
    setExpiryInitialized(true);
  }, [developerSettings.data.documents.defaultSignatureExpiryDays, developerSettings.isLoading, expiryInitialized]);

  async function reload() {
    setLoading(true);
    setError(null);
    const result = await getDocumentSignature(documentId);
    setLoading(false);
    if (result.ok) {
      setDetail(result.data?.signature ?? null);
    } else {
      setError(result.error ?? "Could not load signature request.");
    }
  }

  useEffect(() => {
    void reload();
  }, [documentId]);

  const request = detail?.request ?? null;
  const participants = detail?.participants ?? [];
  const isActive =
    request?.status === "draft" ||
    request?.status === "pending" ||
    request?.status === "signing";

  async function handleCreate() {
    setLoading(true);
    setError(null);
    setFeedback(null);
    const result = await createDocumentSignatureRequest(documentId, {
      participant: {
        name: participantName.trim(),
        email: participantEmail.trim(),
        role: "signer",
      },
      expiresAt: expiresAt.trim() || null,
    });
    setLoading(false);
    if (result.ok) {
      setFeedback("Signature request created.");
      await reload();
      onChanged?.();
    } else {
      setError(result.error ?? "Could not create signature request.");
    }
  }

  async function handleCancel() {
    setLoading(true);
    setError(null);
    setFeedback(null);
    const result = await cancelDocumentSignatureRequest(documentId);
    setLoading(false);
    if (result.ok) {
      setFeedback("Signature request cancelled.");
      await reload();
      onChanged?.();
    } else {
      setError(result.error ?? "Could not cancel signature request.");
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" aria-label="Signature">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Signature</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a QR/mobile signing request for the client portal. Default provider uses phone scanning.
          </p>
        </div>
      </div>

      {feedback ? <p className="mt-4 text-sm text-green-700">{feedback}</p> : null}
      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {request ? (
        <div className="mt-4 space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Status", value: request.status },
              { label: "Provider", value: formatProvider(request.provider) },
              { label: "Expires", value: formatDateTime(request.expires_at) },
              { label: "Updated", value: formatDateTime(request.updated_at) },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</dt>
                <dd className="mt-1 text-sm font-medium capitalize text-gray-800">{item.value}</dd>
              </div>
            ))}
          </dl>

          {participants.length ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Participants</h3>
              <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {participants.map((participant) => (
                  <li key={participant.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{participant.name}</p>
                      <p className="text-gray-500">{participant.email}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                      {participant.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detail?.handwrittenSignature ? (
            <DocumentHandwrittenSignaturePanel
              signature={detail.handwrittenSignature}
              mode="admin"
            />
          ) : null}

          {isActive ? (
            <button
              type="button"
              className="btn inline-flex border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2"
              disabled={loading}
              onClick={() => void handleCancel()}
            >
              Cancel request
            </button>
          ) : null}
        </div>
      ) : canCreateSignature ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="signer-name" className="block text-sm font-medium text-gray-700">
                Signer name
              </label>
              <input
                id="signer-name"
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="signer-email" className="block text-sm font-medium text-gray-700">
                Signer email
              </label>
              <input
                id="signer-email"
                type="email"
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                value={participantEmail}
                onChange={(event) => setParticipantEmail(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="signature-expires" className="block text-sm font-medium text-gray-700">
              Expires at (optional)
            </label>
            <input
              id="signature-expires"
              type="datetime-local"
              className="mt-2 w-full max-w-sm rounded-xl border border-gray-200 px-3 py-2 text-sm"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-brand/40 focus-visible:ring-offset-2"
            disabled={loading || !participantName.trim() || !participantEmail.trim()}
            onClick={() => void handleCreate()}
          >
            Create signature request
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500">Send the document to the client before creating a signature request.</p>
      )}
    </section>
  );
}
