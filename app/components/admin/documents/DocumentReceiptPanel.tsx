import { useEffect, useState } from "react";
import {
  downloadAdminDocumentReceipt,
  regenerateAdminDocumentReceipt,
} from "~/services/documentReceiptDownload";
import { getDocumentReceiptInfo } from "~/services/documentsApi";
import type { DocumentReceiptInfoDto } from "~/types/documents";

type DocumentReceiptPanelProps = {
  documentId: string;
  canDownloadReceipt: boolean;
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

export function DocumentReceiptPanel({
  documentId,
  canDownloadReceipt,
  onChanged,
}: DocumentReceiptPanelProps) {
  const [receipt, setReceipt] = useState<DocumentReceiptInfoDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    const result = await getDocumentReceiptInfo(documentId);
    setLoading(false);
    if (result.ok && result.data?.receipt) {
      setReceipt(result.data.receipt);
    } else {
      setReceipt(null);
      if (!result.ok) setError(result.error ?? "Could not load receipt info.");
    }
  }

  useEffect(() => {
    if (canDownloadReceipt) void reload();
  }, [canDownloadReceipt, documentId]);

  if (!canDownloadReceipt) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" aria-label="Signature receipt">
        <h2 className="text-lg font-semibold text-gray-800">Signature receipt</h2>
        <p className="mt-2 text-sm text-gray-500">Receipt PDF becomes available after the document is signed.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" aria-label="Signature receipt">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Signature receipt</h2>
          <p className="mt-1 text-sm text-gray-500">
            Immutable audit PDF generated automatically when signing completes.
          </p>
        </div>
      </div>

      {feedback ? <p className="mt-4 text-sm text-green-700">{feedback}</p> : null}
      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Status", value: receipt?.available ? "Generated" : loading ? "Loading…" : "Pending" },
          { label: "Generated", value: formatDateTime(receipt?.generatedAt) },
          { label: "Receipt ID", value: receipt?.receiptId ?? "—" },
          { label: "File", value: receipt?.fileName ?? "—" },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</dt>
            <dd className="mt-1 break-all text-sm font-medium text-gray-800">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-primary inline-flex"
          disabled={loading || !receipt?.available}
          onClick={() => {
            void (async () => {
              setLoading(true);
              setFeedback(null);
              setError(null);
              const result = await downloadAdminDocumentReceipt(documentId);
              setLoading(false);
              setFeedback(result.ok ? "Receipt downloaded." : null);
              setError(result.ok ? null : (result.error ?? "Could not download receipt."));
              onChanged?.();
            })();
          }}
        >
          Download receipt
        </button>
        <button
          type="button"
          className="btn inline-flex border border-gray-200 bg-white text-gray-700"
          disabled={loading}
          onClick={() => {
            void (async () => {
              setLoading(true);
              setFeedback(null);
              setError(null);
              const result = await regenerateAdminDocumentReceipt(documentId);
              setLoading(false);
              if (result.ok) {
                setFeedback("Receipt regenerated and downloaded.");
                await reload();
                onChanged?.();
              } else {
                setError(result.error ?? "Could not regenerate receipt.");
              }
            })();
          }}
        >
          Regenerate
        </button>
      </div>
    </section>
  );
}
