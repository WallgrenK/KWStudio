export type DocumentBlockType =
  | "heading"
  | "paragraph"
  | "bullet_list"
  | "pricing_table"
  | "timeline"
  | "callout"
  | "image"
  | "signature_placeholder"
  | "divider";

export type DocumentStatus =
  | "draft"
  | "generated"
  | "sent"
  | "viewed"
  | "approved"
  | "rejected"
  | "signed"
  | "expired"
  | "archived"
  | "cancelled";

export type DocumentVersionStatus = "draft" | "published";

export type DocumentTypeDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
};

export type DocumentTemplateDto = {
  id: string;
  slug: string;
  name: string;
  document_type_id: string;
  service_id: string | null;
  is_default: boolean;
  is_system: boolean;
};

export type DocumentBlockDto = {
  id: string;
  version_id: string;
  sort_order: number;
  block_type: DocumentBlockType;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export type DocumentVersionDto = {
  id: string;
  document_id: string;
  version_number: number;
  status: DocumentVersionStatus;
  source: string;
  change_summary: string | null;
  variables_snapshot: Record<string, unknown> | null;
  pricing_snapshot: Record<string, unknown> | null;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
};

export type DocumentDto = {
  id: string;
  client_id: string;
  project_id: string | null;
  service_id: string | null;
  document_type_id: string;
  template_id: string | null;
  active_version_id: string | null;
  status: DocumentStatus;
  title: string;
  reference_number: string | null;
  currency: string;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  approval_comment?: string | null;
  signed_at?: string | null;
  signed_by?: string | null;
};

export type DocumentEventDto = {
  id: string;
  document_id: string;
  version_id: string | null;
  event_type: string;
  actor_type: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

export type ServiceDocumentDefaultDto = {
  id: string;
  service_id: string;
  document_type_id: string;
  template_id: string;
};

export type DocumentSnapshotDto = {
  document: DocumentDto;
  activeVersion: DocumentVersionDto | null;
  blocks: DocumentBlockDto[];
};

export type DocumentVariableDefinitionDto = {
  key: string;
  label: string;
  description: string;
  namespace: string;
  type: "string" | "number" | "date" | "currency" | "boolean";
  example: string;
  requiredContext: string[];
};

export type DocumentBlockTypeMetadataDto = {
  type: DocumentBlockType;
  label: string;
  description: string;
  schema: Record<string, unknown>;
  defaultContent: Record<string, unknown>;
  defaultSettings: Record<string, unknown>;
  toolbarMeta: { group: string; icon: string; order: number };
  preview: { summaryField?: string; placeholder?: string };
};

export type DocumentVersionAnalysisDto = {
  blockCount: number;
  blockTypesUsed: string[];
  placeholdersUsed: string[];
  unknownPlaceholders: string[];
  validationErrors: string[];
  warnings: string[];
};

export type DocumentPreviewDto = {
  ok: true;
  html: string;
  warnings: string[];
  cached: boolean;
  contentHash: string;
  artifactId: string | null;
  versionId: string;
};

export type DocumentRenderArtifactDto = {
  id: string;
  version_id: string;
  render_target: "html" | "pdf" | "email";
  content_hash: string | null;
  storage_path: string | null;
  html_inline: string | null;
  mime_type: string | null;
  file_name: string | null;
  registry_versions: Record<string, unknown>;
  generated_at: string;
};

export type PortalDocumentSummaryDto = {
  id: string;
  title: string;
  referenceNumber: string | null;
  status: DocumentStatus;
  documentType: { id: string; name: string; slug: string };
  currentVersionNumber: number | null;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  viewedAt: string | null;
  distributionStatus: string;
  pendingApproval: boolean;
  pendingSignature: boolean;
  canApprove: boolean;
  canSign: boolean;
  canDownloadPdf: boolean;
  isHighlighted: boolean;
};

export type PortalDocumentVersionSummaryDto = {
  id: string;
  versionNumber: number;
  publishedAt: string | null;
  isActive: boolean;
};

export type PortalDocumentDetailDto = {
  id: string;
  title: string;
  referenceNumber: string | null;
  status: DocumentStatus;
  currency: string;
  documentType: { id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  viewedAt: string | null;
  distributionStatus: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  signedAt: string | null;
  approvalComment: string | null;
  canApprove: boolean;
  canReject: boolean;
  canSign: boolean;
  canCancelSign: boolean;
  signature: PortalSignatureStateDto | null;
  canDownloadPdf: boolean;
  canDownloadReceipt: boolean;
  receipt: PortalDocumentReceiptDto | null;
  handwrittenSignature: HandwrittenSignaturePreviewDto | null;
  publishedVersions: PortalDocumentVersionSummaryDto[];
  preview: {
    html: string;
    warnings: string[];
    cached: boolean;
    contentHash: string;
    versionId: string;
  } | null;
  timeline: Array<{
    id: string;
    eventType: string;
    createdAt: string;
    metadata: Record<string, unknown>;
  }>;
};

export type DocumentDistributionDto = {
  id: string;
  document_id: string;
  version_id: string;
  target: string;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

export type ServiceDocumentPackageDto = {
  id: string;
  service_id: string;
  slug: string;
  name: string;
  description: string | null;
  is_default: boolean;
};

export type DocumentEmailProviderStatusDto = {
  mode: string;
  available: boolean;
  provider: string;
  message: string | null;
};

export type DocumentEmailPreviewDto = {
  subject: string;
  html: string;
  text: string;
  portalLink: string;
  recipientEmail: string;
  recipientName: string | null;
  providerStatus: DocumentEmailProviderStatusDto;
  lastEmailSentAt: string | null;
};

export type DocumentEmailSendResultDto = {
  ok: true;
  distribution: DocumentDistributionDto;
  provider: string;
  messageId: string | null;
  devMode: boolean;
  portalLink: string;
  recipientEmail: string;
};

export type PortalSignatureParticipantDto = {
  id: string;
  role: string;
  name: string;
  email: string;
  status: string;
  signedAt: string | null;
  sortOrder: number;
};

export type PortalSignatureStateDto = {
  requestId: string;
  status: string;
  provider: string;
  expiresAt: string | null;
  activeSessionId: string | null;
  mobileStatus: string | null;
  providerMessage: string | null;
  participants: PortalSignatureParticipantDto[];
};

export type MobileSigningSessionDto = {
  sessionId: string;
  status: string;
  provider: string;
  expiresAt: string;
  documentTitle: string;
  documentVersionNumber: number | null;
  clientName: string | null;
  projectTitle: string | null;
  signerName: string;
  signerEmail: string;
  documentContentHash: string | null;
  pdfContentHash: string | null;
  termsRequired: boolean;
};

export type SigningSessionStatusDto = {
  sessionId: string;
  status: string;
  provider: string;
  expiresAt: string | null;
  openedAt: string | null;
  documentSigned: boolean;
};

export type DocumentReceiptInfoDto = {
  available: boolean;
  receiptId: string | null;
  artifactId: string | null;
  contentHash: string | null;
  storagePath: string | null;
  fileName: string | null;
  generatedAt: string | null;
  signatureRequestId: string | null;
  signatureSessionId: string | null;
};

export type PortalDocumentReceiptDto = {
  available: boolean;
  receiptId: string | null;
  generatedAt: string | null;
  fileName: string | null;
};

export type HandwrittenSignaturePreviewDto = {
  documentId: string;
  artifactId: string;
  signatureRequestId: string;
  signatureSessionId: string;
  signerName: string;
  signedAt: string | null;
  provider: string;
  contentHash: string;
  width: number;
  height: number;
  strokeCount: number;
  capturedAt: string;
  hasPreview: boolean;
};

export type SignatureRequestDto = {
  id: string;
  document_id: string;
  version_id: string;
  status: string;
  provider: string;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SignatureParticipantDto = {
  id: string;
  signature_request_id: string;
  role: string;
  name: string;
  email: string;
  client_contact_id: string | null;
  status: string;
  signed_at: string | null;
  sort_order: number;
};

export type DocumentSignatureDetailDto = {
  request: SignatureRequestDto;
  participants: SignatureParticipantDto[];
  events: Array<{
    id: string;
    event_type: string;
    created_at: string;
    metadata: Record<string, unknown>;
  }>;
  activeSession: { id: string; status: string; started_at: string } | null;
  handwrittenSignature: HandwrittenSignaturePreviewDto | null;
} | null;

export type SignatureRequestSnapshotDto = {
  request: SignatureRequestDto;
  participants: SignatureParticipantDto[];
  activeSession: { id: string; status: string } | null;
};
