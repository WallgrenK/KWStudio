import { isSupabaseConfigured, supabase, type Database } from "~/lib/supabase";
import {
  leadInsights,
  scbImportStatus,
  studioLeads,
  type LeadPriority,
  type LeadStage,
} from "~/data/admin";

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type WebsiteAudit = Database["public"]["Tables"]["website_audits"]["Row"];
export type LeadEvent = Database["public"]["Tables"]["lead_events"]["Row"];
export type ScbImportRun = Database["public"]["Tables"]["scb_import_runs"]["Row"];

export type LeadWithCompanyAndAudit = Lead & {
  company: Company | null;
  latestAudit: WebsiteAudit | null;
};

export type LeadsFallback = {
  leads: LeadWithCompanyAndAudit[];
  events: LeadEvent[];
  latestImport: ScbImportRun | null;
  source: "demo";
};

export type LeadsResult = {
  leads: LeadWithCompanyAndAudit[];
  latestImport: ScbImportRun | null;
  source: "supabase" | "demo";
  error?: string;
};

function slugToUuid(seed: string, suffix: string) {
  const input = `${seed}-${suffix}`.padEnd(32, "0").slice(0, 32);
  return `${input.slice(0, 8)}-${input.slice(8, 12)}-4${input.slice(13, 16)}-8${input.slice(17, 20)}-${input.slice(20, 32)}`;
}

function parseValue(value: string) {
  const monthlyMatch = value.match(/([\d\s,]+)\s*SEK\/mo/i);
  const match = value.match(/([\d\s,]+)\s*SEK/i);
  const raw = monthlyMatch?.[1] ?? match?.[1];
  if (!raw) return null;
  const parsed = Number(raw.replace(/\s|,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

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

export function createDemoSafeFallback(): LeadsFallback {
  const leads = studioLeads.map<LeadWithCompanyAndAudit>((lead, index) => {
    const companyId = slugToUuid(lead.id, "company");
    const leadId = slugToUuid(lead.id, "lead");
    const websiteUrl = lead.company === "Nordic Glow Clinic" || lead.company === "Vasterort Redovisning"
      ? null
      : `https://${lead.company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.se`;
    const score = lead.priority === "High" ? 86 : lead.priority === "Medium" ? 68 : 42;

    return {
      id: leadId,
      company_id: companyId,
      status: leadStageToStatus(lead.stage),
      priority: lead.priority.toLowerCase(),
      score,
      estimated_value: parseValue(lead.value),
      source: lead.source.toLowerCase().replace(/\s+/g, "_"),
      service_interest: lead.service,
      next_action: lead.nextAction,
      notes: lead.note,
      assigned_to: lead.assignedTo,
      created_at: lead.date,
      updated_at: lead.date,
      company: {
        id: companyId,
        org_number: index % 2 === 0 ? `55940${index}-128${index}` : null,
        name: lead.company,
        city: lead.location,
        municipality: lead.location,
        county: lead.location === "Uppsala" ? "Uppsala" : "Stockholm",
        industry_code: index % 2 === 0 ? "70.220" : "47.910",
        industry_label: lead.service,
        phone: lead.phone,
        email: lead.email,
        website_url: websiteUrl,
        website_found: Boolean(websiteUrl),
        website_confidence: websiteUrl ? "high" : "none",
        source: lead.source.toLowerCase().replace(/\s+/g, "_"),
        raw_data: {},
        created_at: lead.date,
        updated_at: lead.date,
      },
      latestAudit: websiteUrl
        ? {
            id: slugToUuid(lead.id, "audit"),
            company_id: companyId,
            lead_id: leadId,
            website_url: websiteUrl,
            status_code: 200,
            has_ssl: true,
            has_title: true,
            title: `${lead.company} website`,
            has_meta_description: score > 60,
            meta_description: score > 60 ? "Demo meta description found." : null,
            has_robots_txt: true,
            has_sitemap: score > 60,
            performance_score: Math.min(score + 4, 98),
            seo_score: score,
            accessibility_score: Math.min(score + 8, 98),
            best_practices_score: Math.min(score + 6, 98),
            audit_summary: score > 70 ? "Good baseline with clear next-step improvements." : "Needs stronger SEO fundamentals and clearer conversion paths.",
            raw_result: {},
            created_at: lead.lastActivity,
          }
        : null,
    };
  });

  const events = leadInsights.nextFollowUps.map<LeadEvent>((event, index) => ({
    id: slugToUuid(event.id, "event"),
    lead_id: leads[index]?.id ?? null,
    type: "follow_up",
    message: event.detail,
    metadata: { title: event.title, meta: event.meta },
    created_at: new Date().toISOString(),
  }));

  return {
    leads,
    events,
    latestImport: {
      id: slugToUuid("latest-scb-import", "run"),
      status: "completed",
      filters: { source: "demo" },
      imported_count: Number(scbImportStatus[3]?.value ?? 0),
      created_leads_count: 8,
      websites_found_count: leads.filter((lead) => lead.company?.website_found).length,
      error_message: null,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    },
    source: "demo",
  };
}

async function getCompaniesById(companyIds: string[]) {
  if (companyIds.length === 0) return new Map<string, Company>();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .in("id", companyIds);

  if (error) throw error;
  return new Map((data ?? []).map((company) => [company.id, company]));
}

async function getLatestAuditsByLeadId(leadIds: string[]) {
  if (leadIds.length === 0) return new Map<string, WebsiteAudit>();

  const { data, error } = await supabase
    .from("website_audits")
    .select("*")
    .in("lead_id", leadIds)
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

export async function getLeads(): Promise<LeadsResult> {
  const fallback = createDemoSafeFallback();

  if (!isSupabaseConfigured) {
    return { leads: fallback.leads, latestImport: fallback.latestImport, source: "demo", error: "Supabase is not configured." };
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const leads = data ?? [];
    const companyIds = leads.map((lead) => lead.company_id).filter((id): id is string => Boolean(id));
    const companies = await getCompaniesById(companyIds);
    const audits = await getLatestAuditsByLeadId(leads.map((lead) => lead.id));
    const latestImport = await getLatestImportRun();

    return {
      leads: leads.map((lead) => ({
        ...lead,
        company: lead.company_id ? companies.get(lead.company_id) ?? null : null,
        latestAudit: audits.get(lead.id) ?? null,
      })),
      latestImport,
      source: "supabase",
    };
  } catch (error) {
    console.error("Could not load Supabase leads. Falling back to demo data.", error);
    return { leads: fallback.leads, latestImport: fallback.latestImport, source: "demo", error: "Could not load Supabase leads." };
  }
}

export async function getLeadById(id: string) {
  const { leads } = await getLeads();
  return leads.find((lead) => lead.id === id) ?? null;
}

export async function updateLeadStatus(id: string, status: LeadStage | string) {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured. Demo data cannot be updated." };
  }

  const { error } = await supabase
    .from("leads")
    .update({ status: leadStageToStatus(status) })
    .eq("id", id);

  return error ? { ok: false, message: error.message } : { ok: true, message: "Lead status updated." };
}

export async function updateLeadPriority(id: string, priority: LeadPriority | string) {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured. Demo data cannot be updated." };
  }

  const { error } = await supabase
    .from("leads")
    .update({ priority: priority.toLowerCase() })
    .eq("id", id);

  return error ? { ok: false, message: error.message } : { ok: true, message: "Lead priority updated." };
}

export async function getLatestAuditForLead(leadId: string) {
  if (!isSupabaseConfigured) {
    const fallback = createDemoSafeFallback();
    return fallback.leads.find((lead) => lead.id === leadId)?.latestAudit ?? null;
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
    return createDemoSafeFallback().events.filter((event) => event.lead_id === leadId);
  }

  const { data, error } = await supabase
    .from("lead_events")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
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

export function mapLeadStage(status: string): LeadStage {
  return statusToStage(status);
}

export function mapLeadPriority(priority: string): LeadPriority {
  return statusToPriority(priority);
}
