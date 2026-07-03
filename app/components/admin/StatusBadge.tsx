import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowDown,
  BadgeCheck,
  Ban,
  Banknote,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  FileText,
  MessageCircle,
  Minus,
  MinusCircle,
  RefreshCw,
  Search,
  Send,
  Star,
  Trophy,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Badge color palette ────────────────────────────────────────────────────

export type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "orange"
  | "purple"
  | "cyan"
  | "indigo";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";

type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children: ReactNode;
};

// ─── Badge (generic, backwards-compatible) ──────────────────────────────────
// Used by StatCard for trend indicators and anywhere a fully custom badge is needed.

const BADGE_LIGHT_COLORS: Record<BadgeColor, string> = {
  primary: "bg-[#eff6ff] text-[#2E75BD]",
  success: "bg-green-50 text-green-600",
  error:   "bg-red-50 text-red-600",
  warning: "bg-amber-50 text-amber-600",
  info:    "bg-sky-50 text-sky-600",
  light:   "bg-gray-100 text-gray-700",
  dark:    "bg-gray-500 text-white",
  orange:  "bg-orange-50 text-orange-600",
  purple:  "bg-purple-50 text-purple-700",
  cyan:    "bg-cyan-50 text-cyan-700",
  indigo:  "bg-indigo-50 text-indigo-700",
};

const BADGE_SOLID_COLORS: Record<BadgeColor, string> = {
  primary: "bg-[#2E75BD] text-white",
  success: "bg-green-500 text-white",
  error:   "bg-red-500 text-white",
  warning: "bg-amber-500 text-white",
  info:    "bg-sky-500 text-white",
  light:   "bg-gray-400 text-white",
  dark:    "bg-gray-700 text-white",
  orange:  "bg-orange-500 text-white",
  purple:  "bg-purple-500 text-white",
  cyan:    "bg-cyan-500 text-white",
  indigo:  "bg-indigo-500 text-white",
};

export function Badge({
  variant = "light",
  size = "md",
  color = "primary",
  startIcon,
  endIcon,
  children,
}: BadgeProps) {
  const colors = variant === "solid" ? BADGE_SOLID_COLORS : BADGE_LIGHT_COLORS;
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full font-medium px-2.5 py-0.5 ${
        size === "sm" ? "text-xs" : "text-sm"
      } ${colors[color]}`}
    >
      {startIcon ? <span className="mr-1">{startIcon}</span> : null}
      {children}
      {endIcon ? <span className="ml-1">{endIcon}</span> : null}
    </span>
  );
}

// ─── StatusBadge — the shared status indicator component ────────────────────

type StatusConfig = {
  label: string;
  color: BadgeColor;
  icon: LucideIcon;
};

// Normalize any status string to a consistent lookup key.
// "In review" → "in_review", "partially_reimbursed" → "partially_reimbursed"
function normalizeKey(status: string): string {
  return status.toLowerCase().replace(/[\s-]+/g, "_");
}

// Auto-format an unknown status key to sentence-case for display.
// "owner_private" → "Owner private"
function autoLabel(status: string): string {
  const spaced = status.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Complete status registry — keys are always lowercase_underscore.
// Unknown statuses fall back to a neutral gray badge with an auto-formatted label.
const STATUS_MAP: Record<string, StatusConfig> = {
  // Finance — owner expenses
  draft:                { label: "Draft",                color: "light",   icon: Circle },
  posted:               { label: "Posted",               color: "primary", icon: CheckCircle2 },
  partially_reimbursed: { label: "Partially reimbursed", color: "orange",  icon: Clock },
  reimbursed:           { label: "Reimbursed",           color: "success", icon: BadgeCheck },
  cancelled:            { label: "Cancelled",            color: "error",   icon: Ban },

  // Finance — VAT periods
  open:       { label: "Open",       color: "info",    icon: Circle },
  locked:     { label: "Locked",     color: "warning", icon: Eye },
  submitted:  { label: "Submitted",  color: "primary", icon: Send },
  closed:     { label: "Closed",     color: "success", icon: Archive },

  // Finance — transactions / receipts
  pending:          { label: "Pending",          color: "warning", icon: Clock },
  processing:       { label: "Processing",       color: "indigo",  icon: RefreshCw },
  matched:          { label: "Matched",          color: "success", icon: CheckCircle2 },
  unmatched:        { label: "Unmatched",        color: "warning", icon: AlertCircle },
  review:           { label: "Review",           color: "warning", icon: Eye },
  in_review:        { label: "In review",        color: "warning", icon: Eye },
  ready:            { label: "Ready",            color: "primary", icon: CheckCircle2 },
  missing_receipt:  { label: "Missing receipt",  color: "error",   icon: AlertCircle },
  suggested:        { label: "Suggested",        color: "info",    icon: Star },

  // General lifecycle
  active:     { label: "Active",     color: "success", icon: CheckCircle2 },
  inactive:   { label: "Inactive",   color: "light",   icon: MinusCircle },
  completed:  { label: "Completed",  color: "success", icon: CheckCircle2 },
  failed:     { label: "Failed",     color: "error",   icon: AlertCircle },
  paid:       { label: "Paid",       color: "success", icon: Banknote },
  unpaid:     { label: "Unpaid",     color: "light",   icon: MinusCircle },
  overdue:    { label: "Overdue",    color: "error",   icon: AlertTriangle },
  done:       { label: "Done",       color: "success", icon: CheckCircle2 },
  live:       { label: "Live",       color: "success", icon: CheckCircle2 },
  scheduled:  { label: "Scheduled",  color: "info",    icon: Clock },
  blocked:    { label: "Blocked",    color: "error",   icon: Ban },
  archived:   { label: "Archived",   color: "light",   icon: Archive },
  new:        { label: "New",        color: "primary", icon: Circle },

  // Leads / CRM pipeline
  researching:   { label: "Researching",   color: "light",   icon: Search },
  contacted:     { label: "Contacted",     color: "cyan",    icon: MessageCircle },
  qualified:     { label: "Qualified",     color: "purple",  icon: Star },
  proposal:      { label: "Proposal",      color: "warning", icon: FileText },
  proposal_sent: { label: "Proposal sent", color: "indigo",  icon: Send },
  won:           { label: "Won",           color: "success", icon: Trophy },
  lost:          { label: "Lost",          color: "error",   icon: XCircle },

  // Priority levels
  high:   { label: "High",   color: "error",   icon: AlertTriangle },
  medium: { label: "Medium", color: "warning", icon: Minus },
  low:    { label: "Low",    color: "success", icon: ArrowDown },
};

// Color styles for StatusBadge (slightly more padded than Badge for readability)
const STATUS_COLOR_STYLES: Record<BadgeColor, string> = {
  primary: "bg-[#eff6ff] text-[#2E75BD]",
  success: "bg-green-50 text-green-700",
  error:   "bg-red-50 text-red-700",
  warning: "bg-amber-50 text-amber-700",
  info:    "bg-sky-50 text-sky-700",
  light:   "bg-gray-100 text-gray-600",
  dark:    "bg-gray-700 text-white",
  orange:  "bg-orange-50 text-orange-700",
  purple:  "bg-purple-50 text-purple-700",
  cyan:    "bg-cyan-50 text-cyan-700",
  indigo:  "bg-indigo-50 text-indigo-700",
};

/**
 * StatusBadge — unified status indicator for all admin tables and panels.
 *
 * Accepts any status string (snake_case or Title Case).
 * Automatically resolves label, color, and icon from the STATUS_MAP.
 * Unknown statuses render as a neutral gray badge with auto-formatted label.
 *
 * @example
 *   <StatusBadge status="draft" />
 *   <StatusBadge status="partially_reimbursed" />
 *   <StatusBadge status="Won" />
 *   <StatusBadge status="proposal_sent" label="Sent" />
 */
export function StatusBadge({
  status,
  label: labelOverride,
}: {
  status: string;
  label?: string;
}) {
  const key = normalizeKey(status);
  const config = STATUS_MAP[key];

  const label = labelOverride ?? config?.label ?? autoLabel(status);
  const color = config?.color ?? "light";
  const Icon = config?.icon ?? Circle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ease-in-out ${STATUS_COLOR_STYLES[color]}`}
      aria-label={label}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
