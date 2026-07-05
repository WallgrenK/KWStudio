import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import {
  SignatureCanvas,
  describeSignatureCanvasValidation,
  isSignatureCanvasValueValid,
  type SignatureCanvasHandle,
  type SignatureCanvasValue,
} from "~/components/portal/SignatureCanvas";
import { isPortalApiConfigured } from "~/services/portalApi";
import {
  completeMobileSigningSession,
  getMobileSigningSession,
  openMobileSigningSession,
} from "~/services/documentsApi";
import type { MobileSigningSessionDto } from "~/types/documents";

type PageState = "loading" | "ready" | "signing" | "success" | "invalid" | "expired" | "completed" | "error";

function truncateHash(value: string | null | undefined): string {
  if (!value) return "—";
  if (value.length <= 16) return value;
  return `${value.slice(0, 8)}…${value.slice(-8)}`;
}

function formatCompleteError(message: string | undefined, code: string | undefined): string {
  if (message?.trim()) return message;
  switch (code) {
    case "terms_not_accepted":
      return "You must accept the terms before signing.";
    case "signature_missing":
      return "Please provide your signature.";
    case "signature_too_small":
      return "Signature is too small. Please draw a larger signature.";
    case "token_expired":
      return "Signing link has expired.";
    case "token_used":
      return "Signing link has already been used.";
    case "token_invalid":
      return "Invalid signing link.";
    case "session_inactive":
      return "This signing session is no longer active.";
    case "document_unavailable":
      return "This document is not available for signing.";
    case "version_mismatch":
      return "The document version changed. Start signing again from your computer.";
    case "storage_unavailable":
      return "Signature storage is unavailable. Contact support.";
    default:
      return "Could not complete signing.";
  }
}

export default function MobileSigningPage() {
  const { token = "" } = useParams();
  const signatureCanvasRef = useRef<SignatureCanvasHandle | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [session, setSession] = useState<MobileSigningSessionDto | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signatureValue, setSignatureValue] = useState<SignatureCanvasValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSession = useCallback(async () => {
    if (!token) {
      setPageState("invalid");
      return;
    }
    if (!isPortalApiConfigured) {
      setError("Signing service is not configured.");
      setPageState("error");
      return;
    }

    setPageState("loading");
    const opened = await openMobileSigningSession(token);
    const result = opened.ok ? opened : await getMobileSigningSession(token);

    if (!result.ok || !result.data?.session) {
      setError(result.error ?? "Invalid signing link.");
      setPageState(result.error?.toLowerCase().includes("expired") ? "expired" : "invalid");
      return;
    }

    const payload = result.data.session;
    setSession(payload);

    if (payload.status === "completed") {
      setPageState("completed");
      return;
    }
    if (payload.status === "expired") {
      setPageState("expired");
      return;
    }
    if (payload.status === "cancelled") {
      setPageState("invalid");
      setError("This signing session was cancelled.");
      return;
    }

    setPageState("ready");
  }, [token]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token || !acceptedTerms) {
      setError("You must accept the terms before signing.");
      return;
    }

    const currentSignature = signatureCanvasRef.current?.getValue() ?? signatureValue;
    if (!isSignatureCanvasValueValid(currentSignature)) {
      setError(describeSignatureCanvasValidation(currentSignature));
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await completeMobileSigningSession(token, {
      termsAccepted: true,
      signatureSvg: currentSignature.svg,
    });
    setSubmitting(false);

    if (result.ok) {
      setPageState("success");
      return;
    }

    setError(formatCompleteError(result.error, result.code));
    setPageState("ready");
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-[#2E75BD]">KWStudio Signing</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">Sign document</h1>
        </header>

        {pageState === "loading" ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            Loading signing session…
          </div>
        ) : null}

        {pageState === "success" || pageState === "completed" ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-950/40" role="status">
            <p className="text-lg font-semibold text-green-900 dark:text-green-100">Signature recorded</p>
            <p className="mt-2 text-sm text-green-800 dark:text-green-200">
              {session?.documentTitle ? `Thank you for signing “${session.documentTitle}”.` : "Thank you."}
            </p>
            <p className="mt-4 text-sm text-green-700 dark:text-green-300">You can close this page.</p>
          </div>
        ) : null}

        {pageState === "invalid" || pageState === "expired" || pageState === "error" ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40" role="alert">
            <p className="font-semibold text-red-900 dark:text-red-100">
              {pageState === "expired" ? "Signing link expired" : "Signing unavailable"}
            </p>
            <p className="mt-2 text-sm text-red-800 dark:text-red-200">{error ?? "This signing link is not valid."}</p>
            {pageState === "expired" ? (
              <p className="mt-4 text-sm text-red-700 dark:text-red-300">
                Return to your computer and start signing again to get a new QR code.
              </p>
            ) : null}
          </div>
        ) : null}

        {pageState === "ready" && session ? (
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Review summary</h2>
              <dl className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400">Document</dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">{session.documentTitle}</dd>
                </div>
                {session.clientName ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-400">Client</dt>
                    <dd className="font-medium">{session.clientName}</dd>
                  </div>
                ) : null}
                {session.projectTitle ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-400">Project</dt>
                    <dd className="font-medium">{session.projectTitle}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-400">Signer</dt>
                  <dd className="font-medium">
                    {session.signerName} ({session.signerEmail})
                  </dd>
                </div>
                {session.documentVersionNumber ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-400">Version</dt>
                    <dd>v{session.documentVersionNumber}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Draw signature</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Use your finger, stylus, or mouse to sign in the box below.
              </p>
              <div className="mt-4">
                <SignatureCanvas
                  ref={signatureCanvasRef}
                  disabled={submitting}
                  onChange={setSignatureValue}
                  className="w-full"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Verification</h3>
              <dl className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between gap-3">
                  <dt>Document hash</dt>
                  <dd className="font-mono">{truncateHash(session.documentContentHash)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>PDF hash</dt>
                  <dd className="font-mono">{truncateHash(session.pdfContentHash)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Expires</dt>
                  <dd>{new Date(session.expiresAt).toLocaleString("en-GB")}</dd>
                </div>
              </dl>
            </section>

            <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              <input
                type="checkbox"
                className="mt-1"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
              />
              <span>
                I confirm that I have reviewed this document summary and agree to sign electronically using QR/mobile signing.
              </span>
            </label>

            {error ? <p className="text-sm text-red-700 dark:text-red-300">{error}</p> : null}

            <button
              type="submit"
              className="btn btn-primary w-full justify-center"
              disabled={submitting || !acceptedTerms || !isSignatureCanvasValueValid(signatureValue)}
            >
              {submitting ? "Signing…" : "Sign document"}
            </button>
          </form>
        ) : null}

        <p className="mt-8 text-center text-xs text-gray-400">
          Secure mobile signing ·{" "}
          <Link to="/login" className="text-[#2E75BD] hover:underline">
            Portal login
          </Link>
        </p>
      </div>
    </div>
  );
}
