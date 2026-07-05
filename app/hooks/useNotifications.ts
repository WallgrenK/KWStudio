import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  isPortalApiConfigured,
  markAllNotificationsRead,
  markNotificationRead,
} from "~/services/portalApi";
import type { NotificationDto } from "~/types/notifications";

type UseNotificationsOptions = {
  enabled?: boolean;
};

export function useNotifications(options: UseNotificationsOptions = {}) {
  const enabled = options.enabled ?? true;
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !isPortalApiConfigured) return;

    setLoading(true);
    setError(null);

    const [listResult, countResult] = await Promise.all([
      getNotifications(),
      getUnreadNotificationCount(),
    ]);

    if (listResult.ok && listResult.data) {
      setNotifications(listResult.data.notifications);
    } else {
      setNotifications([]);
      setError(listResult.error ?? "Could not load notifications.");
    }

    if (countResult.ok && countResult.data) {
      setUnreadCount(countResult.data.unreadCount);
    } else if (!listResult.ok) {
      setUnreadCount(0);
    }

    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const markRead = useCallback(async (notificationId: string) => {
    const result = await markNotificationRead(notificationId);
    if (result.ok) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, is_read: true, read_at: new Date().toISOString() } : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    }
    return result;
  }, []);

  const markAllRead = useCallback(async () => {
    const result = await markAllNotificationsRead();
    if (result.ok) {
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true, read_at: item.read_at ?? new Date().toISOString() })),
      );
      setUnreadCount(0);
    }
    return result;
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
  };
}
