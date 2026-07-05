import type { ReactNode } from "react";
import { Link } from "react-router";
import { PortalCard, PortalEmptyState } from "./PortalSection";

export function PortalLoadingState({ message = "Loading your portal…" }: { message?: string }) {
  return (
    <PortalCard padding="lg">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-5 animate-pulse rounded-full bg-kw-brand/20" aria-hidden="true" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </PortalCard>
  );
}

export function PortalErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <PortalCard padding="lg">
      <PortalEmptyState title={title} description={description} />
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </PortalCard>
  );
}

export function PortalAccessDeniedState({
  title = "Access denied",
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <PortalErrorState
      title={title}
      description={description}
      action={(
        <Link className="btn btn-primary" to="/login">
          Sign in
        </Link>
      )}
    />
  );
}

export function PortalNoProjectState({ firstName }: { firstName: string }) {
  return (
    <PortalCard padding="lg" className="bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-kw-brand">Welcome back, {firstName}</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          KWStudio is preparing your project space
        </h1>
        <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-base">
          Your dedicated project dashboard will appear here once your project has been set up.
          In the meantime, you can reach us anytime using the contact details below.
        </p>
      </div>
    </PortalCard>
  );
}

export function PortalDemoNotice({ label = "Preview content" }: { label?: string }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">{label}</p>
  );
}

export function PortalInlineAlert({
  tone = "warning",
  message,
}: {
  tone?: "warning" | "error" | "success";
  message: string;
}) {
  const styles = tone === "error"
    ? "border-red-100 bg-red-50 text-red-700"
    : tone === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-800"
      : "border-amber-100 bg-amber-50 text-amber-800";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`} role="status">
      {message}
    </div>
  );
}

export function PortalToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <button
          type="button"
          className="shrink-0 text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          Close
        </button>
      </div>
    </div>
  );
}
