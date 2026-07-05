import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { DocumentDistributionPanel } from "~/components/admin/documents/DocumentDistributionPanel";
import { DocumentEmailPanel } from "~/components/admin/documents/DocumentEmailPanel";
import { DocumentReceiptPanel } from "~/components/admin/documents/DocumentReceiptPanel";
import { DocumentSignaturePanel } from "~/components/admin/documents/DocumentSignaturePanel";
import { DocumentEventTimeline } from "~/components/admin/documents/DocumentEventTimeline";
import { DocumentPreviewPanel } from "~/components/admin/documents/DocumentPreviewPanel";
import { DocumentVersionPanel } from "~/components/admin/documents/DocumentVersionPanel";
import { EmptyState } from "~/components/admin/EmptyState";
import { StatusBadge } from "~/components/admin/StatusBadge";
import {
  downloadAdminDocumentPdf,
  regenerateAdminDocumentPdf,
} from "~/services/documentPdfDownload";
import { listAdminProjects, listPortalClients, listPortalServices } from "~/services/portalApi";
import {
  archiveDocument,
  cancelDocument,
  createDocumentNewVersion,
  duplicateDocument,
  forceRenderDocumentVersion,
  cancelDocumentDistribution,
  getDocument,
  isDocumentsApiConfigured,
  listDocumentDistributions,
  listDocumentEvents,
  listDocumentTypes,
  listDocumentVersions,
  previewDocumentVersion,
  publishDocumentVersion,
  sendDocumentToClient,
} from "~/services/documentsApi";
import type {
  DocumentDistributionDto,
  DocumentSnapshotDto,
  DocumentEventDto,
  DocumentTypeDto,
  DocumentVersionDto,
} from "~/types/documents";
import type { PortalClientDto } from "~/types/portal";
import type { AdminProjectListItemDto, PortalServiceDto } from "~/types/workflow";

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

export default function AdminDocumentDetailPage() {
  const { documentId = "" } = useParams();
  const navigate = useNavigate();

  const [snapshot, setSnapshot] = useState<DocumentSnapshotDto | null>(null);
  const [versions, setVersions] = useState<DocumentVersionDto[]>([]);
  const [events, setEvents] = useState<DocumentEventDto[]>([]);
  const [clients, setClients] = useState<PortalClientDto[]>([]);
  const [projects, setProjects] = useState<AdminProjectListItemDto[]>([]);
  const [services, setServices] = useState<PortalServiceDto[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [distributions, setDistributions] = useState<DocumentDistributionDto[]>([]);
  const [activeDistribution, setActiveDistribution] = useState<DocumentDistributionDto | null>(null);

  const reload = useCallback(async () => {
    if (!documentId || !isDocumentsApiConfigured) return;

    const [documentResult, versionsResult, eventsResult, distributionsResult, clientsResult, projectsResult, servicesResult, typesResult] =
      await Promise.all([
        getDocument(documentId),
        listDocumentVersions(documentId),
        listDocumentEvents(documentId),
        listDocumentDistributions(documentId),
        listPortalClients(),
        listAdminProjects(),
        listPortalServices(),
        listDocumentTypes(),
      ]);

    if (!documentResult.ok || !documentResult.data?.document) {
      throw new Error(documentResult.error ?? "Document not found.");
    }

    setSnapshot({
      document: documentResult.data.document,
      activeVersion: documentResult.data.activeVersion,
      blocks: documentResult.data.blocks,
    });
    setVersions(versionsResult.ok && versionsResult.data?.versions ? versionsResult.data.versions : []);
    setEvents(eventsResult.ok && eventsResult.data?.events ? eventsResult.data.events : []);
    if (distributionsResult.ok && distributionsResult.data) {
      setDistributions(distributionsResult.data.distributions);
      setActiveDistribution(distributionsResult.data.activeDistribution);
    }
    if (clientsResult.ok && clientsResult.data?.clients) setClients(clientsResult.data.clients);
    if (projectsResult.ok && projectsResult.data?.projects) setProjects(projectsResult.data.projects);
    if (servicesResult.ok && servicesResult.data?.services) setServices(servicesResult.data.services);
    if (typesResult.ok && typesResult.data?.documentTypes) setDocumentTypes(typesResult.data.documentTypes);

    const activeId =
      documentResult.data.activeVersion?.id ??
      (versionsResult.ok ? versionsResult.data?.versions[0]?.id : undefined) ??
      null;
    setSelectedVersionId((current) => current ?? activeId);
  }, [documentId]);

  const loadPreview = useCallback(
    async (versionId: string, force = false) => {
      if (!documentId) return;
      setPreviewLoading(true);
      setPreviewError(null);

      const result = force
        ? await forceRenderDocumentVersion(documentId, versionId)
        : await previewDocumentVersion(documentId, versionId);

      if (result.ok && result.data?.html) {
        setPreviewHtml(result.data.html);
        setPreviewWarnings(result.data.warnings ?? []);
      } else {
        setPreviewHtml(null);
        setPreviewError(result.error ?? "No preview available.");
        setPreviewWarnings([]);
      }
      setPreviewLoading(false);
    },
    [documentId],
  );

  useEffect(() => {
    if (!isDocumentsApiConfigured) {
      setError("API not configured.");
      setLoading(false);
      return;
    }

    void reload()
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load document.");
      })
      .finally(() => setLoading(false));
  }, [reload]);

  useEffect(() => {
    if (selectedVersionId) {
      void loadPreview(selectedVersionId);
    }
  }, [loadPreview, selectedVersionId]);

  const document = snapshot?.document ?? null;
  const packageLabel =
    typeof document?.metadata?.packageSlug === "string" ? document.metadata.packageSlug : null;
  const canSend = document?.status === "generated" && !activeDistribution;
  const canSendEmail =
    Boolean(snapshot?.activeVersion?.status === "published") &&
    ["generated", "sent", "viewed"].includes(document?.status ?? "");
  const canCreateSignature = Boolean(
    document &&
      activeDistribution &&
      document.status !== "signed" &&
      (document.status === "sent" || document.status === "viewed" || document.status === "approved"),
  );
  const canDownloadReceipt = document?.status === "signed";

  const labels = useMemo(() => {
    if (!document) {
      return {
        clientName: "—",
        projectTitle: "—",
        serviceName: "—",
        typeName: "—",
      };
    }
    return {
      clientName: clients.find((client) => client.id === document.client_id)?.company_name ?? "—",
      projectTitle: projects.find((project) => project.id === document.project_id)?.title ?? "—",
      serviceName: services.find((service) => service.id === document.service_id)?.name ?? "—",
      typeName: documentTypes.find((type) => type.id === document.document_type_id)?.name ?? "—",
    };
  }, [clients, document, documentTypes, projects, services]);

  async function runAction(
    key: string,
    task: () => Promise<{ ok: boolean; error?: string; data?: unknown }>,
    onSuccess?: (data: unknown) => void | Promise<void>,
  ) {
    setActionLoading(key);
    setActionMessage(null);
    const result = await task();
    setActionLoading(null);

    if (!result.ok) {
      setActionMessage(result.error ?? "Action failed.");
      return;
    }

    if (onSuccess) {
      await onSuccess(result.data);
      return;
    }

    setActionMessage("Saved.");
    setLoading(true);
    await reload().finally(() => setLoading(false));
    if (selectedVersionId) await loadPreview(selectedVersionId);
  }

  async function handleRefreshPreview() {
    if (!selectedVersionId) return;
    setActionLoading("refresh-preview");
    setActionMessage(null);
    const result = await forceRenderDocumentVersion(documentId, selectedVersionId);
    setActionLoading(null);
    if (result.ok && result.data?.html) {
      setPreviewHtml(result.data.html);
      setPreviewWarnings(result.data.warnings ?? []);
      setActionMessage("Preview refreshed.");
      const eventsResult = await listDocumentEvents(documentId);
      if (eventsResult.ok && eventsResult.data?.events) setEvents(eventsResult.data.events);
    } else {
      setActionMessage(result.error ?? "Could not refresh preview.");
    }
  }

  if (loading && !document) {
    return (
      <AdminShell title="Document" description="Loading document detail…">
        <p className="text-sm text-gray-500">Loading…</p>
      </AdminShell>
    );
  }

  if (error || !document) {
    return (
      <AdminShell title="Document" description="Document detail">
        <EmptyState title="Document unavailable" description={error ?? "Document not found."} />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={document.title}
      description={labels.typeName}
      action={(
        <Link className="btn border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD]" to="/admin/documents">
          Back to library
        </Link>
      )}
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={document.status} />
                {document.status === "approved" ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    Approved
                  </span>
                ) : null}
                {document.status === "rejected" ? (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                    Rejected
                  </span>
                ) : null}
                {document.reference_number ? (
                  <span className="text-sm text-gray-500">Ref {document.reference_number}</span>
                ) : null}
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-gray-900">{document.title}</h1>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Client", value: labels.clientName },
              { label: "Project", value: labels.projectTitle },
              { label: "Service", value: labels.serviceName },
              { label: "Document type", value: labels.typeName },
              { label: "Status", value: document.status },
              { label: "Current version", value: snapshot?.activeVersion ? `v${snapshot.activeVersion.version_number}` : "—" },
              { label: "Created", value: formatDateTime(document.created_at) },
              { label: "Updated", value: formatDateTime(document.updated_at) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {(document.approved_at || document.rejected_at || document.signed_at || document.approval_comment) ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" aria-label="Client response">
            <h2 className="text-lg font-semibold text-gray-800">Client response</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {document.approved_at ? (
                <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">Approved</p>
                  <p className="mt-1 text-sm text-green-900">{formatDateTime(document.approved_at)}</p>
                  {document.approved_by ? (
                    <p className="mt-1 text-xs text-green-800">By client user</p>
                  ) : null}
                </div>
              ) : null}
              {document.signed_at ? (
                <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">Signed</p>
                  <p className="mt-1 text-sm text-green-900">{formatDateTime(document.signed_at)}</p>
                  {document.signed_by ? (
                    <p className="mt-1 text-xs text-green-800">By client user</p>
                  ) : null}
                </div>
              ) : null}
              {document.rejected_at ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-red-700">Rejected</p>
                  <p className="mt-1 text-sm text-red-900">{formatDateTime(document.rejected_at)}</p>
                  {document.rejected_by ? (
                    <p className="mt-1 text-xs text-red-800">By client user</p>
                  ) : null}
                </div>
              ) : null}
            </div>
            {document.approval_comment ? (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Comment</p>
                <p className="mt-1 text-sm text-gray-800">{document.approval_comment}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {actionMessage ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">{actionMessage}</div>
        ) : null}

        <DocumentDistributionPanel
          distributions={distributions}
          activeDistribution={activeDistribution}
          documentStatus={document.status}
          packageLabel={packageLabel}
          canSend={canSend}
          actionLoading={actionLoading}
          onSend={() =>
            void runAction("send", () => sendDocumentToClient(documentId))
          }
          onCancelDistribution={() =>
            void runAction("cancel-distribution", () => cancelDocumentDistribution(documentId))
          }
        />

        <DocumentEmailPanel
          documentId={documentId}
          canSendEmail={canSendEmail}
          onSent={() => {
            void reload();
            void listDocumentEvents(documentId).then((result) => {
              if (result.ok && result.data?.events) setEvents(result.data.events);
            });
          }}
        />

        <DocumentSignaturePanel
          documentId={documentId}
          canCreateSignature={canCreateSignature}
          onChanged={() => {
            void reload();
          }}
        />

        <DocumentReceiptPanel
          documentId={documentId}
          canDownloadReceipt={canDownloadReceipt}
          onChanged={() => {
            void listDocumentEvents(documentId).then((result) => {
              if (result.ok && result.data?.events) setEvents(result.data.events);
            });
          }}
        />

        <DocumentVersionPanel
          versions={versions}
          activeVersionId={document.active_version_id}
          selectedVersionId={selectedVersionId}
          onSelectVersion={setSelectedVersionId}
          onPublish={(versionId) => void runAction("publish", () => publishDocumentVersion(versionId))}
          onCreateNewVersion={() => void runAction("new-version", () => createDocumentNewVersion(documentId))}
          onDuplicate={() =>
            void runAction("duplicate", () => duplicateDocument(documentId), async (data) => {
              const payload = data as DocumentSnapshotDto & { ok?: true };
              if (payload.document?.id) {
                navigate(`/admin/documents/${payload.document.id}`);
              }
            })
          }
          onArchive={() => void runAction("archive", () => archiveDocument(documentId))}
          onCancel={() => void runAction("cancel", () => cancelDocument(documentId))}
          onRefreshPreview={() => void handleRefreshPreview()}
          actionLoading={actionLoading}
          documentStatus={document.status}
        />

        <DocumentPreviewPanel
          html={previewHtml}
          loading={previewLoading}
          error={previewError}
          warnings={previewWarnings}
        />

        {selectedVersionId && snapshot?.activeVersion?.status === "published" ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6" aria-label="PDF export">
            <h2 className="text-lg font-semibold text-gray-800">PDF</h2>
            <p className="mt-1 text-sm text-gray-500">Download or regenerate the PDF for the selected published version.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-primary inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2"
                disabled={actionLoading !== null}
                onClick={() => {
                  void (async () => {
                    setActionLoading("download-pdf");
                    setActionMessage(null);
                    const result = await downloadAdminDocumentPdf(documentId, selectedVersionId);
                    setActionLoading(null);
                    setActionMessage(result.ok ? "PDF downloaded." : (result.error ?? "Could not download PDF."));
                  })();
                }}
              >
                {actionLoading === "download-pdf" ? "Preparing…" : "Download PDF"}
              </button>
              <button
                type="button"
                className="btn inline-flex border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2"
                disabled={actionLoading !== null}
                onClick={() => {
                  void (async () => {
                    setActionLoading("regenerate-pdf");
                    setActionMessage(null);
                    const result = await regenerateAdminDocumentPdf(documentId, selectedVersionId);
                    setActionLoading(null);
                    setActionMessage(result.ok ? "PDF regenerated and downloaded." : (result.error ?? "Could not regenerate PDF."));
                    if (result.ok) {
                      const eventsResult = await listDocumentEvents(documentId);
                      if (eventsResult.ok && eventsResult.data?.events) setEvents(eventsResult.data.events);
                    }
                  })();
                }}
              >
                {actionLoading === "regenerate-pdf" ? "Regenerating…" : "Regenerate PDF"}
              </button>
            </div>
          </section>
        ) : null}

        <DocumentEventTimeline events={events} />
      </div>
    </AdminShell>
  );
}
