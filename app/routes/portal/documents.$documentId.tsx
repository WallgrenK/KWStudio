import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { DocumentPreviewPanel } from "~/components/admin/documents/DocumentPreviewPanel";
import { StatusBadge } from "~/components/admin/StatusBadge";
import { PortalDashboardLayout } from "~/components/portal/PortalAuthLayout";
import { PortalDocumentApprovalPanel } from "~/components/portal/PortalDocumentApprovalPanel";
import { PortalDocumentSigningPanel } from "~/components/portal/PortalDocumentSigningPanel";
import { DocumentHandwrittenSignaturePanel } from "~/components/admin/documents/DocumentHandwrittenSignaturePanel";
import { PortalDocumentTimeline } from "~/components/portal/PortalDocumentTimeline";
import {
  PortalAccessDeniedState,
  PortalErrorState,
  PortalLoadingState,
} from "~/components/portal/PortalDashboardStates";
import { PortalCard } from "~/components/portal/PortalSection";
import { usePortalAuth } from "~/hooks/usePortalAuth";
import { useUserProfile } from "~/hooks/useUserProfile";
import { downloadPortalDocumentPdf } from "~/services/documentPdfDownload";
import { downloadPortalDocumentReceipt } from "~/services/documentReceiptDownload";
import {
  approvePortalDocument,
  cancelPortalDocumentSigning,
  completePortalDocumentSigning,
  getPortalDocument,
  getSigningSessionStatus,
  isDocumentsApiConfigured,
  rejectPortalDocument,
  startPortalDocumentSigning,
} from "~/services/documentsApi";
import type { PortalDocumentDetailDto } from "~/types/documents";

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

export default function PortalDocumentDetailPage() {
  const { documentId = "" } = useParams();
  const navigate = useNavigate();
  const { session, loading: authLoading, me } = usePortalAuth();
  const userProfile = useUserProfile(Boolean(session) && isDocumentsApiConfigured);

  const [document, setDocument] = useState<PortalDocumentDetailDto | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState<string | null>(null);

  const isAdmin = userProfile.profile?.role === "admin";
  const companyName = useMemo(() => me?.client?.company_name ?? undefined, [me?.client?.company_name]);

  const loadDocument = useCallback(
    async (versionId?: string | null) => {
      if (!documentId) return;
      setLoading(true);
      setError(null);

      const result = await getPortalDocument(documentId, versionId);
      if (result.ok && result.data?.document) {
        setDocument(result.data.document);
        setSelectedVersionId(result.data.document.preview?.versionId ?? versionId ?? null);
      } else {
        setDocument(null);
        setError(result.error ?? "Document not found.");
      }
      setLoading(false);
    },
    [documentId],
  );

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, navigate, session]);

  useEffect(() => {
    if (userProfile.loading || !userProfile.profile) return;
    if (isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, navigate, userProfile.loading, userProfile.profile]);

  useEffect(() => {
    if (!session || !isDocumentsApiConfigured || !documentId) {
      setLoading(false);
      return;
    }
    void loadDocument();
  }, [documentId, loadDocument, session]);

  async function handleVersionChange(versionId: string) {
    setSelectedVersionId(versionId);
    await loadDocument(versionId);
  }

  async function handleApprove(comment: string) {
    if (!documentId) return;
    setActionLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    const result = await approvePortalDocument(documentId, comment.trim() || null);
    setActionLoading(false);

    if (result.ok && result.data?.document) {
      setDocument(result.data.document);
      setSuccessMessage("Thank you — your approval has been recorded.");
    } else {
      setActionError(result.error ?? "Could not approve document.");
    }
  }

  async function handleReject(comment: string) {
    if (!documentId) return;
    setActionLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    const result = await rejectPortalDocument(documentId, comment);
    setActionLoading(false);

    if (result.ok && result.data?.document) {
      setDocument(result.data.document);
      setSuccessMessage("Your feedback has been sent to the team.");
    } else {
      setActionError(result.error ?? "Could not reject document.");
    }
  }

  async function handleStartSigning() {
    if (!documentId) return null;
    setActionLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    const result = await startPortalDocumentSigning(documentId);
    setActionLoading(false);

    if (result.ok && result.data) {
      setDocument(result.data.document);
      return {
        sessionId: result.data.sessionId,
        provider: result.data.provider,
        providerMessage: result.data.providerMessage,
        signingUrl: result.data.signingUrl,
        expiresAt: result.data.expiresAt,
        qrPayload: result.data.qrPayload,
        status: result.data.status,
      };
    }

    setActionError(result.error ?? "Could not start signing.");
    return null;
  }

  async function handlePollStatus(sessionId: string) {
    const result = await getSigningSessionStatus(sessionId);
    if (result.ok && result.data?.status) {
      if (result.data.status.documentSigned) {
        const refreshed = await getPortalDocument(documentId);
        if (refreshed.ok && refreshed.data?.document) {
          setDocument(refreshed.data.document);
          setSuccessMessage("Thank you — your signature has been recorded.");
        }
      }
      return {
        status: result.data.status.status,
        documentSigned: result.data.status.documentSigned,
      };
    }
    return null;
  }

  async function handleCompleteSigning(sessionId: string, comment: string) {
    if (!documentId) return;
    setActionLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    const result = await completePortalDocumentSigning(documentId, {
      sessionId,
      comment: comment.trim() || null,
    });
    setActionLoading(false);

    if (result.ok && result.data?.document) {
      setDocument(result.data.document);
      setSuccessMessage("Thank you — your signature has been recorded.");
    } else {
      setActionError(result.error ?? "Could not complete signing.");
    }
  }

  async function handleCancelSigning() {
    if (!documentId) return;
    setActionLoading(true);
    setActionError(null);

    const result = await cancelPortalDocumentSigning(documentId);
    setActionLoading(false);

    if (result.ok && result.data?.document) {
      setDocument(result.data.document);
      setSuccessMessage(null);
    } else {
      setActionError(result.error ?? "Could not cancel signing.");
    }
  }

  const useSigningFlow = Boolean(
    document?.signature || document?.canSign || document?.status === "signed",
  );

  if (!isDocumentsApiConfigured) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalErrorState title="Unavailable" description="Documents are not available — API is not configured." />
      </PortalDashboardLayout>
    );
  }

  if (authLoading || (loading && !document)) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalLoadingState message="Loading document…" />
      </PortalDashboardLayout>
    );
  }

  if (isAdmin) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalAccessDeniedState description="Admin accounts should use the admin console." />
      </PortalDashboardLayout>
    );
  }

  if (error || !document) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalErrorState title="Document unavailable" description={error ?? "Document not found."} />
        <Link
          to="/portal/documents"
          className="mt-4 inline-block text-sm font-medium text-[#2E75BD] hover:underline"
        >
          Back to documents
        </Link>
      </PortalDashboardLayout>
    );
  }

  return (
    <PortalDashboardLayout
      companyName={companyName}
      action={(
        <Link
          to="/portal/documents"
          className="text-sm font-medium text-[#2E75BD] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:rounded"
        >
          All documents
        </Link>
      )}
    >
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={document.status} />
          <span className="text-sm text-gray-500">{document.documentType.name}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-gray-900">{document.title}</h1>
        {document.referenceNumber ? (
          <p className="mt-1 text-sm text-gray-500">Ref {document.referenceNumber}</p>
        ) : null}
      </header>

      <div className="space-y-6">
        <PortalCard padding="md">
          <h2 className="text-base font-semibold text-gray-900">Details</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Status", value: document.status },
              { label: "Currency", value: document.currency },
              { label: "Sent", value: formatDateTime(document.sentAt) },
              { label: "Viewed", value: formatDateTime(document.viewedAt) },
              { label: "Created", value: formatDateTime(document.createdAt) },
              { label: "Last updated", value: formatDateTime(document.updatedAt) },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</dt>
                <dd className="mt-1 text-sm font-medium text-gray-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        </PortalCard>

        <DocumentPreviewPanel
          html={document.preview?.html ?? null}
          loading={loading}
          error={document.preview ? null : "No published preview available."}
          warnings={document.preview?.warnings ?? []}
        />

        {document.canDownloadReceipt ? (
          <PortalCard padding="md">
            <h2 className="text-base font-semibold text-gray-900">Signature receipt</h2>
            <p className="mt-1 text-sm text-gray-500">
              Download the audit receipt PDF for this signed document.
            </p>
            {document.receipt?.generatedAt ? (
              <p className="mt-2 text-sm text-gray-600">
                Generated {new Date(document.receipt.generatedAt).toLocaleString("en-GB")}
              </p>
            ) : null}
            {receiptMessage ? <p className="mt-3 text-sm text-gray-600">{receiptMessage}</p> : null}
            <button
              type="button"
              className="btn btn-primary mt-4 inline-flex"
              disabled={receiptLoading}
              onClick={() => {
                void (async () => {
                  setReceiptLoading(true);
                  setReceiptMessage(null);
                  const result = await downloadPortalDocumentReceipt(documentId);
                  setReceiptLoading(false);
                  setReceiptMessage(result.ok ? "Receipt downloaded." : (result.error ?? "Could not download receipt."));
                })();
              }}
            >
              {receiptLoading ? "Preparing receipt…" : "Download receipt"}
            </button>
          </PortalCard>
        ) : null}

        {document.handwrittenSignature ? (
          <DocumentHandwrittenSignaturePanel
            signature={document.handwrittenSignature}
            mode="portal"
          />
        ) : null}

        {document.canDownloadPdf ? (
          <PortalCard padding="md">
            <h2 className="text-base font-semibold text-gray-900">Download</h2>
            <p className="mt-1 text-sm text-gray-500">Save a PDF copy of this document.</p>
            {pdfMessage ? <p className="mt-3 text-sm text-gray-600">{pdfMessage}</p> : null}
            <button
              type="button"
              className="btn btn-primary mt-4 inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2"
              disabled={pdfLoading}
              aria-label="Download document PDF"
              onClick={() => {
                void (async () => {
                  setPdfLoading(true);
                  setPdfMessage(null);
                  const result = await downloadPortalDocumentPdf(documentId);
                  setPdfLoading(false);
                  setPdfMessage(result.ok ? "PDF downloaded." : (result.error ?? "Could not download PDF."));
                })();
              }}
            >
              {pdfLoading ? "Preparing PDF…" : "Download PDF"}
            </button>
          </PortalCard>
        ) : null}

        {useSigningFlow && document ? (
          <PortalDocumentSigningPanel
            document={document}
            onStartSigning={handleStartSigning}
            onCompleteSigning={handleCompleteSigning}
            onCancelSigning={handleCancelSigning}
            onPollStatus={handlePollStatus}
            loading={actionLoading}
            error={actionError}
            successMessage={successMessage}
          />
        ) : (
          <PortalDocumentApprovalPanel
            canApprove={document.canApprove}
            canReject={document.canReject}
            status={document.status}
            approvalComment={document.approvalComment}
            onApprove={handleApprove}
            onReject={handleReject}
            loading={actionLoading}
            error={actionError}
            successMessage={successMessage}
          />
        )}

        {document.publishedVersions.length > 1 ? (
          <PortalCard padding="md">
            <h2 className="text-base font-semibold text-gray-900">Published versions</h2>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Select published version">
              {document.publishedVersions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2 ${
                    selectedVersionId === version.id
                      ? "border-[#2E75BD] bg-[#eff6ff] text-[#2E75BD]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => void handleVersionChange(version.id)}
                  aria-pressed={selectedVersionId === version.id}
                >
                  v{version.versionNumber}
                  {version.isActive ? " (current)" : ""}
                </button>
              ))}
            </div>
          </PortalCard>
        ) : null}

        <PortalDocumentTimeline timeline={document.timeline} />
      </div>
    </PortalDashboardLayout>
  );
}
