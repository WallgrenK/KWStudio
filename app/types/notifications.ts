export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export type NotificationDto = {
  id: string;
  user_profile_id: string;
  client_id: string | null;
  project_id: string | null;
  event_type: string;
  title: string;
  message: string | null;
  severity: NotificationSeverity;
  is_read: boolean;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  timeLabel: string;
};

export type NotificationsListResponse = {
  ok: true;
  notifications: NotificationDto[];
};

export type UnreadCountResponse = {
  ok: true;
  unreadCount: number;
};
