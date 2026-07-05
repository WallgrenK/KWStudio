import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { PortalCard } from "~/components/portal/PortalSection";
import type { PortalDocumentDetailDto } from "~/types/documents";

type SigningStartResult = {
  sessionId: string;
  provider: string;
  providerMessage: string | null;
  signingUrl: string | null;
  expiresAt: string | null;
  qrPayload: string | null;
  status: string | null;
};

type PortalDocumentSigningPanelProps = {
  document: PortalDocumentDetailDto;
  onStartSigning: () => Promise<SigningStartResult | null>;
  onCompleteSigning: (sessionId: string, comment: string) => Promise<void>;
  onCancelSigning: () => Promise<void>;
  onPollStatus: (sessionId: string) => Promise<{ status: string; documentSigned: boolean } | null>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
};

function formatStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Waiting for scan";
    case "opened":
      return "Opened on mobile";
    case "completed":
      return "Signed";
    case "expired":
      return "Expired";
    case "cancelled":
      return "Cancelled";
    default:
      return status.replace(/_/g, " ");
  }
}

function initialQrMode(document: PortalDocumentDetailDto): boolean {
  return document.signature?.status === "signing" && document.signature.provider === "qr_mobile";
}

export function PortalDocumentSigningPanel({
  document,
  onStartSigning,
  onCompleteSigning,
  onCancelSigning,
  onPollStatus,
  loading,
  error,
  successMessage,
}: PortalDocumentSigningPanelProps) {
  const [mode, setMode] = useState<"idle" | "qr" | "confirm">(() => (initialQrMode(document) ? "qr" : "idle"));
  const [sessionId, setSessionId] = useState<string | null>(document.signature?.activeSessionId ?? null);
  const [provider, setProvider] = useState<string | null>(document.signature?.provider ?? null);
  const [providerMessage, setProviderMessage] = useState<string | null>(document.signature?.providerMessage ?? null);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [mobileStatus, setMobileStatus] = useState<string | null>(document.signature?.mobileStatus ?? null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [starting, setStarting] = useState(false);
  const startInFlightRef = useRef(false);

  const signature = document.signature;
  const isQrProvider = provider === "qr_mobile" || signature?.provider === "qr_mobile";
  const showSigningFlow = document.canSign || document.canCancelSign || document.status === "signed";
  const qrUnavailable = mode === "qr" && !signingUrl;

  useEffect(() => {
    if (signature?.status === "signing" && signature.provider === "qr_mobile") {
      setMode("qr");
      setSessionId(signature.activeSessionId ?? null);
      setProvider(signature.provider);
      setMobileStatus(signature.mobileStatus ?? "pending");
      return;
    }

    if (signature?.status === "pending" || signature?.status === "cancelled") {
      setMode("idle");
      setSigningUrl(null);
      setQrDataUrl(null);
    }
  }, [signature?.activeSessionId, signature?.mobileStatus, signature?.provider, signature?.status]);

  useEffect(() => {
    if (!signingUrl) {
      setQrDataUrl(null);
      return;
    }
    void QRCode.toDataURL(signingUrl, { margin: 1, width: 240 }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
  }, [signingUrl]);

  useEffect(() => {
    if (!isQrProvider || !sessionId || mode !== "qr") return;
    if (mobileStatus === "completed" || mobileStatus === "expired" || mobileStatus === "cancelled") return;

    const interval = window.setInterval(() => {
      void onPollStatus(sessionId).then((result) => {
        if (!result) return;
        setMobileStatus(result.status);
        if (result.documentSigned || result.status === "completed") {
          setMode("idle");
        }
      });
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isQrProvider, mode, mobileStatus, onPollStatus, sessionId]);

  const statusLabel = useMemo(() => formatStatusLabel(mobileStatus ?? "pending"), [mobileStatus]);

  if (!showSigningFlow && !signature) {
    return null;
  }

  async function handleStartSigning() {
    if (startInFlightRef.current || starting || loading) return;

    startInFlightRef.current = true;
    setStarting(true);

    try {
      const result = await onStartSigning();
      if (!result?.sessionId) return;

      setSessionId(result.sessionId);
      setProvider(result.provider);
      setProviderMessage(result.providerMessage);
      setExpiresAt(result.expiresAt);
      setMobileStatus(result.status ?? "pending");

      if (result.provider === "qr_mobile") {
        const nextUrl = result.signingUrl ?? result.qrPayload;
        setSigningUrl(nextUrl);
        setMode("qr");
        return;
      }

      setMode("confirm");
    } finally {
      startInFlightRef.current = false;
      setStarting(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!sessionId) return;
    await onCompleteSigning(sessionId, comment);
    setMode("idle");
    setComment("");
  }

  return (
    <PortalCard padding="md">
      <h2 className="text-base font-semibold text-gray-900">Sign document</h2>

      {document.status === "signed" ? (
        <div
          className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          <p className="font-medium">This document has been signed.</p>
          {document.signedAt ? (
            <p className="mt-2 text-green-700">Signed {new Date(document.signedAt).toLocaleString("en-GB")}</p>
          ) : null}
        </div>
      ) : null}

      {signature && document.status !== "signed" ? (
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <p>
            Provider: <span className="font-medium">{signature.provider.replace(/_/g, " ")}</span>
          </p>
          {isQrProvider && mobileStatus ? (
            <p className="mt-1">
              Status: <span className="font-medium capitalize">{statusLabel}</span>
            </p>
          ) : (
            <p className="mt-1">
              Status: <span className="font-medium capitalize">{signature.status}</span>
            </p>
          )}
          {expiresAt || signature.expiresAt ? (
            <p className="mt-1">
              QR expires {new Date(expiresAt ?? signature.expiresAt ?? "").toLocaleString("en-GB")}
            </p>
          ) : null}
        </div>
      ) : null}

      {successMessage ? (
        <p className="mt-4 text-sm text-green-700" role="status">
          {successMessage}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {document.canSign && mode === "idle" ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn btn-primary inline-flex justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2"
            onClick={() => void handleStartSigning()}
            disabled={loading || starting}
          >
            {starting ? "Starting…" : "Start signing"}
          </button>
        </div>
      ) : null}

      {mode === "qr" ? (
        <div className="mt-4 space-y-4">
          {providerMessage ? <p className="text-sm text-gray-600">{providerMessage}</p> : null}
          {qrDataUrl ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <img src={qrDataUrl} alt="QR code for mobile signing" className="size-60" />
              <p className="text-center text-sm text-gray-600">Scan with your phone to review and sign.</p>
            </div>
          ) : (
            <p className="text-sm text-amber-800" role="status">
              {qrUnavailable
                ? "Mobile signing is already in progress, but this page does not have the QR code. Cancel signing and start again to generate a new QR code."
                : "Preparing QR code…"}
            </p>
          )}
          {signingUrl ? <p className="break-all text-xs text-gray-400">{signingUrl}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            {document.canCancelSign || sessionId ? (
              <button
                type="button"
                className="btn inline-flex justify-center border border-gray-200 bg-white text-gray-700"
                onClick={() => void onCancelSigning()}
                disabled={loading || starting}
              >
                Cancel signing
              </button>
            ) : null}
            {mobileStatus === "expired" ? (
              <button
                type="button"
                className="btn btn-primary inline-flex justify-center"
                onClick={() => {
                  setMode("idle");
                  setSigningUrl(null);
                  setQrDataUrl(null);
                }}
                disabled={loading || starting}
              >
                Start over
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isQrProvider && ((document.canSign && mode === "confirm") || document.canCancelSign) ? (
        <form className="mt-4 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          {providerMessage ? <p className="text-sm text-gray-600">{providerMessage}</p> : null}
          <div>
            <label htmlFor="sign-comment" className="block text-sm font-medium text-gray-700">
              Comment (optional)
            </label>
            <textarea
              id="sign-comment"
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="btn btn-primary inline-flex justify-center" disabled={loading || !sessionId}>
              {loading ? "Signing…" : "Confirm signature"}
            </button>
            {document.canCancelSign ? (
              <button
                type="button"
                className="btn inline-flex justify-center border border-gray-200 bg-white text-gray-700"
                onClick={() => void onCancelSigning()}
                disabled={loading}
              >
                Cancel signing
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </PortalCard>
  );
}
