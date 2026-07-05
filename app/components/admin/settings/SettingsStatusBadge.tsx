import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Link2,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BadgeColor } from "~/components/admin/StatusBadge";
import type { SettingsStatus } from "./settingsTypes";

type SettingsStatusConfig = {
  label: string;
  color: BadgeColor;
  icon: LucideIcon;
};

const SETTINGS_STATUS_MAP: Record<SettingsStatus, SettingsStatusConfig> = {
  configured: { label: "Configured", color: "success", icon: CheckCircle2 },
  connected: { label: "Connected", color: "success", icon: Link2 },
  missing: { label: "Missing", color: "error", icon: AlertCircle },
  needs_attention: { label: "Needs attention", color: "warning", icon: AlertTriangle },
  coming_soon: { label: "Coming soon", color: "light", icon: Clock },
  read_only: { label: "Read only", color: "info", icon: Eye },
  error: { label: "Error", color: "error", icon: AlertCircle },
};

const SETTINGS_STATUS_COLOR_STYLES: Record<BadgeColor, string> = {
  primary: "bg-[#eff6ff] text-kw-brand",
  success: "bg-green-50 text-green-700",
  error: "bg-red-50 text-red-700",
  warning: "bg-amber-50 text-amber-700",
  info: "bg-sky-50 text-sky-700",
  light: "bg-gray-100 text-gray-600",
  dark: "bg-gray-700 text-white",
  orange: "bg-orange-50 text-orange-700",
  purple: "bg-purple-50 text-purple-700",
  cyan: "bg-cyan-50 text-cyan-700",
  indigo: "bg-indigo-50 text-indigo-700",
};

export function SettingsStatusBadge({
  status,
  label: labelOverride,
}: {
  status: SettingsStatus;
  label?: string;
}) {
  const config = SETTINGS_STATUS_MAP[status];
  const label = labelOverride ?? config.label;
  const Icon = config.icon ?? Circle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${SETTINGS_STATUS_COLOR_STYLES[config.color]}`}
      aria-label={label}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

export function SettingsReadOnlyBadge() {
  return <SettingsStatusBadge status="read_only" />;
}

export function SettingsComingSoonBadge() {
  return <SettingsStatusBadge status="coming_soon" />;
}

export function SettingsLockedBadge() {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${SETTINGS_STATUS_COLOR_STYLES.light}`}
    >
      <Lock className="size-3.5 shrink-0" aria-hidden="true" />
      Locked
    </span>
  );
}
