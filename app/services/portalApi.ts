import { supabase } from "~/lib/supabase";
import type {
  ActivatePortalInvitePayload,
  CreatePortalInviteDto,
  InviteStatus,
  PortalClientDto,
  PortalContactDto,
  PortalMeDto,
  PortalProjectDto,
  UserProfileDto,
} from "~/types/portal";
import type {
  AdminProjectListItemDto,
  PortalProjectDashboardDto,
  PortalServiceDto,
  WorkflowClientActionDto,
} from "~/types/workflow";
import type {
  NotificationDto,
  NotificationsListResponse,
  UnreadCountResponse,
} from "~/types/notifications";

type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
  status?: number;
};

const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL;

export const isPortalApiConfigured = Boolean(apiUrl);

function apiNotConfigured<T>(): ApiResult<T> {
  return { ok: false, error: "API not configured. Set VITE_KWSTUDIO_API_URL." };
}

function authRequired<T>(): ApiResult<T> {
  return { ok: false, error: "Authentication required. Sign in before calling the portal API." };
}

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function requestPortalApi<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT";
    body?: unknown;
    auth?: boolean;
  } = {},
): Promise<ApiResult<T>> {
  if (!isPortalApiConfigured) return apiNotConfigured<T>();

  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.auth !== false) {
    const token = await getAccessToken();
    if (!token) return authRequired<T>();
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers,
      ...(method !== "GET" && options.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
    });

    const data = await response.json().catch(() => null) as T | { error?: string; code?: string } | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data && typeof data === "object" && "error" in data && data.error
          ? String(data.error)
          : `Portal API request failed with ${response.status}.`,
        code:
          data && typeof data === "object" && "code" in data && data.code
            ? String(data.code)
            : undefined,
      };
    }

    return { ok: true, data: data as T, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Portal API request failed.",
    };
  }
}

export function listPortalClients() {
  return requestPortalApi<{ ok: true; clients: PortalClientDto[] }>("/portal/clients");
}

export function createPortalClient(payload: {
  companyName: string;
  orgNumber?: string;
  clientSlug?: string;
  brandColor?: string;
}) {
  return requestPortalApi<{ ok: true; client: PortalClientDto }>("/portal/clients", {
    method: "POST",
    body: payload,
  });
}

export function createPortalContact(clientId: string, payload: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}) {
  return requestPortalApi<{ ok: true; contact: PortalContactDto }>(`/portal/clients/${clientId}/contacts`, {
    method: "POST",
    body: payload,
  });
}

export function createPortalProject(clientId: string, payload: {
  title: string;
  description?: string;
  serviceId: string;
  startDate?: string;
  dueDate?: string;
}) {
  return requestPortalApi<{ ok: true; project: PortalProjectDto }>(`/portal/clients/${clientId}/projects`, {
    method: "POST",
    body: payload,
  });
}

export function createPortalInvite(contactId: string) {
  return requestPortalApi<{ ok: true; invite: CreatePortalInviteDto }>(`/portal/contacts/${contactId}/invites`, {
    method: "POST",
    body: {},
  });
}

export function getPortalInviteStatus(contactId: string) {
  return requestPortalApi<{ ok: true; status: InviteStatus }>(`/portal/contacts/${contactId}/invite-status`);
}

export function bootstrapAdminProfile() {
  return requestPortalApi<{ ok: true; profile: UserProfileDto }>("/portal/admin/bootstrap-profile", {
    method: "POST",
    body: {},
  });
}

export function getUserProfile() {
  return requestPortalApi<{ ok: true; profile: UserProfileDto | null }>("/portal/profile");
}

export function getPortalMe() {
  return requestPortalApi<PortalMeDto & { ok: true }>("/portal/me");
}

export function getPortalProjects() {
  return requestPortalApi<{ ok: true; projects: PortalProjectDto[] }>("/portal/projects");
}

export function activatePortalInvite(token: string, payload: ActivatePortalInvitePayload) {
  return requestPortalApi<{ ok: true; email: string; contactId: string; clientId: string }>(
    `/portal/invites/${encodeURIComponent(token)}/activate`,
    {
      method: "POST",
      auth: false,
      body: payload,
    },
  );
}

export function lookupPortalInvite(token: string) {
  return requestPortalApi<{
    ok: boolean;
    status: string;
    email?: string;
    expiresAt?: string;
    error?: string;
  }>(`/portal/invites/${encodeURIComponent(token)}`, { auth: false });
}

export function getPortalProjectDashboard(projectId: string) {
  return requestPortalApi<PortalProjectDashboardDto>(`/portal/projects/${projectId}/dashboard`);
}

export function completePortalClientAction(projectId: string, actionId: string) {
  return requestPortalApi<{ ok: true; action: WorkflowClientActionDto }>(
    `/portal/projects/${projectId}/client-actions/${actionId}/complete`,
    { method: "POST", body: {} },
  );
}

export function listPortalServices() {
  return requestPortalApi<{ ok: true; services: PortalServiceDto[] }>("/portal/admin/services");
}

export function listAdminProjects() {
  return requestPortalApi<{ ok: true; projects: AdminProjectListItemDto[] }>("/portal/admin/projects");
}

export function getAdminProjectDashboard(projectId: string) {
  return requestPortalApi<PortalProjectDashboardDto>(`/portal/admin/projects/${projectId}/dashboard`);
}

export function advanceProjectPhase(projectId: string) {
  return requestPortalApi<{ ok: true }>(`/portal/admin/projects/${projectId}/workflow/advance-phase`, {
    method: "POST",
    body: {},
  });
}

export function updateProjectStatus(projectId: string, status: string) {
  return requestPortalApi<{ ok: true }>(`/portal/admin/projects/${projectId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function createProjectMilestone(projectId: string, payload: { title: string; description?: string }) {
  return requestPortalApi<{ ok: true }>(`/portal/admin/projects/${projectId}/milestones`, {
    method: "POST",
    body: payload,
  });
}

export function completeProjectMilestone(projectId: string, milestoneId: string) {
  return requestPortalApi<{ ok: true }>(`/portal/admin/projects/${projectId}/milestones/${milestoneId}/complete`, {
    method: "POST",
    body: {},
  });
}

export function createProjectClientAction(projectId: string, payload: {
  title: string;
  description?: string;
  actionType?: string;
}) {
  return requestPortalApi<{ ok: true }>(`/portal/admin/projects/${projectId}/client-actions`, {
    method: "POST",
    body: payload,
  });
}

export function completeProjectClientActionAdmin(projectId: string, actionId: string) {
  return requestPortalApi<{ ok: true }>(`/portal/admin/projects/${projectId}/client-actions/${actionId}/complete`, {
    method: "POST",
    body: {},
  });
}

export function initProjectWorkflow(projectId: string, templateId?: string) {
  const query = templateId ? `?templateId=${encodeURIComponent(templateId)}` : "";
  return requestPortalApi<{ ok: true }>(`/portal/admin/projects/${projectId}/workflow/init${query}`, {
    method: "POST",
    body: {},
  });
}

export function getNotifications() {
  return requestPortalApi<NotificationsListResponse>("/portal/notifications");
}

export function getUnreadNotificationCount() {
  return requestPortalApi<UnreadCountResponse>("/portal/notifications/unread-count");
}

export function markNotificationRead(notificationId: string) {
  return requestPortalApi<{ ok: true; notification: NotificationDto }>(
    `/portal/notifications/${notificationId}/read`,
    { method: "POST", body: {} },
  );
}

export function markAllNotificationsRead() {
  return requestPortalApi<{ ok: true; updatedCount: number }>("/portal/notifications/read-all", {
    method: "POST",
    body: {},
  });
}
