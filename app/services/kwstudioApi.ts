import { supabase } from "~/lib/supabase";
import type { ScbRequestBody } from "~/services/scbMapper";

type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL;

export const isKwstudioApiConfigured = Boolean(apiUrl);

function apiNotConfigured<T>(): ApiResult<T> {
  return {
    ok: false,
    error: "API not configured. Set VITE_KWSTUDIO_API_URL.",
  };
}

function authRequired<T>(): ApiResult<T> {
  return {
    ok: false,
    error: "Authentication required. Sign in before calling the KWStudio API.",
  };
}

async function requestApi<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  if (!isKwstudioApiConfigured) return apiNotConfigured<T>();

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return authRequired<T>();

    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
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

export async function discoverScbLeads(body: ScbRequestBody) {
  return requestApi<{ importRunId: string; importedCount: number; skippedLegalFormCount: number }>("/leads/discover", body);
}

export async function auditAllWebsites() {
  return requestApi<{ queued: number; status: string }>("/leads/audit-all", {});
}

export async function auditLeadWebsite(leadId: string) {
  return requestApi<{ auditId: string; status: string }>("/audit", { leadId });
}

export async function recalculateLeadScores() {
  return requestApi<{ updated: number; status: string }>("/leads/recalculate-scores", {});
}

export async function refreshLeadScore(leadId: string) {
  return requestApi<{ leadId: string; score: number }>("/score", { leadId });
}
