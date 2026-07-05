import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useNotifications } from "~/hooks/useNotifications";
import { isPortalApiConfigured } from "~/services/portalApi";
import type { NotificationDto, NotificationSeverity } from "~/types/notifications";

const SEVERITY_STYLES: Record<NotificationSeverity, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "text-[#2E75BD] bg-[#2E75BD]/10" },
  success: { icon: CheckCircle2, className: "text-emerald-700 bg-emerald-100" },
  warning: { icon: AlertTriangle, className: "text-amber-700 bg-amber-100" },
  critical: { icon: AlertOctagon, className: "text-red-700 bg-red-100" },
};

type NotificationBellProps = {
  audience: "admin" | "client";
  enabled?: boolean;
};

function projectHref(audience: NotificationBellProps["audience"], projectId: string | null): string | null {
  if (!projectId) return null;
  return audience === "admin"
    ? `/admin/projects/${projectId}`
    : `/portal/dashboard?projectId=${encodeURIComponent(projectId)}`;
}

function NotificationItem({
  notification,
  audience,
  onSelect,
}: {
  notification: NotificationDto;
  audience: NotificationBellProps["audience"];
  onSelect: (notification: NotificationDto, shouldNavigate?: boolean) => void;
}) {
  const severity = SEVERITY_STYLES[notification.severity] ?? SEVERITY_STYLES.info;
  const Icon = severity.icon;
  const href = projectHref(audience, notification.project_id);

  const content = (
    <>
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${severity.className}`}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className="block min-w-0 flex-1">
            <span className="block text-sm font-medium text-gray-900">{notification.title}</span>
            {notification.message ? (
              <span className="mt-0.5 block text-sm text-gray-500">{notification.message}</span>
            ) : null}
            <span className="mt-1 block text-xs text-gray-400">{notification.timeLabel}</span>
          </span>
          {!notification.is_read ? (
            <span className="mt-1 size-2 shrink-0 rounded-full bg-[#2E75BD]" aria-label="Unread" />
          ) : null}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <li>
        <Link
          to={href}
          className="flex gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40"
          onClick={() => void onSelect(notification, false)}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className="flex w-full gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40"
        onClick={() => void onSelect(notification, true)}
      >
        {content}
      </button>
    </li>
  );
}

export function NotificationBell({ audience, enabled = true }: NotificationBellProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, error, refresh, markRead, markAllRead } = useNotifications({
    enabled: enabled && isPortalApiConfigured,
  });

  useEffect(() => {
    const node = detailsRef.current;
    if (!node) return;

    const handleToggle = () => {
      if (node.open) void refresh();
    };

    node.addEventListener("toggle", handleToggle);
    return () => node.removeEventListener("toggle", handleToggle);
  }, [refresh]);

  async function handleSelect(notification: NotificationDto, shouldNavigate = true) {
    if (!notification.is_read) {
      await markRead(notification.id);
    }

    detailsRef.current?.removeAttribute("open");

    if (shouldNavigate) {
      const href = projectHref(audience, notification.project_id);
      if (href) navigate(href);
    }
  }

  if (!isPortalApiConfigured) return null;

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className="relative flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2 md:size-11"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 z-10 flex min-w-[18px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
        <Bell className="size-5" aria-hidden="true" />
      </summary>

      <div className="absolute right-0 z-[100000] mt-2 flex w-[min(92vw,22rem)] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg sm:w-[22rem]">
        <div className="mb-2 flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-xs font-medium text-[#2E75BD] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40"
              onClick={() => void markAllRead()}
            >
              Mark all read
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className="px-3 py-6 text-sm text-gray-500">Loading notifications…</p>
        ) : error ? (
          <p className="px-3 py-6 text-sm text-red-600" role="alert">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-gray-500">No notifications.</p>
        ) : (
          <ul className="max-h-[24rem] space-y-1 overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                audience={audience}
                onSelect={handleSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
