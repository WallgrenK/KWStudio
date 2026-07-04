import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

type FinanceLoadingMessageProps = {
  message?: string;
};

export function FinanceLoadingMessage({ message = "Loading…" }: FinanceLoadingMessageProps) {
  return (
    <p className="flex items-center gap-2 text-sm text-gray-500" role="status" aria-live="polite">
      <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      {message}
    </p>
  );
}

type FinanceErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function FinanceErrorBanner({
  message,
  onRetry,
  retryLabel = "Retry",
}: FinanceErrorBannerProps) {
  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap font-medium">{message}</p>
          {onRetry ? (
            <button
              className="btn btn-secondary mt-3 h-9 text-xs"
              type="button"
              onClick={onRetry}
            >
              {retryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type FinanceSetupBannerProps = {
  title: string;
  description: string;
  error?: string | null;
  action?: ReactNode;
};

export function FinanceSetupBanner({ title, description, error, action }: FinanceSetupBannerProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6">
      <h2 className="text-lg font-semibold text-amber-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-amber-800">{description}</p>
      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}

export type FinanceValidationItem = {
  code: string;
  message: string;
  suggested_fix?: string;
};

type FinanceValidationListProps = {
  items: FinanceValidationItem[];
  tone: "error" | "warning";
};

export function FinanceValidationList({ items, tone }: FinanceValidationListProps) {
  const listClass = tone === "error" ? "text-red-700" : "text-amber-800";

  return (
    <ul className={`space-y-2 text-sm ${listClass}`}>
      {items.map((item) => (
        <li key={`${item.code}-${item.message}`} className="rounded-lg border border-current/20 bg-white/60 p-3">
          <strong className="block">{item.code}</strong>
          <span>{item.message}</span>
          {item.suggested_fix ? <p className="mt-1 text-xs opacity-80">{item.suggested_fix}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** Simple string list for VAT/SIE inline validation messages. */
export function FinanceValidationMessageList({
  items,
  tone,
  title,
}: {
  items: string[];
  tone: "error" | "warning";
  title: string;
}) {
  if (items.length === 0) return null;

  const containerClass = tone === "error" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800";
  const headingClass = tone === "error" ? "text-red-900" : "text-amber-900";

  return (
    <div className={`rounded-lg p-3 ${containerClass}`}>
      <h3 className={`text-sm font-semibold ${headingClass}`}>{title}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
