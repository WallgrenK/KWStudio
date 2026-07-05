import { downloadPortalBinary } from "~/services/documentPdfDownload";

export function downloadAdminDocumentReceipt(documentId: string) {
  return downloadPortalBinary(
    `/portal/admin/documents/${documentId}/receipt`,
    "signature-receipt.pdf",
  );
}

export function regenerateAdminDocumentReceipt(documentId: string) {
  return downloadPortalBinary(
    `/portal/admin/documents/${documentId}/receipt/render`,
    "signature-receipt.pdf",
    "POST",
  );
}

export function downloadPortalDocumentReceipt(documentId: string) {
  return downloadPortalBinary(`/portal/documents/${documentId}/receipt`, "signature-receipt.pdf");
}
