import { StatusBadge } from "~/components/admin/StatusBadge";

type DocumentDistributionDto = {
  id: string;
  document_id: string;
  version_id: string;
  target: string;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  expires_at: string | null;
  created_at: string;
};

type DocumentDistributionPanelProps = {
  distributions: DocumentDistributionDto[];
  activeDistribution: DocumentDistributionDto | null;
  documentStatus: string;
  packageLabel: string | null;
  onSend: () => void;
  onCancelDistribution: () => void;
  actionLoading: string | null;
  canSend: boolean;
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

export function DocumentDistributionPanel({
  distributions,
  activeDistribution,
  documentStatus,
  packageLabel,
  onSend,
  onCancelDistribution,
  actionLoading,
  canSend,
}: DocumentDistributionPanelProps) {
  const latest = activeDistribution ?? distributions[0] ?? null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" aria-label="Document distribution">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Distribution</h2>
          <p className="mt-1 text-sm text-gray-500">Portal delivery to the client. Undistributed documents stay admin-only.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-brand/40 focus-visible:ring-offset-2"
            onClick={onSend}
            disabled={!canSend || actionLoading !== null}
            aria-label="Send document to client"
          >
            {actionLoading === "send" ? "Sending…" : "Send to Client"}
          </button>
          {activeDistribution ? (
            <button
              type="button"
              className="btn inline-flex border border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40 focus-visible:ring-offset-2"
              onClick={onCancelDistribution}
              disabled={actionLoading !== null}
            >
              {actionLoading === "cancel-distribution" ? "Cancelling…" : "Cancel Distribution"}
            </button>
          ) : null}
          <button
            type="button"
            className="btn inline-flex cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400"
            disabled
            title="Resend will be available in a future release"
            aria-label="Resend disabled"
          >
            Resend (soon)
          </button>
        </div>
      </div>

      {packageLabel ? (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          Package: <span className="font-medium">{packageLabel}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Document status", value: <StatusBadge status={documentStatus} /> },
          { label: "Target", value: latest?.target ?? "portal" },
          { label: "Sent", value: formatDateTime(latest?.sent_at) },
          { label: "Viewed", value: formatDateTime(latest?.viewed_at) },
          { label: "Expires", value: formatDateTime(latest?.expires_at) },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</p>
            <div className="mt-1 text-sm font-medium text-gray-800">{item.value}</div>
          </div>
        ))}
      </div>

      {latest ? (
        <p className="mt-4 text-sm text-gray-600">
          Distribution status: <span className="font-medium">{latest.status}</span>
        </p>
      ) : (
        <p className="mt-4 text-sm text-gray-500">Not yet sent to the client.</p>
      )}
    </section>
  );
}
