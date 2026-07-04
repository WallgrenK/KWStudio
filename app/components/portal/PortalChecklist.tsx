import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
  Eye,
  ListTodo,
  Lock,
  Upload,
} from "lucide-react";
import type { PortalChecklistItem, PortalChecklistMeta } from "~/data/portalDashboard";
import {
  ACTION_TYPE_STYLES,
  DUE_STATUS_STYLES,
  formatActionStatusLabel,
  formatActionTypeLabel,
  formatCreatedDate,
  formatEstimatedTime,
  formatPriorityLabel,
  PRIORITY_STYLES,
} from "~/lib/portalClientActionUi";
import type { ActionType } from "~/types/workflow";
import { PortalCard, PortalEmptyState } from "./PortalSection";

const ACTION_TYPE_ICONS: Record<ActionType, typeof ListTodo> = {
  task: ListTodo,
  upload: Upload,
  approval: BadgeCheck,
  review: Eye,
  meeting: Calendar,
  payment: CreditCard,
};

type PortalChecklistProps = {
  items: PortalChecklistItem[];
  meta: PortalChecklistMeta;
  onComplete?: (itemId: string) => void;
  completingId?: string | null;
  actionError?: string | null;
  failedActionId?: string | null;
};

function StatusIndicator({ item }: { item: PortalChecklistItem }) {
  if (item.completed) {
    return (
      <span
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[#2E75BD] bg-[#2E75BD] text-white"
        aria-hidden="true"
      >
        <Check className="size-3" />
      </span>
    );
  }

  if (item.isLocked) {
    return (
      <span
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-gray-400"
        aria-hidden="true"
      >
        <Lock className="size-3" />
      </span>
    );
  }

  return (
    <span
      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
        item.status === "in_progress"
          ? "border-[#2E75BD] bg-[#2E75BD]/10"
          : "border-gray-300 bg-white"
      }`}
      aria-hidden="true"
    >
      {item.status === "in_progress" ? (
        <span className="size-2 rounded-full bg-[#2E75BD]" />
      ) : null}
    </span>
  );
}

function ChecklistRow({
  item,
  expanded,
  onToggle,
  onComplete,
  completingId,
  actionError,
  failedActionId,
}: {
  item: PortalChecklistItem;
  expanded: boolean;
  onToggle: () => void;
  onComplete?: (itemId: string) => void;
  completingId?: string | null;
  actionError?: string | null;
  failedActionId?: string | null;
}) {
  const TypeIcon = ACTION_TYPE_ICONS[item.actionType];
  const typeStyles = ACTION_TYPE_STYLES[item.actionType];
  const canComplete = !item.completed && !item.isLocked && onComplete;
  const isCompleting = completingId === item.id;
  const estimatedTime = formatEstimatedTime(item.estimatedMinutes);
  const createdDate = formatCreatedDate(item.createdAt);

  return (
    <li className="rounded-xl border border-gray-100 bg-white/80">
      <div className="flex items-start gap-3 px-3 py-3 sm:px-4">
        <StatusIndicator item={item} />
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="flex w-full items-start justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2 rounded-lg"
            aria-expanded={expanded}
            aria-controls={`checklist-panel-${item.id}`}
            onClick={onToggle}
          >
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  item.completed ? "text-gray-400 line-through" : "text-gray-900"
                }`}
              >
                {item.label}
              </p>
              {!expanded && item.description ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{item.description}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                  {formatActionStatusLabel(item.status)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${typeStyles.badge}`}>
                  <span className="inline-flex items-center gap-1">
                    <TypeIcon className={`size-3 ${typeStyles.icon}`} aria-hidden="true" />
                    {formatActionTypeLabel(item.actionType)}
                  </span>
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[item.priority]}`}>
                  {formatPriorityLabel(item.priority)}
                </span>
                {item.dueLabel ? (
                  <span className={`text-[11px] font-medium ${DUE_STATUS_STYLES[item.dueStatus]}`}>
                    {item.dueLabel}
                  </span>
                ) : null}
              </div>
            </div>
            <ChevronDown
              className={`mt-0.5 size-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          <div
            id={`checklist-panel-${item.id}`}
            hidden={!expanded}
            className="mt-3 space-y-3 border-t border-gray-100 pt-3"
          >
            {item.description ? (
              <p className="text-sm leading-6 text-gray-600">{item.description}</p>
            ) : null}

            <dl className="grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
              {estimatedTime ? (
                <div>
                  <dt className="font-medium text-gray-700">Estimated time</dt>
                  <dd>{estimatedTime}</dd>
                </div>
              ) : null}
              {createdDate ? (
                <div>
                  <dt className="font-medium text-gray-700">Created</dt>
                  <dd>{createdDate}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-medium text-gray-700">Action type</dt>
                <dd className="capitalize">{item.actionType}</dd>
              </div>
              {item.completedAt ? (
                <div>
                  <dt className="font-medium text-gray-700">Completed</dt>
                  <dd>{formatCreatedDate(item.completedAt)}</dd>
                </div>
              ) : null}
            </dl>

            {item.isLocked && !item.completed && item.lockedReason ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <p>{item.lockedReason}</p>
              </div>
            ) : null}

            {canComplete ? (
              <div className="space-y-2">
                <button
                  className="inline-flex items-center justify-center rounded-lg bg-[#2E75BD] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563a8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={isCompleting}
                  aria-label={`Complete ${item.label}`}
                  onClick={() => onComplete(item.id)}
                >
                  {isCompleting ? "Completing…" : "Complete"}
                </button>
                {failedActionId === item.id && actionError ? (
                  <p className="text-xs text-red-600" role="alert">{actionError}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export function PortalChecklist({
  items,
  meta,
  onComplete,
  completingId,
  actionError,
  failedActionId,
}: PortalChecklistProps) {
  const [expandedId, setExpandedId] = useState<string | null>(failedActionId ?? null);

  useEffect(() => {
    if (failedActionId) setExpandedId(failedActionId);
  }, [failedActionId]);

  if (meta.state === "empty") {
    return (
      <PortalCard>
        <PortalEmptyState
          title="No actions yet"
          description="You don't have any pending actions."
        />
      </PortalCard>
    );
  }

  if (meta.state === "all_completed") {
    return (
      <PortalCard className="border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f6fff9_100%)]">
        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-emerald-900">Everything is completed!</p>
          <p className="mt-1 text-sm text-emerald-800">
            We&apos;ll continue working on your project.
          </p>
        </div>
        <ul className="space-y-3">
          {items.map((item) => (
            <ChecklistRow
              key={item.id}
              item={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
            />
          ))}
        </ul>
      </PortalCard>
    );
  }

  return (
    <PortalCard className="border-[#2E75BD]/15 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)]">
      <ul className="space-y-3">
        {items.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
            onComplete={onComplete}
            completingId={completingId}
            actionError={actionError}
            failedActionId={failedActionId}
          />
        ))}
      </ul>
    </PortalCard>
  );
}
