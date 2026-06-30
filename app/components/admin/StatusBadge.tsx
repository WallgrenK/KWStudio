import type { ReactNode } from "react";
import type { AdminStatus } from "~/data/admin";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children: ReactNode;
};

const toneByStatus: Record<AdminStatus, BadgeColor> = {
  New: "primary",
  Qualified: "primary",
  "In review": "warning",
  Active: "success",
  Scheduled: "info",
  Pending: "warning",
  Paid: "success",
  Overdue: "error",
  Draft: "light",
  Live: "success",
  Won: "success",
  Done: "success",
  Blocked: "error",
};

export function Badge({
  variant = "light",
  size = "md",
  color = "primary",
  startIcon,
  endIcon,
  children,
}: BadgeProps) {
  const baseStyles = "inline-flex items-center justify-center gap-1 rounded-full font-medium px-2.5 py-0.5";
  const sizeStyles: Record<BadgeSize, string> = {
    sm: "text-xs",
    md: "text-sm",
  };
  const variants: Record<BadgeVariant, Record<BadgeColor, string>> = {
    light: {
      primary: "bg-[#eff6ff] text-[#2E75BD]",
      success: "bg-green-50 text-green-600",
      error: "bg-red-50 text-red-600",
      warning: "bg-amber-50 text-amber-600",
      info: "bg-sky-50 text-sky-600",
      light: "bg-gray-100 text-gray-700",
      dark: "bg-gray-500 text-white",
    },
    solid: {
      primary: "bg-[#2E75BD] text-white",
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-amber-500 text-white",
      info: "bg-sky-500 text-white",
      light: "bg-gray-400 text-white",
      dark: "bg-gray-700 text-white",
    },
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variants[variant][color]}`}>
      {startIcon ? <span className="mr-1">{startIcon}</span> : null}
      {children}
      {endIcon ? <span className="ml-1">{endIcon}</span> : null}
    </span>
  );
}

export function StatusBadge({ status }: { status: AdminStatus }) {
  return <Badge color={toneByStatus[status]}>{status}</Badge>;
}
