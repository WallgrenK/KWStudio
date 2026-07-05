import { supabase } from "~/lib/supabase";
import type {
  AllSettingsDto,
  PublicSettingsDto,
  SettingsCategoryId,
  SettingsDtoMap,
} from "~/settings/settingsTypes";

export type SettingsApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
};

type SettingsCategoryResponse<K extends SettingsCategoryId> = {
  ok: true;
  settings: SettingsDtoMap[K];
};

type AllSettingsResponse = {
  ok: true;
  settings: AllSettingsDto;
};

type PublicSettingsResponse = {
  ok: true;
  settings: PublicSettingsDto;
};

type SettingsErrorResponse = {
  ok: false;
  error?: string;
};

const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL;

export const isSettingsApiConfigured = Boolean(apiUrl);

function resolveApiUrl(): string | null {
  if (!apiUrl) return null;
  return apiUrl.replace(/\/$/, "");
}

async function authHeader(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ? `Bearer ${session.access_token}` : null;
}

function parseErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    if ("error" in data && typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
    if ("message" in data && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }
  return `Settings API request failed with ${status}.`;
}

async function requestSettingsApi<T>(
  path: string,
  init: RequestInit = {},
  options: { requireAuth?: boolean } = {},
): Promise<SettingsApiResult<T>> {
  const baseUrl = resolveApiUrl();
  if (!baseUrl) {
    return { ok: false, error: "API not configured. Set VITE_KWSTUDIO_API_URL." };
  }

  const requireAuth = options.requireAuth ?? true;
  const headers = new Headers(init.headers ?? {});

  if (requireAuth) {
    const authorization = await authHeader();
    if (!authorization) {
      return { ok: false, error: "Authentication required. Sign in before calling the KWStudio API." };
    }
    headers.set("Authorization", authorization);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    });

    const data = await response.json().catch(() => null) as T | SettingsErrorResponse | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: parseErrorMessage(data, response.status),
      };
    }

    return { ok: true, data: data as T, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Settings API request failed.",
    };
  }
}

export function getPublicSettings() {
  return requestSettingsApi<PublicSettingsResponse>("/settings/public", {}, { requireAuth: false });
}

export function getAllSettings() {
  return requestSettingsApi<AllSettingsResponse>("/settings");
}

export function getSettingsCategory<K extends SettingsCategoryId>(category: K) {
  return requestSettingsApi<SettingsCategoryResponse<K>>(`/settings/${category}`);
}

export function updateSettingsCategory<K extends SettingsCategoryId>(
  category: K,
  payload: Partial<SettingsDtoMap[K]>,
) {
  return requestSettingsApi<SettingsCategoryResponse<K>>(`/settings/${category}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type IntegrationRuntimeStatus = {
  openai: boolean;
  scb: boolean;
  smtp: boolean;
  supabase: boolean;
};

type IntegrationRuntimeResponse = {
  ok: true;
  status: IntegrationRuntimeStatus;
};

export function getIntegrationRuntimeStatus() {
  return requestSettingsApi<IntegrationRuntimeResponse>("/settings/integrations/runtime");
}
