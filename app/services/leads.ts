import type { LeadPriority, LeadStage } from "~/data/admin";
import { isKwstudioApiConfigured } from "~/services/kwstudioApi";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/supabase";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type WebsiteAudit = Database["public"]["Tables"]["website_audits"]["Row"];
export type LeadEvent = Database["public"]["Tables"]["lead_events"]["Row"];
export type ScbImportRun = Database["public"]["Tables"]["scb_import_runs"]["Row"];

export type LeadWithCompanyAndAudit = Lead & {
  company: Company | null;
  latestAudit: WebsiteAudit | null;
  latestEvent: LeadEvent | null;
};

export type LeadsResult = {
  leads: LeadWithCompanyAndAudit[];
  latestImport: ScbImportRun | null;
  source: "api" | "unconfigured" | "error";
  error?: string;
};

type ApiLeadRow = Lead & {
  company: Company | null;
  website_audits: WebsiteAudit[] | null;
};

type LeadsApiResponse = {
  leads: ApiLeadRow[];
  latestImport: ScbImportRun | null;
};

function leadStageToStatus(stage: string) {
  return stage.toLowerCase().replace(/\s+/g, "_");
}

function statusToStage(status: string): LeadStage {
  const normalized = status.toLowerCase();
  if (normalized === "researching") return "Researching";
  if (normalized === "contacted") return "Contacted";
  if (normalized === "qualified") return "Qualified";
  if (normalized === "proposal") return "Proposal";
  if (normalized === "won") return "Won";
  if (normalized === "lost" || normalized === "archived") return "Lost";
  return "New";
}

function statusToPriority(priority: string): LeadPriority {
  if (priority.toLowerCase() === "high") return "High";
  if (priority.toLowerCase() === "low") return "Low";
  return "Medium";
}

function mapApiLead(row: ApiLeadRow): LeadWithCompanyAndAudit {
  const audits = [...(row.website_audits ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const { website_audits: _audits, ...lead } = row;

  return {
    ...lead,
    company: row.company ?? null,
    latestAudit: audits[0] ?? null,
    latestEvent: null,
  };
}

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function requestLeadsApi<T>(path: string, options: { method?: "GET" | "POST"; body?: unknown } = {}) {
  const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL;
  if (!apiUrl) {
    return { ok: false as const, error: "API not configured. Set VITE_KWSTUDIO_API_URL." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false as const, error: "Authentication required. Sign in before loading leads." };
  }

  const method = options.method ?? "GET";

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(method === "POST" && options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    });

    const data = await response.json().catch(() => null) as T | { error?: string } | null;

    if (!response.ok) {
      return {
        ok: false as const,
        error: data && typeof data === "object" && "error" in data && data.error
          ? String(data.error)
          : `Could not load leads (${response.status}).`,
      };
    }

    return { ok: true as const, data: data as T };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not load leads.",
    };
  }
}

export async function getLeads(): Promise<LeadsResult> {
  if (!isKwstudioApiConfigured) {
    return {
      leads: [],
      latestImport: null,
      source: "unconfigured",
      error: "API not configured. Set VITE_KWSTUDIO_API_URL.",
    };
  }

  const result = await requestLeadsApi<LeadsApiResponse>("/leads", { method: "GET" });

  if (!result.ok) {
    return {
      leads: [],
      latestImport: null,
      source: "error",
      error: result.error,
    };
  }

  return {
    leads: (result.data.leads ?? []).map(mapApiLead),
    latestImport: result.data.latestImport ?? null,
    source: "api",
  };
}

export async function getLeadById(id: string) {
  const { leads } = await getLeads();
  return leads.find((lead) => lead.id === id) ?? null;
}

export async function updateLeadStatus(id: string, status: LeadStage | string) {
  if (!isKwstudioApiConfigured) {
    return { ok: false, message: "API not configured. Set VITE_KWSTUDIO_API_URL." };
  }

  const result = await requestLeadsApi<{ ok: boolean; lead: Lead }>(`/leads/${id}/status`, {
    method: "POST",
    body: { status: leadStageToStatus(status) },
  });

  return result.ok
    ? { ok: true, message: "Lead status updated." }
    : { ok: false, message: result.error ?? "Could not update lead status." };
}

export async function updateLeadPriority(id: string, priority: LeadPriority | string) {
  if (!isKwstudioApiConfigured) {
    return { ok: false, message: "API not configured. Set VITE_KWSTUDIO_API_URL." };
  }

  const result = await requestLeadsApi<{ ok: boolean; lead: Lead }>(`/leads/${id}/status`, {
    method: "POST",
    body: { priority: priority.toLowerCase() },
  });

  return result.ok
    ? { ok: true, message: "Lead priority updated." }
    : { ok: false, message: result.error ?? "Could not update lead priority." };
}

export async function getLatestAuditForLead(leadId: string) {
  const lead = await getLeadById(leadId);
  return lead?.latestAudit ?? null;
}

export async function getLeadEvents(_leadId: string) {
  return [] as LeadEvent[];
}

export function mapLeadStage(status: string): LeadStage {
  return statusToStage(status);
}

export function mapLeadPriority(priority: string): LeadPriority {
  return statusToPriority(priority);
}
