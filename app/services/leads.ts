import { isSupabaseConfigured, supabase, type Database } from "~/lib/supabase";
import type { LeadPriority, LeadStage } from "~/data/admin";

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
  source: "supabase" | "unconfigured" | "error";
  error?: string;
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

async function getCompaniesById(companyIds: string[]) {
  const uniqueCompanyIds = [...new Set(companyIds)];
  if (uniqueCompanyIds.length === 0) return new Map<string, Company>();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .in("id", uniqueCompanyIds);

  if (error) throw error;
  return new Map((data ?? []).map((company) => [company.id, company]));
}

async function getLatestAuditsByLeadId(leadIds: string[]) {
  const uniqueLeadIds = [...new Set(leadIds)];
  if (uniqueLeadIds.length === 0) return new Map<string, WebsiteAudit>();

  const { data, error } = await supabase
    .from("website_audits")
    .select("*")
    .in("lead_id", uniqueLeadIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const audits = new Map<string, WebsiteAudit>();
  for (const audit of data ?? []) {
    if (audit.lead_id && !audits.has(audit.lead_id)) {
      audits.set(audit.lead_id, audit);
    }
  }

  return audits;
}

async function getLatestEventsByLeadId(leadIds: string[]) {
  const uniqueLeadIds = [...new Set(leadIds)];
  if (uniqueLeadIds.length === 0) return new Map<string, LeadEvent>();

  const { data, error } = await supabase
    .from("lead_events")
    .select("*")
    .in("lead_id", uniqueLeadIds)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const events = new Map<string, LeadEvent>();
  for (const event of data ?? []) {
    if (event.lead_id && !events.has(event.lead_id)) {
      events.set(event.lead_id, event);
    }
  }

  return events;
}

async function getLatestImportRun() {
  const { data, error } = await supabase
    .from("scb_import_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getLeads(): Promise<LeadsResult> {
  if (!isSupabaseConfigured) {
    return {
      leads: [],
      latestImport: null,
      source: "unconfigured",
      error: "Supabase is not configured.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const leads = data ?? [];
    const companyIds = leads.map((lead) => lead.company_id).filter((id): id is string => Boolean(id));
    const leadIds = leads.map((lead) => lead.id);

    const [companiesResult, auditsResult, eventsResult, latestImportResult] = await Promise.allSettled([
      getCompaniesById(companyIds),
      getLatestAuditsByLeadId(leadIds),
      getLatestEventsByLeadId(leadIds),
      getLatestImportRun(),
    ]);

    const companies = companiesResult.status === "fulfilled" ? companiesResult.value : new Map<string, Company>();
    const audits = auditsResult.status === "fulfilled" ? auditsResult.value : new Map<string, WebsiteAudit>();
    const events = eventsResult.status === "fulfilled" ? eventsResult.value : new Map<string, LeadEvent>();
    const latestImport = latestImportResult.status === "fulfilled" ? latestImportResult.value : null;
    const relatedError = [companiesResult, auditsResult, eventsResult, latestImportResult].some((result) => result.status === "rejected")
      ? "Lead records loaded, but some related metadata could not be loaded."
      : undefined;

    return {
      leads: leads.map((lead) => ({
        ...lead,
        company: lead.company_id ? companies.get(lead.company_id) ?? null : null,
        latestAudit: audits.get(lead.id) ?? null,
        latestEvent: events.get(lead.id) ?? null,
      })),
      latestImport,
      source: "supabase",
      error: relatedError,
    };
  } catch (error) {
    console.error("Could not load Supabase leads.", error);
    return {
      leads: [],
      latestImport: null,
      source: "error",
      error: error instanceof Error ? error.message : "Could not load Supabase leads.",
    };
  }
}

export async function getLeadById(id: string) {
  const { leads } = await getLeads();
  return leads.find((lead) => lead.id === id) ?? null;
}

export async function updateLeadStatus(id: string, status: LeadStage | string) {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const { error } = await supabase
    .from("leads")
    .update({ status: leadStageToStatus(status) })
    .eq("id", id);

  return error ? { ok: false, message: error.message } : { ok: true, message: "Lead status updated." };
}

export async function updateLeadPriority(id: string, priority: LeadPriority | string) {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const { error } = await supabase
    .from("leads")
    .update({ priority: priority.toLowerCase() })
    .eq("id", id);

  return error ? { ok: false, message: error.message } : { ok: true, message: "Lead priority updated." };
}

export async function getLatestAuditForLead(leadId: string) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase
    .from("website_audits")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getLeadEvents(leadId: string) {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase
    .from("lead_events")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function mapLeadStage(status: string): LeadStage {
  return statusToStage(status);
}

export function mapLeadPriority(priority: string): LeadPriority {
  return statusToPriority(priority);
}
