import { requestPortalApi, isPortalApiConfigured } from "~/services/portalApi";
import type {
  DocumentDto,
  DocumentEventDto,
  DocumentPreviewDto,
  DocumentRenderArtifactDto,
  DocumentSnapshotDto,
  DocumentTemplateDto,
  DocumentTypeDto,
  DocumentVersionDto,
  PortalDocumentDetailDto,
  PortalDocumentSummaryDto,
  ServiceDocumentDefaultDto,
  ServiceDocumentPackageDto,
  DocumentDistributionDto,
  DocumentEmailPreviewDto,
  DocumentEmailProviderStatusDto,
  DocumentEmailSendResultDto,
  DocumentSignatureDetailDto,
  SignatureRequestSnapshotDto,
  MobileSigningSessionDto,
  SigningSessionStatusDto,
  DocumentReceiptInfoDto,
  DocumentBlockDto,
  DocumentVariableDefinitionDto,
  DocumentBlockTypeMetadataDto,
} from "~/types/documents";
import type { DocumentBlockSavePayload } from "~/types/documentEditor";

export const isDocumentsApiConfigured = isPortalApiConfigured;

export type DocumentListFilters = {
  clientId?: string;
  projectId?: string;
  documentTypeId?: string;
  status?: string;
};

function buildQuery(filters: DocumentListFilters): string {
  const params = new URLSearchParams();
  if (filters.clientId) params.set("clientId", filters.clientId);
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.documentTypeId) params.set("documentTypeId", filters.documentTypeId);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listDocuments(filters: DocumentListFilters = {}) {
  return requestPortalApi<{ ok: true; documents: DocumentDto[] }>(
    `/portal/admin/documents${buildQuery(filters)}`,
  );
}

export function getDocument(documentId: string) {
  return requestPortalApi<DocumentSnapshotDto & { ok: true }>(`/portal/admin/documents/${documentId}`);
}

export function listDocumentVersions(documentId: string) {
  return requestPortalApi<{ ok: true; versions: DocumentVersionDto[] }>(
    `/portal/admin/documents/${documentId}/versions`,
  );
}

export function listDocumentEvents(documentId: string) {
  return requestPortalApi<{ ok: true; events: DocumentEventDto[] }>(
    `/portal/admin/documents/${documentId}/events`,
  );
}

export function listDocumentTypes() {
  return requestPortalApi<{ ok: true; documentTypes: DocumentTypeDto[] }>("/portal/admin/document-types");
}

export function listDocumentTemplates(filters: { serviceId?: string; documentTypeId?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.serviceId) params.set("serviceId", filters.serviceId);
  if (filters.documentTypeId) params.set("documentTypeId", filters.documentTypeId);
  const query = params.toString();
  return requestPortalApi<{ ok: true; templates: DocumentTemplateDto[] }>(
    `/portal/admin/document-templates${query ? `?${query}` : ""}`,
  );
}

export function listServiceDocumentDefaults(serviceId: string) {
  return requestPortalApi<{ ok: true; defaults: ServiceDocumentDefaultDto[] }>(
    `/portal/admin/services/${serviceId}/document-defaults`,
  );
}

export function createDocumentFromTemplate(payload: {
  clientId: string;
  templateId: string;
  title?: string;
  projectId?: string | null;
  serviceId?: string | null;
  referenceNumber?: string | null;
}) {
  return requestPortalApi<DocumentSnapshotDto & { ok: true }>("/portal/admin/documents/from-template", {
    method: "POST",
    body: payload,
  });
}

export function publishDocumentVersion(versionId: string, payload: Record<string, unknown> = {}) {
  return requestPortalApi<DocumentSnapshotDto & { ok: true }>(
    `/portal/admin/documents/versions/${versionId}/publish`,
    { method: "POST", body: payload },
  );
}

export function createDocumentNewVersion(documentId: string, changeSummary?: string | null) {
  return requestPortalApi<{ ok: true; version: DocumentVersionDto; blocks: unknown[] }>(
    `/portal/admin/documents/${documentId}/versions/new`,
    { method: "POST", body: changeSummary ? { changeSummary } : {} },
  );
}

export function createDocumentDraftVersion(documentId: string) {
  return requestPortalApi<{ ok: true; version: DocumentVersionDto; blocks: DocumentBlockDto[] }>(
    `/portal/admin/documents/${documentId}/versions/draft`,
    { method: "POST", body: {} },
  );
}

export function getDocumentVersion(documentId: string, versionId: string) {
  return requestPortalApi<{
    ok: true;
    version: DocumentVersionDto;
    blocks: DocumentBlockDto[];
  }>(`/portal/admin/documents/${documentId}/versions/${versionId}`);
}

export function saveDocumentDraftBlocks(versionId: string, blocks: DocumentBlockSavePayload[]) {
  return requestPortalApi<{
    ok: true;
    version: DocumentVersionDto;
    blocks: DocumentBlockDto[];
  }>(`/portal/admin/documents/versions/${versionId}/blocks`, {
    method: "PUT",
    body: { blocks },
  });
}

export function validateDocumentVersionApi(documentId: string, versionId: string) {
  return requestPortalApi<{
    ok: boolean;
    errors: string[];
    warnings: string[];
  }>(`/portal/admin/documents/${documentId}/versions/${versionId}/validate`);
}

export function discardDocumentDraftVersion(documentId: string, versionId: string) {
  return requestPortalApi<DocumentSnapshotDto & { ok: true }>(
    `/portal/admin/documents/versions/${versionId}/discard`,
    { method: "POST", body: { documentId } },
  );
}

export function listDocumentBlockTypes() {
  return requestPortalApi<{ ok: true; blockTypes: DocumentBlockTypeMetadataDto[] }>(
    "/portal/admin/document-block-types",
  );
}

export function listDocumentVariables(filters: { namespace?: string; documentType?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.namespace) params.set("namespace", filters.namespace);
  if (filters.documentType) params.set("documentType", filters.documentType);
  const query = params.toString();
  return requestPortalApi<{ ok: true; variables: DocumentVariableDefinitionDto[] }>(
    `/portal/admin/document-variables${query ? `?${query}` : ""}`,
  );
}

export function duplicateDocument(documentId: string, title?: string) {
  return requestPortalApi<DocumentSnapshotDto & { ok: true }>(
    `/portal/admin/documents/${documentId}/duplicate`,
    { method: "POST", body: title ? { title } : {} },
  );
}

export function archiveDocument(documentId: string) {
  return requestPortalApi<{ ok: true; document: DocumentDto }>(
    `/portal/admin/documents/${documentId}/archive`,
    { method: "POST", body: {} },
  );
}

export function cancelDocument(documentId: string) {
  return requestPortalApi<{ ok: true; document: DocumentDto }>(
    `/portal/admin/documents/${documentId}/cancel`,
    { method: "POST", body: {} },
  );
}

export function previewDocument(documentId: string) {
  return requestPortalApi<DocumentPreviewDto>(`/portal/admin/documents/${documentId}/preview`);
}

export function previewDocumentVersion(documentId: string, versionId: string) {
  return requestPortalApi<DocumentPreviewDto>(
    `/portal/admin/documents/${documentId}/versions/${versionId}/preview`,
  );
}

export function forceRenderDocumentVersion(documentId: string, versionId: string) {
  return requestPortalApi<DocumentPreviewDto>(
    `/portal/admin/documents/${documentId}/versions/${versionId}/render`,
    { method: "POST", body: {} },
  );
}

export function listDocumentRenderArtifacts(documentId: string) {
  return requestPortalApi<{ ok: true; artifacts: DocumentRenderArtifactDto[] }>(
    `/portal/admin/documents/${documentId}/render-artifacts`,
  );
}

// ---------------------------------------------------------------------------
// Client portal documents (published only, no admin internals)
// ---------------------------------------------------------------------------

export function listPortalDocuments() {
  return requestPortalApi<{ ok: true; documents: PortalDocumentSummaryDto[] }>("/portal/documents");
}

export function getPortalDocument(documentId: string, versionId?: string | null) {
  const query = versionId ? `?versionId=${encodeURIComponent(versionId)}` : "";
  return requestPortalApi<{ ok: true; document: PortalDocumentDetailDto }>(
    `/portal/documents/${documentId}${query}`,
  );
}

export function approvePortalDocument(documentId: string, comment?: string | null) {
  return requestPortalApi<{
    ok: true;
    document: PortalDocumentDetailDto;
    completedActionIds: string[];
  }>(`/portal/documents/${documentId}/approve`, {
    method: "POST",
    body: comment ? { comment } : {},
  });
}

export function rejectPortalDocument(documentId: string, comment: string) {
  return requestPortalApi<{
    ok: true;
    document: PortalDocumentDetailDto;
    completedActionIds: string[];
  }>(`/portal/documents/${documentId}/reject`, {
    method: "POST",
    body: { comment },
  });
}

export function listDocumentDistributions(documentId: string) {
  return requestPortalApi<{
    ok: true;
    distributions: DocumentDistributionDto[];
    activeDistribution: DocumentDistributionDto | null;
  }>(`/portal/admin/documents/${documentId}/distributions`);
}

export function sendDocumentToClient(documentId: string, payload: { expiresAt?: string | null } = {}) {
  return requestPortalApi<{
    ok: true;
    document: DocumentDto;
    distribution: DocumentDistributionDto;
    clientActionId: string | null;
  }>(`/portal/admin/documents/${documentId}/send`, {
    method: "POST",
    body: payload,
  });
}

export function cancelDocumentDistribution(documentId: string) {
  return requestPortalApi<{
    ok: true;
    document: DocumentDto;
    distribution: DocumentDistributionDto;
  }>(`/portal/admin/documents/${documentId}/distributions/cancel`, {
    method: "POST",
    body: {},
  });
}

export function listServiceDocumentPackages(serviceId: string) {
  return requestPortalApi<{ ok: true; packages: ServiceDocumentPackageDto[] }>(
    `/portal/admin/services/${serviceId}/document-packages`,
  );
}

export function generateDocumentPackage(
  packageId: string,
  payload: { projectId: string; serviceId: string },
) {
  return requestPortalApi<{
    ok: true;
    packageId: string;
    projectId: string;
    documents: DocumentSnapshotDto[];
  }>(`/portal/admin/packages/${packageId}/generate`, {
    method: "POST",
    body: payload,
  });
}

export function getDocumentEmailStatus() {
  return requestPortalApi<{ ok: true; status: DocumentEmailProviderStatusDto }>(
    "/portal/admin/documents/email/status",
  );
}

export function getDocumentEmailPreview(
  documentId: string,
  options: { recipientEmail?: string; message?: string } = {},
) {
  const params = new URLSearchParams();
  if (options.recipientEmail) params.set("recipientEmail", options.recipientEmail);
  if (options.message) params.set("message", options.message);
  const query = params.toString();
  return requestPortalApi<{ ok: true; preview: DocumentEmailPreviewDto }>(
    `/portal/admin/documents/${documentId}/email/preview${query ? `?${query}` : ""}`,
  );
}

export function sendDocumentByEmail(
  documentId: string,
  payload: { recipientEmail?: string; message?: string } = {},
) {
  return requestPortalApi<DocumentEmailSendResultDto>(
    `/portal/admin/documents/${documentId}/email/send`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function getDocumentSignature(documentId: string) {
  return requestPortalApi<{ ok: true; signature: DocumentSignatureDetailDto }>(
    `/portal/admin/documents/${documentId}/signature`,
  );
}

export function createDocumentSignatureRequest(
  documentId: string,
  payload: {
    versionId?: string | null;
    expiresAt?: string | null;
    participant: { name: string; email: string; role?: string; clientContactId?: string | null };
  },
) {
  return requestPortalApi<{ ok: true; signature: SignatureRequestSnapshotDto }>(
    `/portal/admin/documents/${documentId}/signature`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function cancelDocumentSignatureRequest(documentId: string, reason?: string | null) {
  return requestPortalApi<{ ok: true; signature: SignatureRequestSnapshotDto }>(
    `/portal/admin/documents/${documentId}/signature/cancel`,
    {
      method: "POST",
      body: reason ? { reason } : {},
    },
  );
}

export function startPortalDocumentSigning(documentId: string) {
  return requestPortalApi<{
    ok: true;
    document: PortalDocumentDetailDto;
    sessionId: string;
    provider: string;
    providerMessage: string | null;
    signingUrl: string | null;
    expiresAt: string | null;
    qrPayload: string | null;
    status: string | null;
  }>(`/portal/documents/${documentId}/sign/start`, {
    method: "POST",
    body: {},
  });
}

export function completePortalDocumentSigning(
  documentId: string,
  payload: { sessionId: string; comment?: string | null },
) {
  return requestPortalApi<{
    ok: true;
    document: PortalDocumentDetailDto;
    completedActionIds: string[];
  }>(`/portal/documents/${documentId}/sign/complete`, {
    method: "POST",
    body: payload,
  });
}

export function cancelPortalDocumentSigning(documentId: string, reason?: string | null) {
  return requestPortalApi<{ ok: true; document: PortalDocumentDetailDto }>(
    `/portal/documents/${documentId}/sign/cancel`,
    {
      method: "POST",
      body: reason ? { reason } : {},
    },
  );
}

export function getSigningSessionStatus(sessionId: string) {
  return requestPortalApi<{ ok: true; status: SigningSessionStatusDto }>(
    `/portal/sign/sessions/${sessionId}/status`,
  );
}

export function getMobileSigningSession(token: string) {
  return requestPortalApi<{ ok: true; session: MobileSigningSessionDto }>(
    `/sign/mobile/${encodeURIComponent(token)}/session`,
    { auth: false },
  );
}

export function openMobileSigningSession(token: string) {
  return requestPortalApi<{ ok: true; session: MobileSigningSessionDto }>(
    `/sign/mobile/${encodeURIComponent(token)}/open`,
    { method: "POST", body: {}, auth: false },
  );
}

export function completeMobileSigningSession(
  token: string,
  payload: { termsAccepted: boolean; signatureSvg: string; comment?: string | null },
) {
  return requestPortalApi<{
    ok: true;
    documentId: string;
    signedAt: string | null;
    completedActionIds: string[];
  }>(`/sign/mobile/${encodeURIComponent(token)}/complete`, {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function getDocumentReceiptInfo(documentId: string) {
  return requestPortalApi<{ ok: true; receipt: DocumentReceiptInfoDto }>(
    `/portal/admin/documents/${documentId}/receipt/info`,
  );
}
