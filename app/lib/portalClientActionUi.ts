import type { ActionType, DueStatus } from "~/types/workflow";

export function formatDueStatusLabel(dueStatus: DueStatus, dueDate: string | null): string | undefined {
  if (dueStatus === "completed") return "Completed";
  if (dueStatus === "due_today") return "Due today";
  if (dueStatus === "overdue") return "Overdue";
  if (dueStatus === "upcoming" && dueDate) {
    return `Due ${new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  }
  if (dueStatus === "upcoming") return "Upcoming";
  return undefined;
}

export function formatActionStatusLabel(status: string): string {
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  if (status === "open") return "Open";
  if (status === "cancelled") return "Cancelled";
  return status.replace(/_/g, " ");
}

export function formatPriorityLabel(priority: string): string {
  if (priority === "low") return "Low";
  if (priority === "high") return "High";
  return "Normal";
}

export function formatActionTypeLabel(actionType: ActionType): string {
  return actionType.charAt(0).toUpperCase() + actionType.slice(1);
}

export function formatEstimatedTime(minutes: number | null | undefined): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatCreatedDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const ACTION_TYPE_STYLES: Record<ActionType, { badge: string; icon: string }> = {
  task: { badge: "bg-slate-100 text-slate-700", icon: "text-slate-600" },
  upload: { badge: "bg-sky-100 text-sky-800", icon: "text-sky-700" },
  approval: { badge: "bg-emerald-100 text-emerald-800", icon: "text-emerald-700" },
  review: { badge: "bg-violet-100 text-violet-800", icon: "text-violet-700" },
  meeting: { badge: "bg-amber-100 text-amber-900", icon: "text-amber-800" },
  payment: { badge: "bg-rose-100 text-rose-800", icon: "text-rose-700" },
};

export const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-kw-brand/10 text-kw-brand",
  high: "bg-orange-100 text-orange-800",
};

export const DUE_STATUS_STYLES: Record<DueStatus, string> = {
  no_due_date: "text-gray-500",
  upcoming: "text-gray-600",
  due_today: "text-amber-700",
  overdue: "text-red-700",
  completed: "text-emerald-700",
};
