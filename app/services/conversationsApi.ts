import { supabase } from "~/lib/supabase";
import { isPortalApiConfigured } from "~/services/portalApi";
import type { ConversationDetailDto, ConversationDto } from "~/types/conversations";

export { isPortalApiConfigured as isConversationsApiConfigured };

type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
};

const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL;

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function requestConversationsApi<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
): Promise<ApiResult<T>> {
  if (!apiUrl) return { ok: false, error: "API not configured." };

  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Authentication required." };

  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const init: RequestInit = { method, headers };
  if (method !== "GET" && options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, init);
    const data = await response.json().catch(() => null) as T | { error?: string } | null;
    if (!response.ok) {
      return {
        ok: false,
        error: (data && typeof data === "object" && "error" in data && typeof data.error === "string")
          ? data.error
          : `Request failed (${response.status})`,
        status: response.status,
      };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error." };
  }
}

export async function listAdminProjectConversations(projectId: string) {
  return requestConversationsApi<{ conversations: ConversationDto[] }>(
    `/portal/admin/projects/${projectId}/conversations`,
  );
}

export async function listPortalProjectConversations(projectId: string) {
  return requestConversationsApi<{ conversations: ConversationDto[] }>(
    `/portal/projects/${projectId}/conversations`,
  );
}

export async function listAdminGlobalConversations(limit = 50) {
  return requestConversationsApi<{ conversations: ConversationDto[] }>(
    `/portal/admin/conversations?limit=${limit}`,
  );
}

export async function getAdminConversation(conversationId: string) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/admin/conversations/${conversationId}`,
  );
}

export async function getPortalConversation(conversationId: string) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/conversations/${conversationId}`,
  );
}

export async function sendAdminMessage(
  conversationId: string,
  body: string,
  parentMessageId?: string | null,
) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/admin/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: { body, parentMessageId: parentMessageId ?? null },
    },
  );
}

export async function sendPortalMessage(
  conversationId: string,
  body: string,
  parentMessageId?: string | null,
) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: { body, parentMessageId: parentMessageId ?? null },
    },
  );
}

export async function editAdminMessage(conversationId: string, messageId: string, body: string) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/admin/conversations/${conversationId}/messages/${messageId}`,
    { method: "PATCH", body: { body } },
  );
}

export async function editPortalMessage(conversationId: string, messageId: string, body: string) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/conversations/${conversationId}/messages/${messageId}`,
    { method: "PATCH", body: { body } },
  );
}

export async function deleteAdminMessage(conversationId: string, messageId: string) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/admin/conversations/${conversationId}/messages/${messageId}`,
    { method: "DELETE" },
  );
}

export async function deletePortalMessage(conversationId: string, messageId: string) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/conversations/${conversationId}/messages/${messageId}`,
    { method: "DELETE" },
  );
}

export async function markAdminConversationRead(conversationId: string, messageId?: string | null) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/admin/conversations/${conversationId}/mark-read`,
    { method: "POST", body: { messageId: messageId ?? null } },
  );
}

export async function markPortalConversationRead(conversationId: string, messageId?: string | null) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/conversations/${conversationId}/mark-read`,
    { method: "POST", body: { messageId: messageId ?? null } },
  );
}

export async function attachAdminAssetToMessage(
  conversationId: string,
  messageId: string,
  assetId: string,
) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/admin/conversations/${conversationId}/messages/${messageId}/attach-asset`,
    { method: "POST", body: { assetId } },
  );
}

export async function attachPortalAssetToMessage(
  conversationId: string,
  messageId: string,
  assetId: string,
) {
  return requestConversationsApi<{ conversation: ConversationDetailDto }>(
    `/portal/conversations/${conversationId}/messages/${messageId}/attach-asset`,
    { method: "POST", body: { assetId } },
  );
}
