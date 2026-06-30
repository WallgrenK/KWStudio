import { Activity, ArrowDown, ArrowUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "~/components/admin/StatusBadge";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
};

export function StatCard({ label, value, change, icon: Icon = Activity, trend = "neutral" }: StatCardProps) {
  const TrendIcon = trend === "down" ? ArrowDown : ArrowUp;
  const badgeColor = trend === "down" ? "error" : trend === "up" ? "success" : "light";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
        <Icon className="size-6 text-gray-800" />
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm text-gray-500">{label}</span>
          <h4 className="mt-2 text-2xl font-bold text-gray-800">{value}</h4>
        </div>
        <Badge color={badgeColor} startIcon={trend !== "neutral" ? <TrendIcon size={14} aria-hidden="true" /> : null}>
          {change}
        </Badge>
      </div>
    </div>
  );
}
