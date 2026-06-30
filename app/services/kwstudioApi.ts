type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export type ScbDiscoverFilters = {
  region?: string;
  municipality?: string;
  industry?: string;
  status?: string;
  tax?: string;
  employees?: string;
  registeredFrom?: string;
  advertising?: string;
};

const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL;
const adminApiKey = import.meta.env.VITE_KWSTUDIO_ADMIN_API_KEY;

function apiNotConfigured<T>(): ApiResult<T> {
  return {
    ok: false,
    error: "KWStudio API is not configured. Set VITE_KWSTUDIO_API_URL to enable this action.",
  };
}

async function requestApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  if (!apiUrl) return apiNotConfigured<T>();

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Temporary admin-demo header. Replace with real auth before production use.
        ...(adminApiKey ? { "X-KWStudio-Admin-Key": adminApiKey } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null) as T | { error?: string } | null;

    if (!response.ok) {
      return {
        ok: false,
        error: data && typeof data === "object" && "error" in data && data.error
          ? data.error
          : `KWStudio API request failed with ${response.status}.`,
      };
    }

    return { ok: true, data: data as T };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "KWStudio API request failed.",
    };
  }
}

export async function discoverScbLeads(filters: ScbDiscoverFilters) {
  return requestApi<{ importRunId: string; importedCount: number }>("/companies", { filters });
}

export async function auditLeadWebsite(leadId: string) {
  return requestApi<{ auditId: string; status: string }>("/audit", { leadId });
}

export async function refreshLeadScore(leadId: string) {
  return requestApi<{ leadId: string; score: number }>("/score", { leadId });
}
