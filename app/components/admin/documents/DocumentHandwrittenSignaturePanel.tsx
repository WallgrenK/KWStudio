import { useEffect, useState } from "react";
import { PortalCard } from "~/components/portal/PortalSection";
import { fetchPortalBinaryBlob } from "~/services/documentPdfDownload";
import type { HandwrittenSignaturePreviewDto } from "~/types/documents";

type DocumentHandwrittenSignaturePanelProps = {
  signature: HandwrittenSignaturePreviewDto;
  mode: "admin" | "portal";
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

export function DocumentHandwrittenSignaturePanel({
  signature,
  mode,
}: DocumentHandwrittenSignaturePanelProps) {
  const [zoomed, setZoomed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void (async () => {
      const path =
        mode === "admin"
          ? `/portal/admin/documents/${signature.documentId}/signature/preview`
          : `/portal/documents/${signature.documentId}/signature/preview`;
      const result = await fetchPortalBinaryBlob(path);
      if (!active) return;
      if (!result.ok || !result.blob) {
        setPreviewError(result.error ?? "Could not load signature preview.");
        setPreviewUrl(null);
        return;
      }
      objectUrl = URL.createObjectURL(result.blob);
      setPreviewUrl(objectUrl);
      setPreviewError(null);
    })();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mode, signature.documentId]);

  return (
    <PortalCard padding="md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Handwritten signature</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Captured during mobile signing as workflow evidence.
          </p>
        </div>
        {mode === "admin" ? (
          <button
            type="button"
            className="btn inline-flex border border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
            onClick={() => setZoomed((value) => !value)}
          >
            {zoomed ? "Normal size" : "Zoom"}
          </button>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Signed by", value: signature.signerName },
          { label: "Signed at", value: formatDateTime(signature.signedAt) },
          { label: "Provider", value: signature.provider.replace(/_/g, " ") },
          { label: "Signature ID", value: signature.artifactId },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</dt>
            <dd className="mt-1 break-all text-sm font-medium text-gray-800 dark:text-gray-100">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Handwritten signature by ${signature.signerName}`}
            className={`mx-auto block max-w-full bg-white ${zoomed ? "max-h-[480px]" : "max-h-40"}`}
          />
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {previewError ?? "Loading signature preview…"}
          </p>
        )}
      </div>
    </PortalCard>
  );
}
