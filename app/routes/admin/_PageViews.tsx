import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { AdminTable, type AdminTableColumn } from "~/components/admin/AdminTable";
import { EmptyState } from "~/components/admin/EmptyState";
import { FilterBar } from "~/components/admin/FilterBar";
import { FormCard } from "~/components/admin/FormCard";
import { HubCard } from "~/components/admin/HubCard";
import { KanbanBoard } from "~/components/admin/KanbanBoard";
import { MiniMetricCard } from "~/components/admin/MiniMetricCard";
import { QuickActions } from "~/components/admin/QuickActions";
import { ScoreCard } from "~/components/admin/ScoreCard";
import { StatusBadge } from "~/components/admin/StatusBadge";
import { TaskList } from "~/components/admin/TaskList";
import { Timeline } from "~/components/admin/Timeline";
import { LeadPreviewPanel } from "~/components/admin/leads/LeadPreviewPanel";
import { type RecommendedPackageName } from "~/components/admin/leads/LeadRecommendedPackage";
import { type LeadScoreBreakdownItem } from "~/components/admin/leads/LeadScoreBreakdown";
import { LeadWorkspaceModal } from "~/components/admin/leads/LeadWorkspaceModal";
import type { LeadAuditSummary, LeadWorkspaceData, LeadWorkspaceTabId } from "~/components/admin/leads/LeadWorkspaceTypes";
import {
  aiPinnedTools,
  aiQuickPrompts,
  aiRecentTools,
  adminLeads,
  adminProjects,
  adminTasks,
  aiTools,
  analyses,
  bookkeepingTasks,
  calendarEvents,
  clientHealthMetrics,
  clients,
  dashboardTasks,
  emailMessages,
  expenses,
  featuredClients,
  financeActivity,
  financeMetrics,
  files,
  followUps,
  invoices,
  leadInsights,
  payments,
  pipelineDeals,
  projectStatusMetrics,
  projectTimeline,
  proposals,
  prospects,
  quickActions,
  recentWebsiteScans,
  scbImportStatus,
  scbLeadFinderFilters,
  seoItems,
  settingsProfile,
  upcomingMeetings,
  uptimeMonitors,
  websiteHealthMetrics,
  websiteReports,
  websiteScores,
  type AdminStatus,
  type AdminLead,
  type AdminProject,
  type Client,
  type Expense,
  type Invoice,
  type LeadPriority,
  type LeadServiceInterest,
  type LeadSource,
  type LeadStage,
  type Payment,
  type Proposal,
  type WebsiteReport,
} from "~/data/admin";
import { isSupabaseConfigured } from "~/lib/supabase";
import {
  auditAllWebsites,
  auditLeadWebsite,
  discoverScbLeads,
  generateSalesPitch,
  getLatestSalesPitch,
  isKwstudioApiConfigured,
  recalculateLeadScores,
  refreshLeadScore,
  type LeadAiInsight,
} from "~/services/kwstudioApi";
import {
  getLeads,
  mapLeadPriority,
  mapLeadStage,
  updateLeadStatus,
  type LeadWithCompanyAndAudit,
  type LeadsResult,
} from "~/services/leads";
import { buildScbRequest, type ScbLeadFinderFilters } from "~/services/scbMapper";

const leadColumns: Array<AdminTableColumn<AdminLead>> = [
  {
    key: "lead",
    header: "Lead",
    render: (lead) => (
      <div>
        <strong className="block font-medium text-gray-800">{lead.name}</strong>
        <span className="mt-0.5 block text-sm text-gray-500">{lead.company}</span>
      </div>
    ),
  },
  { key: "service", header: "Service", render: (lead) => lead.service },
  { key: "source", header: "Source", render: (lead) => lead.source },
  { key: "date", header: "Date", render: (lead) => lead.date },
  { key: "status", header: "Status", render: (lead) => <StatusBadge status={lead.status} /> },
];

const invoiceColumns: Array<AdminTableColumn<Invoice>> = [
  { key: "number", header: "Invoice", render: (invoice) => <strong className="text-gray-800">{invoice.id}</strong> },
  { key: "client", header: "Client", render: (invoice) => invoice.client },
  { key: "amount", header: "Amount", render: (invoice) => invoice.amount },
  { key: "due", header: "Due", render: (invoice) => invoice.due },
  { key: "status", header: "Status", render: (invoice) => <StatusBadge status={invoice.status} /> },
];

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-gray-100">
      <div className="h-2 rounded-full bg-[#2E75BD]" style={{ width: `${value}%` }} />
    </div>
  );
}

function mapDashboardStatus(status: string): AdminStatus {
  const stage = mapLeadStage(status);

  if (stage === "New") return "New";
  if (stage === "Qualified") return "Qualified";
  if (stage === "Won") return "Won";
  if (stage === "Lost") return "Blocked";
  if (stage === "Proposal") return "In review";
  return "Pending";
}

function toDashboardLead(lead: LeadWithCompanyAndAudit): AdminLead {
  return {
    id: lead.id,
    name: leadCompanyName(lead),
    company: leadCompanyName(lead),
    email: lead.company?.email ?? "-",
    service: leadServiceLabel(lead),
    source: leadSourceLabel(lead),
    status: mapDashboardStatus(lead.status),
    date: formatShortDate(lead.created_at),
  };
}

type WorkflowCard = {
  title: string;
  description: string;
  href?: string;
  status?: string;
};

function WorkflowCards({ cards }: { cards: WorkflowCard[] }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => <HubCard key={card.title} {...card} />)}
    </div>
  );
}

function MetricGrid({ metrics }: { metrics: Parameters<typeof MiniMetricCard>[0][] }) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => <MiniMetricCard key={metric.label} {...metric} />)}
    </div>
  );
}

export function DashboardPage() {
  const [leadResult, setLeadResult] = useState<LeadsResult>(defaultLeadResult);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getLeads()
      .then((result) => {
        if (isMounted) {
          setLeadResult(result);
        }
      })
      .catch((error) => {
        console.error("Could not load dashboard leads.", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingLeads(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const dashboardLeads = leadResult.leads;
  const recentLeadRows = dashboardLeads.slice(0, 4).map(toDashboardLead);
  const highValueOpportunities = [...dashboardLeads]
    .sort((a, b) => (b.estimated_value ?? b.score ?? 0) - (a.estimated_value ?? a.score ?? 0))
    .slice(0, 3);
  const pipelineSummary = ["New", "Qualified", "Proposal", "Won"].map((stage) => ({
    stage,
    count: dashboardLeads.filter((lead) => mapLeadStage(lead.status) === stage).length,
  }));
  const leadsDetail = isLoadingLeads
    ? "Loading live leads"
    : leadResult.source === "supabase"
      ? "Live from Supabase"
      : leadResult.error ?? "Supabase not configured";

  return (
    <AdminShell title="Dashboard" description="A focused overview of KWStudio leads, active work and operational priorities.">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Leads", value: isLoadingLeads ? "..." : String(dashboardLeads.length), detail: leadsDetail, href: "/admin/leads" },
            { label: "Active projects", value: "7", detail: "3 launches scheduled", href: "/admin/projects" },
            { label: "Website score", value: "88", detail: "Average across reports", href: "/admin/websites" },
            { label: "Outstanding", value: "50k SEK", detail: "1 overdue invoice", href: "/admin/finance" },
          ].map((metric) => <MiniMetricCard key={metric.label} {...metric} />)}
        </div>

        <div className="col-span-12 xl:col-span-7">
          <Timeline title="Today's tasks" items={dashboardTasks} />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <Timeline title="Upcoming meetings" items={upcomingMeetings} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <Panel title="Pipeline summary">
            <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-2">
              {pipelineSummary.map((item) => (
                <div key={item.stage} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                  <strong className="text-sm text-gray-900">{item.count}</strong>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {highValueOpportunities.map((lead) => (
                <Link key={lead.id} to="/admin/pipeline" className="block rounded-lg border border-gray-100 px-4 py-3 transition hover:border-[#2E75BD]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold text-gray-800">{leadCompanyName(lead)}</span>
                    <span className="text-xs font-medium text-[#2E75BD]">{formatCurrency(lead.estimated_value)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500">{lead.next_action ?? lead.service_interest ?? "Review opportunity"}</p>
                </Link>
              ))}
            </div>
            <Link className="mt-4 inline-flex text-sm font-medium text-[#2E75BD]" to="/admin/pipeline">
              View pipeline
            </Link>
          </Panel>
        </div>
        <div className="col-span-12 xl:col-span-7">
          <Panel title="Recent activity">
            <div className="space-y-3">
              {[
                ...followUps.slice(0, 2).map((item) => ({ id: item.id, title: item.title, detail: `${item.person} - ${item.due}`, href: "/admin/follow-ups", status: item.status })),
                ...analyses.slice(0, 2).map((analysis) => ({ id: analysis.id, title: analysis.url, detail: `${analysis.findings} findings - score ${analysis.score}`, href: "/admin/analyzer", status: "Review" as AdminStatus })),
              ].map((item) => (
                <Link key={item.id} to={item.href} className="block rounded-lg border border-gray-100 px-4 py-3 transition hover:border-[#2E75BD]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-gray-700">{item.title}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500">{item.detail}</p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <Panel title="Active projects">
            <div className="grid gap-4 md:grid-cols-3">
              {adminProjects.slice(0, 3).map((project) => (
                <Link key={project.id} to="/admin/projects" className="rounded-xl border border-gray-100 p-4 transition hover:border-[#2E75BD]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">{project.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{project.client}</p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mt-4"><Progress value={project.progress} /></div>
                  <p className="mt-2 text-xs text-gray-500">Deadline {project.deadline}</p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
        <div className="col-span-12 xl:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Recent leads</h2>
            <Link className="text-sm font-medium text-[#2E75BD]" to="/admin/leads">View all</Link>
          </div>
          <AdminTable columns={leadColumns.slice(0, 4)} rows={recentLeadRows} getRowKey={(lead) => lead.id} emptyMessage="No Supabase leads found." />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </AdminShell>
  );
}

const leadStageOrder: LeadStage[] = ["New", "Researching", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

const leadSources: Array<LeadSource | "All"> = ["All", "Website form", "SCB company search", "Manual prospect", "Referral", "LinkedIn", "Audit tool"];

const leadPriorities: Array<LeadPriority | "All"> = ["All", "High", "Medium", "Low"];

const leadServices: Array<LeadServiceInterest | "All"> = ["All", "New website", "Redesign", "SEO / audit", "Care plan", "Ecommerce"];

const defaultLeadResult: LeadsResult = { leads: [], latestImport: null, source: "unconfigured" };
const leadsPageSizeOptions = [10, 25, 50];
type LeadWorkflowTab = "all" | "pipeline" | "follow-ups" | "proposals";

type LeadOpportunity = {
  title: string;
  summary: string;
  recommendedService: string;
  estimatedValue: string;
  topIssues: string[];
};

const leadWorkflowTabs: Array<{ id: LeadWorkflowTab; label: string }> = [
  { id: "all", label: "All Leads" },
  { id: "pipeline", label: "Pipeline" },
  { id: "follow-ups", label: "Follow-ups" },
  { id: "proposals", label: "Proposals" },
];

function AdminTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ id: LeadWorkflowTab; label: string }>;
  activeTab: LeadWorkflowTab;
  onChange: (tab: LeadWorkflowTab) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-gray-200 bg-white p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            activeTab === tab.id
              ? "bg-[#2E75BD] text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function formatCurrency(value: number | null) {
  if (!value) return "-";
  return `${new Intl.NumberFormat("sv-SE").format(value)} SEK`;
}

function formatShortDate(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("sv-SE", { month: "short", day: "numeric" }).format(date);
}

function leadCompanyName(lead: LeadWithCompanyAndAudit) {
  return lead.company?.name ?? "Unknown company";
}

function leadSourceLabel(lead: LeadWithCompanyAndAudit): LeadSource {
  const source = (lead.source ?? "").toLowerCase().replace(/[_-]/g, " ");
  if (source.includes("scb")) return "SCB company search";
  if (source.includes("manual")) return "Manual prospect";
  if (source.includes("referral")) return "Referral";
  if (source.includes("linkedin")) return "LinkedIn";
  if (source.includes("audit")) return "Audit tool";
  return "Website form";
}

function leadServiceLabel(lead: LeadWithCompanyAndAudit): LeadServiceInterest {
  const service = (lead.service_interest ?? "").toLowerCase();
  if (service.includes("redesign")) return "Redesign";
  if (service.includes("seo") || service.includes("audit")) return "SEO / audit";
  if (service.includes("care")) return "Care plan";
  if (service.includes("commerce")) return "Ecommerce";
  return "New website";
}

function leadSearchText(lead: LeadWithCompanyAndAudit) {
  return [
    leadCompanyName(lead),
    lead.company?.email,
    lead.company?.phone,
    lead.company?.city,
    lead.company?.industry_label,
    lead.source,
    lead.service_interest,
    lead.next_action,
    lead.assigned_to,
  ].join(" ").toLowerCase();
}

function buildLeadMetrics(leads: LeadWithCompanyAndAudit[]) {
  const statusCount = (stage: LeadStage) => leads.filter((lead) => mapLeadStage(lead.status) === stage).length;
  const noWebsite = leads.filter((lead) => !lead.company?.website_url || !lead.company.website_found).length;
  const needAudit = leads.filter((lead) => lead.company?.website_url && !lead.latestAudit).length;
  const audited = leads.filter((lead) => Boolean(lead.latestAudit)).length;
  const hotOpportunities = leads.filter((lead) => mapLeadPriority(lead.priority) === "High" || (lead.score ?? 0) >= 75).length;
  const readyToContact = leads.filter((lead) => {
    const stage = mapLeadStage(lead.status);
    return stage === "New" || stage === "Qualified" || Boolean(lead.next_action);
  }).length;

  return [
    { label: "Total leads", value: String(leads.length), detail: `${statusCount("New")} new, ${statusCount("Qualified")} qualified`, href: "/admin/leads" },
    { label: "Hot opportunities", value: String(hotOpportunities), detail: "High priority or strong score", href: "/admin/leads" },
    { label: "Need audit", value: String(needAudit), detail: "Website found, no audit yet", href: "/admin/leads" },
    { label: "No website", value: String(noWebsite), detail: "Starter website candidates", href: "/admin/leads" },
    { label: "Audited websites", value: String(audited), detail: "With latest audit data", href: "/admin/websites" },
    { label: "Ready to contact", value: String(readyToContact), detail: "New, qualified or with next action", href: "/admin/follow-ups" },
  ];
}

function getRecommendedService(lead: LeadWithCompanyAndAudit) {
  if (!lead.company?.website_url || !lead.company.website_found) return "Starter website";

  const seoScore = lead.latestAudit?.seo_score;
  if (typeof seoScore !== "number") return "SEO audit / website refresh";
  if (seoScore < 40) return "Website redesign + SEO";
  if (seoScore < 70) return "SEO audit / website refresh";
  return "Care plan / conversion review";
}

function getEstimatedValue(lead: LeadWithCompanyAndAudit) {
  if (!lead.company?.website_url || !lead.company.website_found) return "15 000-30 000 SEK";

  const seoScore = lead.latestAudit?.seo_score;
  if (typeof seoScore !== "number") return "20 000-45 000 SEK";
  if (seoScore < 40) return "35 000-65 000 SEK";
  if (seoScore < 70) return "20 000-45 000 SEK";
  return "8 000-20 000 SEK";
}

function getTopIssues(lead: LeadWithCompanyAndAudit) {
  const issues: string[] = [];
  const audit = lead.latestAudit;

  if (!lead.company?.website_url || !lead.company.website_found) {
    return ["No verified website", "Needs manual business research", "Starter offer opportunity"];
  }

  if (!audit) {
    issues.push("Website audit pending");
  } else {
    if (audit.has_meta_description === false) issues.push("Missing meta description");
    if (audit.has_title === false) issues.push("Missing title");
    if (audit.has_robots_txt === false) issues.push("Missing robots.txt");
    if (audit.has_sitemap === false) issues.push("Missing sitemap.xml");
    if ((audit.seo_score ?? 100) < 40) issues.push("Weak SEO foundation");
    if ((audit.seo_score ?? 100) < 70) issues.push("Low SEO score");
    if (!audit.has_ssl || (audit.status_code && audit.status_code >= 400)) {
      issues.push("Technical website improvements needed");
    }
  }

  if ((lead.score ?? 100) < 45) issues.push("Low lead score");
  if (issues.length === 0) issues.push("Needs manual review");

  return [...new Set(issues)].slice(0, 5);
}

function getLeadOpportunity(lead: LeadWithCompanyAndAudit): LeadOpportunity {
  if (!lead.company?.website_url || !lead.company.website_found) {
    return {
      title: "Starter website opportunity",
      summary: "No verified website found. Good fit for a starter website offer.",
      recommendedService: getRecommendedService(lead),
      estimatedValue: getEstimatedValue(lead),
      topIssues: getTopIssues(lead),
    };
  }

  const seoScore = lead.latestAudit?.seo_score;
  const title = typeof seoScore !== "number"
    ? "Audit-first opportunity"
    : seoScore < 40
      ? "Excellent redesign opportunity"
      : seoScore < 70
        ? "SEO improvement opportunity"
        : "Care plan opportunity";
  const summary = typeof seoScore !== "number"
    ? "Website found, but no audit is available yet. Run an audit before outreach."
    : seoScore < 40
      ? "Website is live but shows weak SEO fundamentals. Strong fit for redesign-led outreach."
      : seoScore < 70
        ? "Website has a usable base with visible improvement potential. Good fit for audit-first outreach."
        : "Website looks relatively healthy. Best fit is a focused care plan or conversion review.";

  return {
    title,
    summary,
    recommendedService: getRecommendedService(lead),
    estimatedValue: getEstimatedValue(lead),
    topIssues: getTopIssues(lead),
  };
}

function getScoreBreakdown(lead: LeadWithCompanyAndAudit): LeadScoreBreakdownItem[] {
  const audit = lead.latestAudit;
  const hasWebsite = Boolean(lead.company?.website_url && lead.company.website_found);
  const website = hasWebsite ? 100 : 15;
  const seo = typeof audit?.seo_score === "number" ? Math.min(Math.max(audit.seo_score, 0), 100) : hasWebsite ? 35 : 10;
  const technical = audit
    ? [
        audit.has_ssl,
        audit.has_robots_txt,
        audit.has_sitemap,
        typeof audit.status_code === "number" && audit.status_code >= 200 && audit.status_code < 400,
      ].filter(Boolean).length * 25
    : hasWebsite ? 35 : 10;
  const conversion = audit
    ? audit.has_title && audit.has_meta_description
      ? 90
      : audit.has_title || audit.has_meta_description
        ? 55
        : 25
    : hasWebsite ? 30 : 20;
  const priorityFit: Record<LeadPriority, number> = { High: 92, Medium: 68, Low: 42 };
  const scoreFit = Math.min(Math.max(lead.score ?? 0, 0), 100);
  const businessFit = Math.max(scoreFit, priorityFit[mapLeadPriority(lead.priority)]);

  return [
    { label: "Website", value: website, detail: hasWebsite ? "Verified website found" : "No verified website" },
    { label: "SEO", value: seo, detail: typeof audit?.seo_score === "number" ? `SEO ${audit.seo_score}/100` : "No SEO audit yet" },
    { label: "Technical", value: technical, detail: "SSL, robots, sitemap and status" },
    { label: "Conversion", value: conversion, detail: "Title and meta basics" },
    { label: "Business fit", value: businessFit, detail: `${mapLeadPriority(lead.priority)} priority, score ${lead.score ?? 0}` },
  ];
}

function clampPercent(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function getAiConfidence(lead: LeadWithCompanyAndAudit, insight: LeadAiInsight | null) {
  const baseScore = lead.score ?? 45;
  const auditBonus = lead.latestAudit ? 8 : 0;
  const websiteBonus = lead.company?.website_url && lead.company.website_found ? 6 : 0;
  const insightBonus = insight ? 8 : 0;
  const score = clampPercent(baseScore + auditBonus + websiteBonus + insightBonus);
  const label = score >= 90 ? "High confidence" : score >= 70 ? "Medium confidence" : "Low confidence";
  return { score, label };
}

function getCloseProbability(lead: LeadWithCompanyAndAudit, confidenceScore: number) {
  const priorityBoost: Record<LeadPriority, number> = { High: 8, Medium: 0, Low: -8 };
  const stageBoost = mapLeadStage(lead.status) === "Qualified" ? 7 : mapLeadStage(lead.status) === "Proposal" ? 14 : 0;
  return clampPercent(confidenceScore - 10 + priorityBoost[mapLeadPriority(lead.priority)] + stageBoost);
}

function getOpportunityStars(lead: LeadWithCompanyAndAudit) {
  const score = lead.score ?? 0;
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  return 1;
}

function getRecommendedPackage(lead: LeadWithCompanyAndAudit, service: string) {
  const score = lead.score ?? 0;
  const hasWebsite = Boolean(lead.company?.website_url && lead.company.website_found);
  const seoScore = lead.latestAudit?.seo_score;
  const serviceName = service.toLowerCase();

  let packageName: RecommendedPackageName = "Business";
  if (!hasWebsite || score < 45) packageName = "Starter";
  if (hasWebsite && score >= 55) packageName = "Business";
  if ((typeof seoScore === "number" && seoScore < 45) || score >= 75 || serviceName.includes("redesign")) packageName = "Growth";
  if (score >= 90 && mapLeadPriority(lead.priority) === "High") packageName = "Enterprise";

  const reasonByPackage: Record<RecommendedPackageName, string> = {
    Starter: "Best fit when the business needs a clear website foundation before heavier growth work.",
    Business: "Good fit for improving trust, structure and local conversion without overbuilding the scope.",
    Growth: "Best fit when the website has visible SEO, technical or positioning gaps that can become a stronger sales angle.",
    Enterprise: "Best fit for a high-priority opportunity where strategy, redesign and ongoing optimization should be packaged together.",
  };

  return {
    packageName,
    reason: reasonByPackage[packageName],
  };
}

function getIssueTooltips(issues: string[]) {
  const tooltips: Record<string, string> = {
    "No verified website": "No confident website URL is connected to this lead yet.",
    "Needs manual business research": "Review the company manually before outreach so the message stays relevant.",
    "Starter offer opportunity": "Lead with a simple credibility-site package instead of a complex pitch.",
    "Website audit pending": "Run an audit before relying on technical or SEO claims.",
    "Missing meta description": "Search results may lack a clear snippet and selling point.",
    "Missing title": "The page may not communicate its service clearly to users or search engines.",
    "Missing robots.txt": "Basic crawl guidance is missing or could not be verified.",
    "Missing sitemap.xml": "Search engines may have less help discovering important pages.",
    "Weak SEO foundation": "The audit indicates low SEO quality and a strong improvement angle.",
    "Low SEO score": "There are visible SEO opportunities worth using in outreach.",
    "Technical website improvements needed": "SSL, response status or crawl basics need attention.",
    "Low lead score": "The lead needs more qualification before heavier sales effort.",
    "Needs manual review": "No major automated issue stood out, so review the business context manually.",
  };

  return issues.map((issue) => ({
    label: issue,
    tooltip: tooltips[issue] ?? "Review this point before outreach.",
  }));
}

function getFallbackEmail(lead: LeadWithCompanyAndAudit, opportunity: LeadOpportunity) {
  const company = leadCompanyName(lead);
  return {
    subject: `Kort fråga om ${company}`,
    body: [
      `Hej ${company},`,
      "",
      `Jag kikade kort på er digitala närvaro och tror att ${opportunity.recommendedService.toLowerCase()} skulle kunna göra det enklare för kunder att förstå, lita på och kontakta er.`,
      "",
      "Vill du att jag skickar över några konkreta förbättringsförslag?",
    ].join("\n"),
  };
}

function readRawValue(raw: unknown, keys: string[]) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
  }

  return null;
}

function formatBoolean(value: boolean | null) {
  if (value === null) return "-";
  return value ? "Yes" : "No";
}

function buildAuditSummary(lead: LeadWithCompanyAndAudit, formatDate: (value: string | null) => string): LeadAuditSummary | null {
  const audit = lead.latestAudit;
  if (!audit) return null;

  return {
    seoScore: audit.seo_score,
    performanceScore: audit.performance_score,
    accessibilityScore: audit.accessibility_score,
    statusCode: audit.status_code,
    hasSsl: audit.has_ssl,
    hasTitle: audit.has_title,
    hasMetaDescription: audit.has_meta_description,
    hasRobotsTxt: audit.has_robots_txt,
    hasSitemap: audit.has_sitemap,
    summary: audit.audit_summary,
    createdAt: formatDate(audit.created_at),
    rawFields: [
      { label: "Website URL", value: audit.website_url ?? "-" },
      { label: "Status code", value: audit.status_code ? String(audit.status_code) : "-" },
      { label: "SSL", value: formatBoolean(audit.has_ssl) },
      { label: "Title", value: formatBoolean(audit.has_title) },
      { label: "Meta description", value: formatBoolean(audit.has_meta_description) },
      { label: "Robots", value: formatBoolean(audit.has_robots_txt) },
      { label: "Sitemap", value: formatBoolean(audit.has_sitemap) },
      { label: "SEO", value: audit.seo_score !== null ? `${audit.seo_score}/100` : "-" },
      { label: "Performance", value: audit.performance_score !== null ? `${audit.performance_score}/100` : "-" },
      { label: "Accessibility", value: audit.accessibility_score !== null ? `${audit.accessibility_score}/100` : "-" },
      { label: "Best practices", value: audit.best_practices_score !== null ? `${audit.best_practices_score}/100` : "-" },
      { label: "Audit created", value: formatDate(audit.created_at) },
    ],
  };
}

function hasScbNarrowingFilters(filters: ScbLeadFinderFilters) {
  return Boolean(
    filters.county
      || filters.municipality
      || filters.industry
      || filters.taxStatus
      || filters.employeeRange
      || filters.registrationPeriod
      || filters.adStatus,
  );
}

function LeadStageBadge({ stage }: { stage: LeadStage }) {
  const styles: Record<LeadStage, string> = {
    New: "bg-blue-50 text-[#2E75BD]",
    Researching: "bg-slate-100 text-slate-700",
    Contacted: "bg-sky-50 text-sky-700",
    Qualified: "bg-green-50 text-green-700",
    Proposal: "bg-amber-50 text-amber-700",
    Won: "bg-emerald-50 text-emerald-700",
    Lost: "bg-gray-100 text-gray-600",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[stage]}`}>{stage}</span>;
}

function PriorityBadge({ priority }: { priority: LeadPriority }) {
  const styles: Record<LeadPriority, string> = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-amber-50 text-amber-600",
    Low: "bg-gray-100 text-gray-600",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[priority]}`}>{priority}</span>;
}

function ScoreBadge({ score }: { score: number | null }) {
  const value = score ?? 0;
  const style = value >= 75
    ? "bg-emerald-50 text-emerald-700"
    : value >= 50
      ? "bg-blue-50 text-[#2E75BD]"
      : value >= 30
        ? "bg-amber-50 text-amber-700"
        : "bg-red-50 text-red-600";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{value}/100</span>;
}

function WebsiteBadge({ lead }: { lead: LeadWithCompanyAndAudit }) {
  if (!lead.company?.website_url || !lead.company.website_found) {
    return <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">No website</span>;
  }

  return (
    <a className="block max-w-52 truncate text-sm font-medium text-[#2E75BD]" href={lead.company.website_url} target="_blank" rel="noreferrer">
      {lead.company.website_url}
    </a>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: string; label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-gray-500">
      <span>{label}</span>
      <select
        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function ScbLeadFinderPanel({
  onDiscover,
  onAuditAll,
  onRecalculateScores,
  message,
  isWorking,
}: {
  onDiscover: (filters: ScbLeadFinderFilters) => void;
  onAuditAll: () => void;
  onRecalculateScores: () => void;
  message: string | null;
  isWorking: boolean;
}) {
  const [filters, setFilters] = useState<ScbLeadFinderFilters>({
    county: scbLeadFinderFilters.county[0]?.value,
    municipality: scbLeadFinderFilters.municipality[0]?.value,
    industry: scbLeadFinderFilters.industry[0]?.value,
    companyStatus: scbLeadFinderFilters.companyStatus[0]?.value,
    taxStatus: scbLeadFinderFilters.taxStatus[0]?.value,
    employeeRange: scbLeadFinderFilters.employeeRange[0]?.value,
    registrationPeriod: scbLeadFinderFilters.registrationPeriod[0]?.value,
    adStatus: scbLeadFinderFilters.adStatus[0]?.value,
  });

  const setFilter = (key: keyof ScbLeadFinderFilters) => (value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <Panel title="SCB Lead Finder">
      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-sm leading-6 text-gray-600">
          {isKwstudioApiConfigured
            ? "Render API is configured for SCB discovery, website audits and lead score recalculation."
            : "API not configured. Set VITE_KWSTUDIO_API_URL."}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SelectField label="Lan" options={scbLeadFinderFilters.county} value={filters.county ?? ""} onChange={setFilter("county")} />
        <SelectField label="Kommun" options={scbLeadFinderFilters.municipality} value={filters.municipality ?? ""} onChange={setFilter("municipality")} />
        <SelectField label="Bransch / SNI" options={scbLeadFinderFilters.industry} value={filters.industry ?? ""} onChange={setFilter("industry")} />
        <SelectField label="Foretagsstatus" options={scbLeadFinderFilters.companyStatus} value={filters.companyStatus ?? ""} onChange={setFilter("companyStatus")} />
        <SelectField label="F-skatt / moms" options={scbLeadFinderFilters.taxStatus} value={filters.taxStatus ?? ""} onChange={setFilter("taxStatus")} />
        <SelectField label="Anstallda" options={scbLeadFinderFilters.employeeRange} value={filters.employeeRange ?? ""} onChange={setFilter("employeeRange")} />
        <SelectField label="Registrering" options={scbLeadFinderFilters.registrationPeriod} value={filters.registrationPeriod ?? ""} onChange={setFilter("registrationPeriod")} />
        <SelectField label="Reklamstatus" options={scbLeadFinderFilters.adStatus} value={filters.adStatus ?? ""} onChange={setFilter("adStatus")} />
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button className="btn btn-primary" type="button" disabled={!isKwstudioApiConfigured || isWorking} onClick={() => onDiscover(filters)}>
          {isWorking ? "Working..." : "Discover SCB leads"}
        </button>
        <button className="btn btn-outline" type="button" disabled={!isKwstudioApiConfigured || isWorking} onClick={onAuditAll}>
          Audit all websites
        </button>
        <button className="btn btn-outline" type="button" disabled={!isKwstudioApiConfigured || isWorking} onClick={onRecalculateScores}>
          Recalculate scores
        </button>
      </div>
      {message ? <p className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">{message}</p> : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {scbImportStatus.map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-100 px-4 py-3">
            <span className="text-xs font-medium text-gray-500">{item.label}</span>
            <strong className="mt-1 block text-lg text-gray-800">{item.value}</strong>
            <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function LeadPipeline({ leads }: { leads: LeadWithCompanyAndAudit[] }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Lead pipeline</h2>
          <p className="mt-1 text-sm text-gray-500">From imported companies to won projects.</p>
        </div>
        <span className="text-sm font-medium text-[#2E75BD]">{leads.length} active records</span>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {leadStageOrder.map((stage) => {
          const stageLeads = leads.filter((lead) => mapLeadStage(lead.status) === stage);
          return (
            <div key={stage} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-800">{stage}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500">{stageLeads.length}</span>
              </div>
              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {stageLeads.length > 0 ? stageLeads.map((lead) => (
                  <article key={lead.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-gray-800">{leadCompanyName(lead)}</h4>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{lead.company?.city ?? lead.company?.industry_label ?? "Lead record"}</p>
                      </div>
                      <PriorityBadge priority={mapLeadPriority(lead.priority)} />
                    </div>
                    <p className="mt-3 truncate text-xs font-medium text-gray-500">{leadSourceLabel(lead)}</p>
                    <p className="mt-1 truncate text-sm text-gray-700">{lead.service_interest ?? "Website opportunity"}</p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-gray-800">{formatCurrency(lead.estimated_value)}</span>
                      <span className="text-gray-500">{formatShortDate(lead.created_at)}</span>
                    </div>
                    <p className="mt-2 truncate text-xs text-gray-500">{lead.next_action ?? "Review opportunity"}</p>
                  </article>
                )) : (
                  <p className="rounded-lg border border-dashed border-gray-200 bg-white p-3 text-xs leading-5 text-gray-500">No leads in this stage.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InsightList({ title, items }: { title: string; items: Array<{ id: string; title: string; detail: string; meta: string }> }) {
  return (
    <Panel title={title}>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-100 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
              <span className="text-xs font-medium text-gray-500">{item.meta}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-gray-500">{item.detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function LeadsTablePagination({
  currentPage,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-800">{startRow}</span>-<span className="font-medium text-gray-800">{endRow}</span> of{" "}
        <span className="font-medium text-gray-800">{totalRows}</span> leads
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-500">
          Rows
          <select
            className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-700 outline-none transition focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {leadsPageSizeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-[#2E75BD] hover:text-[#2E75BD] disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span className="min-w-20 text-center text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <button
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-[#2E75BD] hover:text-[#2E75BD] disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadDetailsPanel({
  lead,
  isWorking,
  onClose,
  onAudit,
  onQualify,
}: {
  lead: LeadWithCompanyAndAudit;
  isWorking: boolean;
  onClose: () => void;
  onAudit: (lead: LeadWithCompanyAndAudit) => void;
  onQualify: (lead: LeadWithCompanyAndAudit) => void;
}) {
  const websiteUrl = lead.company?.website_url;
  const opportunity = getLeadOpportunity(lead);
  const scoreBreakdown = getScoreBreakdown(lead);
  const audit = lead.latestAudit;
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<LeadWorkspaceTabId>("overview");
  const [aiInsightCache, setAiInsightCache] = useState<Record<string, LeadAiInsight | null>>({});
  const [aiInsight, setAiInsight] = useState<LeadAiInsight | null>(null);
  const [isLoadingAiInsight, setIsLoadingAiInsight] = useState(false);
  const [isGeneratingAiInsight, setIsGeneratingAiInsight] = useState(false);
  const [aiInsightError, setAiInsightError] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const loadLatestAiInsight = async (leadId: string, force = false, shouldApply: () => boolean = () => true) => {
    setAiInsight(null);
    setAiInsightError(null);
    setCopiedMessage(null);

    if (!force && Object.prototype.hasOwnProperty.call(aiInsightCache, leadId)) {
      setAiInsight(aiInsightCache[leadId] ?? null);
      setIsLoadingAiInsight(false);
      return;
    }

    setIsLoadingAiInsight(true);

    try {
      const result = await getLatestSalesPitch(leadId);
      if (!shouldApply()) return;

      if (result.ok) {
        const nextInsight = result.data?.insight ?? null;
        setAiInsight(nextInsight);
        setAiInsightCache((current) => ({ ...current, [leadId]: nextInsight }));
        return;
      }

      if (result.status === 404 || result.status === 501) {
        setAiInsight(null);
        setAiInsightCache((current) => ({ ...current, [leadId]: null }));
        return;
      }

      setAiInsightError(result.error ?? "Could not load saved AI insight.");
    } finally {
      if (shouldApply()) setIsLoadingAiInsight(false);
    }
  };

  useEffect(() => {
    let shouldApply = true;
    const leadId = lead.id;

    void loadLatestAiInsight(leadId, false, () => shouldApply);

    return () => {
      shouldApply = false;
    };
  }, [lead.id]);

  useEffect(() => {
    if (!copiedMessage) return;

    const timeout = window.setTimeout(() => setCopiedMessage(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [copiedMessage]);

  const handleGenerateAiInsight = async () => {
    setIsGeneratingAiInsight(true);
    setAiInsightError(null);

    try {
      const result = await generateSalesPitch(lead.id);
      const generatedInsight = result.data?.insight;

      if (result.ok && generatedInsight) {
        setAiInsight(generatedInsight);
        setAiInsightCache((current) => ({ ...current, [lead.id]: generatedInsight }));
      } else {
        setAiInsightError(result.error ?? "Try again.");
      }
    } finally {
      setIsGeneratingAiInsight(false);
    }
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedMessage("Copied!");
    } catch {
      setCopiedMessage("Copy failed");
    }
  };

  const fallbackEmail = getFallbackEmail(lead, opportunity);
  const emailSubject = aiInsight?.email_subject ?? fallbackEmail.subject;
  const emailBody = aiInsight?.email_body ?? fallbackEmail.body;
  const summary = aiInsight?.summary ?? opportunity.summary;
  const salesAngle = aiInsight?.pitch ?? opportunity.summary;
  const recommendedService = aiInsight?.recommended_service ?? opportunity.recommendedService;
  const confidence = getAiConfidence(lead, aiInsight);
  const closeProbability = getCloseProbability(lead, confidence.score);
  const recommendedPackage = getRecommendedPackage(lead, recommendedService);
  const location = lead.company?.city ?? lead.company?.municipality ?? lead.company?.county ?? "No location";
  const legalForm = readRawValue(lead.company?.raw_data, ["legal_form", "legalForm", "legalform", "juridisk_form", "company_form"]);
  const technicalDetails = [
    { label: "Company", value: leadCompanyName(lead) },
    { label: "Website", value: websiteUrl ?? "No verified website", href: websiteUrl ?? undefined },
    { label: "Contact", value: lead.company?.email ?? lead.company?.phone ?? "No contact" },
    { label: "Industry", value: lead.company?.industry_label ?? "-" },
    { label: "Municipality", value: lead.company?.municipality ?? lead.company?.city ?? "-" },
    { label: "Source", value: leadSourceLabel(lead) },
    { label: "Created", value: formatShortDate(lead.created_at) },
    { label: "Audit date", value: audit ? formatShortDate(audit.created_at) : "No audit yet" },
  ];
  const rawDetails = [
    { label: "Company", value: leadCompanyName(lead) },
    { label: "Org number", value: lead.company?.org_number ?? "-" },
    { label: "Legal form", value: legalForm ?? "-" },
    { label: "Website", value: websiteUrl ?? "No verified website", href: websiteUrl ?? undefined },
    { label: "Website confidence", value: lead.company?.website_confidence ?? "-" },
    { label: "Email", value: lead.company?.email ?? "-" },
    { label: "Phone", value: lead.company?.phone ?? "-" },
    { label: "Industry", value: lead.company?.industry_label ?? "-" },
    { label: "Industry code", value: lead.company?.industry_code ?? "-" },
    { label: "Municipality", value: lead.company?.municipality ?? "-" },
    { label: "County", value: lead.company?.county ?? "-" },
    { label: "Source", value: leadSourceLabel(lead) },
    { label: "Lead source raw", value: lead.source ?? "-" },
    { label: "Company source", value: lead.company?.source ?? "-" },
    { label: "Service", value: lead.service_interest ?? recommendedService },
    { label: "Owner", value: lead.assigned_to ?? "Kevin" },
    { label: "Lead created", value: formatShortDate(lead.created_at) },
    { label: "Lead updated", value: formatShortDate(lead.updated_at) },
    { label: "Company created", value: formatShortDate(lead.company?.created_at ?? null) },
    { label: "Company updated", value: formatShortDate(lead.company?.updated_at ?? null) },
  ];
  const badges = (
    <>
      <LeadStageBadge stage={mapLeadStage(lead.status)} />
      <ScoreBadge score={lead.score} />
      <PriorityBadge priority={mapLeadPriority(lead.priority)} />
    </>
  );
  const workspaceData: LeadWorkspaceData = {
    companyName: leadCompanyName(lead),
    location,
    status: mapLeadStage(lead.status),
    priority: mapLeadPriority(lead.priority),
    score: lead.score ?? 0,
    badges,
    websiteUrl: websiteUrl ?? null,
    summary,
    opportunityTitle: opportunity.title,
    recommendedService,
    estimatedValue: opportunity.estimatedValue,
    nextAction: lead.next_action ?? `Contact with ${recommendedService.toLowerCase()} angle`,
    salesAngle,
    emailSubject,
    emailBody,
    aiInsightCreatedAt: aiInsight ? formatShortDate(aiInsight.created_at) : null,
    packageName: recommendedPackage.packageName,
    packageReason: recommendedPackage.reason,
    confidence,
    closeProbability,
    stars: getOpportunityStars(lead),
    scoreBreakdown,
    topIssues: getIssueTooltips(opportunity.topIssues),
    technicalDetails,
    rawDetails,
    audit: buildAuditSummary(lead, formatShortDate),
    isLoadingAiInsight,
    isGeneratingAiInsight,
    aiInsightError,
    copiedMessage,
    hasInsight: Boolean(aiInsight),
    canGenerate: isKwstudioApiConfigured,
  };
  const workspaceActions = {
    onCopySubject: () => {
      void copyToClipboard(emailSubject);
    },
    onCopyEmail: () => {
      void copyToClipboard(emailBody);
    },
    onGenerate: () => {
      void handleGenerateAiInsight();
    },
    onRefresh: () => {
      void loadLatestAiInsight(lead.id, true);
    },
    onAudit: () => onAudit(lead),
    onQualify: () => onQualify(lead),
  };

  return (
    <>
      <LeadPreviewPanel
        data={workspaceData}
        actions={workspaceActions}
        onClose={onClose}
        onOpenWorkspace={() => setWorkspaceOpen(true)}
      />
      <LeadWorkspaceModal
        isOpen={workspaceOpen}
        activeTab={activeWorkspaceTab}
        data={workspaceData}
        actions={workspaceActions}
        onTabChange={setActiveWorkspaceTab}
        onClose={() => setWorkspaceOpen(false)}
      />
    </>
  );
}

export function LeadsPage() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<LeadSource | "All">("All");
  const [stage, setStage] = useState<LeadStage | "All">("All");
  const [priority, setPriority] = useState<LeadPriority | "All">("All");
  const [service, setService] = useState<LeadServiceInterest | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [leadResult, setLeadResult] = useState<LeadsResult>(defaultLeadResult);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiWorking, setIsApiWorking] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LeadWorkflowTab>("all");
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const refreshLeads = async () => {
    setIsLoading(true);
    const result = await getLeads();
    setLeadResult(result);
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    getLeads()
      .then((result) => {
        if (isMounted) setLeadResult(result);
      })
      .catch((error) => {
        console.error("Could not load leads.", error);
        if (isMounted) {
          setLeadResult({
            leads: [],
            latestImport: null,
            source: "error",
            error: error instanceof Error ? error.message : "Could not load leads.",
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const leads = leadResult.leads;
  const metrics = useMemo(() => buildLeadMetrics(leads), [leads]);
  const visibleMetrics = isLoading
    ? [
        { label: "Total leads", value: "...", detail: "Loading from Supabase", href: "/admin/leads" },
        { label: "New leads", value: "...", detail: "Loading from Supabase", href: "/admin/leads" },
      ]
    : metrics;
  useEffect(() => {
    setCurrentPage(1);
  }, [priority, query, service, source, stage]);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery = !normalized || leadSearchText(lead).includes(normalized);
      const matchesSource = source === "All" || leadSourceLabel(lead) === source;
      const matchesStage = stage === "All" || mapLeadStage(lead.status) === stage;
      const matchesPriority = priority === "All" || mapLeadPriority(lead.priority) === priority;
      const matchesService = service === "All" || leadServiceLabel(lead) === service;
      return (!normalized || matchesQuery) && matchesSource && matchesStage && matchesPriority && matchesService;
    });
  }, [leads, priority, query, service, source, stage]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [pageSize, rows, safeCurrentPage]);
  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  const followUps = useMemo(() => leads.filter((lead) => lead.next_action).slice(0, 4), [leads]);
  const aiSuggestions = useMemo(() => {
    const missingWebsite = leads.filter((lead) => !lead.company?.website_found).length;
    const lowSeo = leads.filter((lead) => (lead.latestAudit?.seo_score ?? 100) < 70).length;
    return [
      { id: "ai-websites", title: "Prioritize missing websites", detail: `${missingWebsite} leads have no detected website. Start with a simple credibility-site offer.`, meta: "Suggested" },
      { id: "ai-seo", title: "Use audit-first outreach", detail: `${lowSeo} leads show weak SEO scores. Lead with one visible improvement, not a long checklist.`, meta: "Suggested" },
      ...leadInsights.aiSuggestions.slice(0, 1),
    ];
  }, [leads]);

  const updateLocalStatus = (leadId: string, nextStatus: LeadStage) => {
    setLeadResult((current) => ({
      ...current,
      leads: current.leads.map((lead) => (
        lead.id === leadId ? { ...lead, status: nextStatus.toLowerCase().replace(/\s+/g, "_") } : lead
      )),
    }));
  };

  const handleStatusUpdate = async (lead: LeadWithCompanyAndAudit, nextStatus: LeadStage) => {
    const result = await updateLeadStatus(lead.id, nextStatus);
    setActionMessage(result.message);
    if (result.ok) updateLocalStatus(lead.id, nextStatus);
  };

  const handleQualifyLead = (lead: LeadWithCompanyAndAudit) => {
    void handleStatusUpdate(lead, "Qualified");
  };

  const handleDiscover = async (filters: ScbLeadFinderFilters) => {
    const scbRequest = buildScbRequest(filters);

    if (import.meta.env.DEV) {
      console.debug("SCB discovery request", scbRequest);
    }

    setIsApiWorking(true);
    try {
      const result = await discoverScbLeads(scbRequest);
      setActionMessage(result.ok
        ? `${hasScbNarrowingFilters(filters) ? "" : "No narrowing filters selected; this request may be broad. "}SCB import queued. ${result.data?.importedCount ?? 0} companies prepared. ${result.data?.skippedLegalFormCount ?? 0} death estate rows skipped.`
        : result.error ?? "SCB import could not be started.");
      if (result.ok) await refreshLeads();
    } finally {
      setIsApiWorking(false);
    }
  };

  const handleAuditAll = async () => {
    setIsApiWorking(true);
    try {
      const result = await auditAllWebsites();
      setActionMessage(result.ok
        ? `Website audits queued. ${result.data?.queued ?? 0} records queued.`
        : result.error ?? "Website audits could not be started.");
      if (result.ok) await refreshLeads();
    } finally {
      setIsApiWorking(false);
    }
  };

  const handleRecalculateScores = async () => {
    setIsApiWorking(true);
    try {
      const result = await recalculateLeadScores();
      setActionMessage(result.ok
        ? `Lead scores recalculated. ${result.data?.updated ?? 0} records updated.`
        : result.error ?? "Lead scores could not be recalculated.");
      if (result.ok) await refreshLeads();
    } finally {
      setIsApiWorking(false);
    }
  };

  const handleAudit = async (lead: LeadWithCompanyAndAudit) => {
    setIsApiWorking(true);
    try {
      const result = await auditLeadWebsite(lead.id);
      setActionMessage(result.ok
        ? `Website audit queued for ${leadCompanyName(lead)}.`
        : result.error ?? "Website audit could not be started.");
      if (result.ok) await refreshLeads();
    } finally {
      setIsApiWorking(false);
    }
  };

  const handleRefreshScore = async (lead: LeadWithCompanyAndAudit) => {
    setIsApiWorking(true);
    try {
      const result = await refreshLeadScore(lead.id);
      setActionMessage(result.ok
        ? `Lead score refreshed for ${leadCompanyName(lead)}.`
        : result.error ?? "Lead score could not be refreshed.");
      if (result.ok) await refreshLeads();
    } finally {
      setIsApiWorking(false);
    }
  };

  const leadTableColumns: Array<AdminTableColumn<LeadWithCompanyAndAudit>> = [
    {
      key: "lead",
      header: "Lead / company",
      render: (lead) => (
        <div className={`min-w-56 border-l-2 py-1 pl-3 ${mapLeadPriority(lead.priority) === "High" ? "border-[#2E75BD]" : "border-transparent"}`}>
          <strong className="block text-sm font-semibold text-gray-800">{leadCompanyName(lead)}</strong>
          <span className="mt-1 block truncate text-sm text-gray-500">{lead.company?.city ?? lead.company?.industry_label ?? "No company context"}</span>
        </div>
      ),
    },
    {
      key: "website",
      header: "Website",
      render: (lead) => (
        <div className="min-w-48">
          <WebsiteBadge lead={lead} />
        </div>
      ),
    },
    { key: "status", header: "Status", render: (lead) => <LeadStageBadge stage={mapLeadStage(lead.status)} /> },
    { key: "score", header: "Score", render: (lead) => <ScoreBadge score={lead.score} /> },
    { key: "priority", header: "Priority", render: (lead) => <PriorityBadge priority={mapLeadPriority(lead.priority)} /> },
    {
      key: "opportunity",
      header: "Opportunity",
      render: (lead) => (
        <div className="min-w-44">
          <span className="block truncate text-sm font-medium text-gray-800">{getRecommendedService(lead)}</span>
          <span className="mt-0.5 block text-xs text-gray-500">{getEstimatedValue(lead)}</span>
        </div>
      ),
    },
    { key: "next", header: "Next action", render: (lead) => <span className="block max-w-64 truncate text-sm text-gray-600">{lead.next_action ?? "Review lead"}</span> },
    { key: "owner", header: "Owner", render: (lead) => <span className="whitespace-nowrap text-sm text-gray-600">{lead.assigned_to ?? "Kevin"}</span> },
    {
      key: "actions",
      header: "Actions",
      render: (lead) => (
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-[#2E75BD] hover:text-[#2E75BD]"
            type="button"
            onClick={() => setSelectedLeadId(lead.id)}
          >
            Details
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Leads" description="A working dashboard for finding, qualifying and converting website opportunities.">
      <MetricGrid metrics={visibleMetrics} />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {isLoading ? "Loading leads" : leadResult.source === "supabase" ? "Connected to Supabase" : "Supabase not connected"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {leadResult.error ?? (isSupabaseConfigured ? "Lead data is read through the Supabase client." : "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to read live leads.")}
            </p>
          </div>
          <StatusBadge status={leadResult.source === "supabase" ? "Live" : "Draft"} />
        </div>
      </div>

      <AdminTabs tabs={leadWorkflowTabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "all" ? (
        <>
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Lead workspace</p>
              <p className="mt-1 text-sm text-gray-500">Filter, qualify and audit individual opportunities.</p>
            </div>
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => setIsDiscoveryOpen((current) => !current)}
            >
              {isDiscoveryOpen ? "Hide SCB tools" : "Show SCB tools"}
            </button>
          </div>

          {isDiscoveryOpen ? (
            <div className="mb-6">
              <ScbLeadFinderPanel
                onDiscover={handleDiscover}
                onAuditAll={handleAuditAll}
                onRecalculateScores={handleRecalculateScores}
                message={actionMessage}
                isWorking={isApiWorking}
              />
            </div>
          ) : actionMessage ? (
            <p className="mb-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">{actionMessage}</p>
          ) : null}

          <FilterBar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search leads, companies, contacts or services"
            filters={[
              { label: "Source", value: source, onChange: (value) => setSource(value as LeadSource | "All"), options: leadSources.map((value) => ({ label: value, value })) },
              { label: "Stage", value: stage, onChange: (value) => setStage(value as LeadStage | "All"), options: ["All", ...leadStageOrder].map((value) => ({ label: value, value })) },
              { label: "Priority", value: priority, onChange: (value) => setPriority(value as LeadPriority | "All"), options: leadPriorities.map((value) => ({ label: value, value })) },
              { label: "Service", value: service, onChange: (value) => setService(value as LeadServiceInterest | "All"), options: leadServices.map((value) => ({ label: value, value })) },
            ]}
          />
          {isLoading ? (
            <EmptyState title="Loading leads" description="Lead records are being loaded from Supabase." />
          ) : (
            <div className={selectedLead ? "grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]" : ""}>
              <div className="min-w-0">
                <AdminTable columns={leadTableColumns} rows={paginatedRows} getRowKey={(lead) => lead.id} emptyMessage="No leads found for the selected filters." />
                <LeadsTablePagination
                  currentPage={safeCurrentPage}
                  pageSize={pageSize}
                  totalRows={rows.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(nextPageSize) => {
                    setPageSize(nextPageSize);
                    setCurrentPage(1);
                  }}
                />
              </div>
              {selectedLead ? (
                <LeadDetailsPanel
                  lead={selectedLead}
                isWorking={isApiWorking}
                onClose={() => setSelectedLeadId(null)}
                onAudit={handleAudit}
                onQualify={handleQualifyLead}
              />
              ) : null}
            </div>
          )}
        </>
      ) : null}

      {activeTab === "pipeline" ? (
        <LeadPipeline leads={leads} />
      ) : null}

      {activeTab === "follow-ups" ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            {followUps.length > 0 ? (
              <TaskList
                items={followUps.map((lead) => ({
                  id: lead.id,
                  title: leadCompanyName(lead),
                  meta: formatShortDate(lead.updated_at),
                  description: lead.next_action ?? "Review lead",
                  status: mapDashboardStatus(lead.status),
                }))}
              />
            ) : (
              <EmptyState title="No follow-ups" description="No loaded leads have a next action yet." />
            )}
          </div>
          <InsightList title="AI suggestions" items={aiSuggestions} />
        </div>
      ) : null}

      {activeTab === "proposals" ? (
        <AdminTable
          columns={[
            { key: "proposal", header: "Proposal", render: (proposal: Proposal) => <strong className="text-gray-800">{proposal.title}</strong> },
            { key: "client", header: "Client", render: (proposal: Proposal) => proposal.client },
            { key: "value", header: "Value", render: (proposal: Proposal) => proposal.value },
            { key: "expires", header: "Expires", render: (proposal: Proposal) => proposal.expiry },
            { key: "status", header: "Status", render: (proposal: Proposal) => <StatusBadge status={proposal.status} /> },
          ]}
          rows={proposals}
          getRowKey={(proposal) => proposal.id}
        />
      ) : null}
    </AdminShell>
  );
}

export function PipelinePage() {
  const stages = ["New", "Qualified", "Proposal", "Won"];
  return (
    <AdminShell title="Pipeline" description="A kanban view of live sales opportunities and next steps.">
      <KanbanBoard
        columns={stages.map((stage) => ({
          id: stage,
          title: stage,
          items: pipelineDeals.filter((deal) => deal.stage === stage).map((deal) => (
            <article key={deal.id} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              <h3 className="truncate text-sm font-semibold text-gray-800">{deal.company}</h3>
              <p className="mt-1 truncate text-sm text-gray-500">{deal.service}</p>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-gray-800">{deal.value}</span>
                <span className="truncate text-gray-500">{deal.nextAction}</span>
              </div>
            </article>
          )),
        }))}
      />
    </AdminShell>
  );
}

export function ProposalsPage() {
  const columns: Array<AdminTableColumn<Proposal>> = [
    { key: "proposal", header: "Proposal", render: (proposal) => <strong className="text-gray-800">{proposal.title}</strong> },
    { key: "client", header: "Client", render: (proposal) => proposal.client },
    { key: "value", header: "Value", render: (proposal) => proposal.value },
    { key: "expires", header: "Expires", render: (proposal) => proposal.expiry },
    { key: "status", header: "Status", render: (proposal) => <StatusBadge status={proposal.status} /> },
  ];
  return <AdminShell title="Proposals" description="Track proposal value, expiry dates and approval status."><AdminTable columns={columns} rows={proposals} getRowKey={(proposal) => proposal.id} /></AdminShell>;
}

export function FollowUpsPage() {
  return (
    <AdminShell title="Follow-ups" description="A focused list of reminders, calls and next actions.">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TaskList items={followUps.map((item) => ({ id: item.id, title: item.title, meta: `${item.due} - ${item.channel}`, description: `${item.person}, ${item.company}`, status: item.status }))} />
        </div>
        <Panel title="Priority queue">
          <p className="text-sm leading-6 text-gray-500">Start with overdue or scheduled follow-ups, then confirm proposal feedback before the next business day.</p>
        </Panel>
      </div>
    </AdminShell>
  );
}

export function ProjectsPage() {
  const columns: Array<AdminTableColumn<AdminProject>> = [
    { key: "project", header: "Project", render: (project) => <strong className="text-gray-800">{project.name}</strong> },
    { key: "client", header: "Client", render: (project) => project.client },
    { key: "deadline", header: "Deadline", render: (project) => project.deadline },
    { key: "progress", header: "Progress", render: (project) => <div className="min-w-32"><Progress value={project.progress} /></div> },
    { key: "status", header: "Status", render: (project) => <StatusBadge status={project.status} /> },
  ];

  const nextDeadline = adminProjects[0];

  return (
    <AdminShell title="Projects" description="Track active builds, delivery health and client deadlines.">
      <MetricGrid metrics={projectStatusMetrics} />
      <WorkflowCards
        cards={[
          { title: "Projects", description: "Monitor active builds, status and delivery progress.", href: "/admin/projects" },
          { title: "Tasks", description: "Organize production work by owner and status.", href: "/admin/tasks" },
          { title: "Files", description: "Find client assets, planning documents and handoff files.", href: "/admin/files" },
        ]}
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {adminProjects.map((project) => (
          <Panel key={project.id} title={project.name}>
            <p className="text-sm text-gray-500">{project.scope}</p>
            <div className="mt-4"><Progress value={project.progress} /></div>
            <p className="mt-2 text-xs text-gray-500">Deadline {project.deadline}</p>
          </Panel>
        ))}
      </div>
      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Next deadline">
          <h3 className="text-sm font-semibold text-gray-800">{nextDeadline.name}</h3>
          <p className="mt-2 text-sm text-gray-500">{nextDeadline.client} - {nextDeadline.deadline}</p>
        </Panel>
        <Panel title="Task summary">
          <div className="grid gap-3">
            {["To do", "In progress", "Review", "Done"].map((status) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                <span className="text-sm text-gray-600">{status}</span>
                <strong className="text-sm text-gray-900">{adminTasks.filter((task) => task.status === status).length}</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Timeline title="Project activity" items={projectTimeline} />
      </div>
      <AdminTable columns={columns} rows={adminProjects} getRowKey={(project) => project.id} />
    </AdminShell>
  );
}

export function TasksPage() {
  const statuses = ["To do", "In progress", "Review", "Done"];
  return (
    <AdminShell title="Tasks" description="Production tasks grouped by current delivery state.">
      <KanbanBoard columns={statuses.map((status) => ({ id: status, title: status, items: adminTasks.filter((task) => task.status === status).map((task) => <article key={task.id} className="rounded-xl border border-gray-100 p-4"><h3 className="text-sm font-semibold text-gray-800">{task.title}</h3><p className="mt-1 text-sm text-gray-500">{task.project}</p><p className="mt-3 text-xs font-medium text-gray-400">{task.owner} - {task.due}</p></article>) }))} />
    </AdminShell>
  );
}

export function ClientsPage() {
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return clients.filter((client) => [client.name, client.contact, client.email, client.project].join(" ").toLowerCase().includes(normalized));
  }, [query]);

  const columns: Array<AdminTableColumn<Client>> = [
    { key: "client", header: "Client", render: (client) => <strong className="text-gray-800">{client.name}</strong> },
    { key: "contact", header: "Contact", render: (client) => client.contact },
    { key: "project", header: "Project", render: (client) => client.project },
    { key: "last", header: "Last contact", render: (client) => client.lastContact },
    { key: "status", header: "Status", render: (client) => <StatusBadge status={client.status} /> },
  ];

  return (
    <AdminShell title="Clients" description="A compact CRM view for active relationships and project context.">
      <MetricGrid metrics={clientHealthMetrics} />
      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        {featuredClients.map((client) => (
          <Panel key={client.id} title={client.name}>
            <p className="text-sm text-gray-500">{client.contact} - {client.health}</p>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Project</dt><dd className="font-medium text-gray-800">{client.activeProject}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Invoice</dt><dd className="font-medium text-gray-800">{client.latestInvoice}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Last contact</dt><dd className="font-medium text-gray-800">{client.lastContact}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Notes</dt><dd className="font-medium text-gray-800">{client.notes}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-gray-500">Value</dt><dd className="font-medium text-gray-800">{client.lifetimeValue}</dd></div>
            </dl>
          </Panel>
        ))}
      </div>
      <FilterBar search={query} onSearchChange={setQuery} searchPlaceholder="Search clients, contacts or projects" />
      <AdminTable columns={columns} rows={rows} getRowKey={(client) => client.id} />
    </AdminShell>
  );
}

export function FilesPage() {
  return (
    <AdminShell title="Files" description="Shared client assets, reports and handoff documents.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {files.map((file) => <Panel key={file.id} title={file.name}><p className="text-sm text-gray-500">{file.client} - {file.type}</p><p className="mt-4 text-sm font-medium text-gray-800">{file.size}</p><p className="mt-1 text-xs text-gray-400">Updated {file.updated}</p></Panel>)}
      </div>
    </AdminShell>
  );
}

export function WebsitesPage() {
  const columns: Array<AdminTableColumn<WebsiteReport>> = [
    { key: "client", header: "Client", render: (report) => <strong className="text-gray-800">{report.client}</strong> },
    { key: "report", header: "Report", render: (report) => report.name },
    { key: "score", header: "Score", render: (report) => `${report.score}/100` },
    { key: "date", header: "Date", render: (report) => report.date },
    { key: "status", header: "Status", render: (report) => <StatusBadge status={report.status} /> },
  ];

  return (
    <AdminShell title="Websites" description="A hub for site health, SEO, audits and hosting workflows.">
      <MetricGrid metrics={websiteHealthMetrics} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {websiteScores.map((score) => <ScoreCard key={score.label} {...score} />)}
      </div>
      <WorkflowCards
        cards={[
          { title: "Website Reports", description: "Review client report history, scores and delivery status.", href: "/admin/reports" },
          { title: "Website Analyzer", description: "Run audit checks and review recent analysis results.", href: "/admin/analyzer" },
          { title: "SEO", description: "Track keyword priorities and on-page checklist progress.", href: "/admin/seo" },
          { title: "Uptime", description: "Monitor availability, response times and incidents.", href: "/admin/uptime" },
          { title: "Domains", description: "Domain renewals and DNS workflow will live here.", status: "Coming soon" },
          { title: "Hosting", description: "Hosting plans, environments and launch notes will live here.", status: "Coming soon" },
        ]}
      />
      <AdminTable columns={columns} rows={recentWebsiteScans} getRowKey={(report) => report.id} />
    </AdminShell>
  );
}

export function ReportsPage() {
  const columns: Array<AdminTableColumn<WebsiteReport>> = [
    { key: "client", header: "Client", render: (report) => <strong className="text-gray-800">{report.client}</strong> },
    { key: "report", header: "Report", render: (report) => report.name },
    { key: "score", header: "Score", render: (report) => `${report.score}/100` },
    { key: "date", header: "Date", render: (report) => report.date },
    { key: "status", header: "Status", render: (report) => <StatusBadge status={report.status} /> },
  ];
  return <AdminShell title="Website Reports" description="Client report history with scores and delivery status."><AdminTable columns={columns} rows={websiteReports} getRowKey={(report) => report.id} /></AdminShell>;
}

export function AnalyzerPage() {
  return (
    <AdminShell title="Website Analyzer" description="Run a quick demo audit workflow and review recent analyses.">
      <div className="grid gap-6 xl:grid-cols-3">
        <FormCard title="Analyze a URL" description="Static v1 form for future analyzer automation.">
          <div className="space-y-4"><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue="https://example.com" /><button className="btn btn-primary" type="button">Run analysis</button></div>
        </FormCard>
        <div className="xl:col-span-2 grid gap-4 md:grid-cols-2">
          {analyses.map((analysis) => <Panel key={analysis.id} title={analysis.url}><p className="text-sm text-gray-500">{analysis.findings} findings queued for review.</p><p className="mt-4 text-2xl font-bold text-gray-800">{analysis.score}</p></Panel>)}
        </div>
      </div>
    </AdminShell>
  );
}

export function SeoPage() {
  return (
    <AdminShell title="SEO" description="Checklist status and keyword priorities for client sites.">
      <div className="grid gap-6 xl:grid-cols-2">
        <TaskList items={seoItems.map((item) => ({ id: item.id, title: item.page, meta: item.keyword, description: `${item.priority} priority`, status: item.status }))} />
        <Panel title="SEO priorities"><p className="text-sm leading-6 text-gray-500">Focus on title clarity, internal links and local service page coverage before expanding content volume.</p></Panel>
      </div>
    </AdminShell>
  );
}

export function UptimePage() {
  return (
    <AdminShell title="Uptime" description="Monitor site availability and response time.">
      <div className="grid gap-4 md:grid-cols-3">
        {uptimeMonitors.map((monitor) => <Panel key={monitor.id} title={monitor.site}><p className="text-sm text-gray-500">{monitor.status}</p><p className="mt-4 text-2xl font-bold text-gray-800">{monitor.uptime}</p><p className="mt-1 text-xs text-gray-400">{monitor.response} - {monitor.incident}</p></Panel>)}
      </div>
    </AdminShell>
  );
}

export function InvoicesPage() {
  return <AdminShell title="Invoices" description="Track paid, unpaid and overdue invoices."><AdminTable columns={invoiceColumns} rows={invoices} getRowKey={(invoice) => invoice.id} /></AdminShell>;
}

export function PaymentsPage() {
  const columns: Array<AdminTableColumn<Payment>> = [
    { key: "client", header: "Client", render: (payment) => <strong className="text-gray-800">{payment.client}</strong> },
    { key: "amount", header: "Amount", render: (payment) => payment.amount },
    { key: "method", header: "Method", render: (payment) => payment.method },
    { key: "date", header: "Date", render: (payment) => payment.date },
  ];
  return <AdminShell title="Payments" description="Recent payment activity and collection channels."><AdminTable columns={columns} rows={payments} getRowKey={(payment) => payment.id} /></AdminShell>;
}

export function ExpensesPage() {
  const columns: Array<AdminTableColumn<Expense>> = [
    { key: "vendor", header: "Vendor", render: (expense) => <strong className="text-gray-800">{expense.vendor}</strong> },
    { key: "category", header: "Category", render: (expense) => expense.category },
    { key: "amount", header: "Amount", render: (expense) => expense.amount },
    { key: "date", header: "Date", render: (expense) => expense.date },
  ];
  return <AdminShell title="Expenses" description="A simple expense tracker grouped by business category."><AdminTable columns={columns} rows={expenses} getRowKey={(expense) => expense.id} /></AdminShell>;
}

export function FinancePage() {
  return (
    <AdminShell title="Finance" description="A hub for invoices, payments, expenses and bookkeeping workflows.">
      <MetricGrid metrics={financeMetrics} />
      <WorkflowCards
        cards={[
          { title: "Invoices", description: "Track paid, unpaid and overdue client invoices.", href: "/admin/invoices" },
          { title: "Payments", description: "Review recent payment activity and collection channels.", href: "/admin/payments" },
          { title: "Expenses", description: "Keep software, hosting and operating costs organized.", href: "/admin/expenses" },
          { title: "Taxes / VAT", description: "VAT reporting and tax preparation workflow will live here.", status: "Coming soon" },
          { title: "Bookkeeping", description: "Run the monthly document and reconciliation checklist.", href: "/admin/bookkeeping" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Recent invoices</h2>
            <Link className="text-sm font-medium text-[#2E75BD]" to="/admin/invoices">View all</Link>
          </div>
          <AdminTable columns={invoiceColumns} rows={invoices} getRowKey={(invoice) => invoice.id} />
        </div>
        <div className="grid gap-6">
          <Timeline title="Finance activity" items={financeActivity} />
          <Panel title="VAT reminder">
            <p className="text-sm leading-6 text-gray-500">Prepare June invoice exports and software expense receipts before the next bookkeeping review.</p>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}

export function BookkeepingPage() {
  return <AdminShell title="Bookkeeping" description="Monthly admin checklist for documents, invoices and reconciliations."><TaskList items={bookkeepingTasks.map((task) => ({ id: task.id, title: task.title, meta: task.meta, description: task.detail, status: task.status }))} /></AdminShell>;
}

export function AiToolsPage() {
  const [query, setQuery] = useState("");
  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return aiTools.filter((tool) => [tool.title, tool.description].join(" ").toLowerCase().includes(normalized));
  }, [query]);
  const pinnedTools = aiTools.filter((tool) => aiPinnedTools.includes(tool.title));

  return (
    <AdminShell title="AI Hub" description="Internal helpers for proposals, copy, lead research and website review.">
      <FilterBar search={query} onSearchChange={setQuery} searchPlaceholder="Search AI tools" />
      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Pinned tools">
          <div className="grid gap-3">
            {pinnedTools.map((tool) => <Link key={tool.href} to={tool.href} className="rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-[#2E75BD]">{tool.title}</Link>)}
          </div>
        </Panel>
        <Panel title="Recently used">
          <div className="grid gap-3">
            {aiRecentTools.map((tool) => <Link key={tool.href} to={tool.href} className="rounded-lg border border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-[#2E75BD]"><span className="block">{tool.title}</span><span className="mt-1 block text-xs font-normal text-gray-500">{tool.meta}</span></Link>)}
          </div>
        </Panel>
        <Panel title="Quick prompts">
          <div className="grid gap-3">
            {aiQuickPrompts.map((prompt) => <div key={prompt.id} className="rounded-lg border border-gray-100 px-4 py-3"><h3 className="text-sm font-semibold text-gray-800">{prompt.title}</h3><p className="mt-1 text-sm leading-6 text-gray-500">{prompt.prompt}</p></div>)}
          </div>
        </Panel>
      </div>
      <WorkflowCards
        cards={filteredTools.map((tool) => ({
          title: tool.title,
          description: tool.description,
          href: tool.href,
          status: tool.status,
        }))}
      />
    </AdminShell>
  );
}

export function ProposalGeneratorPage() {
  return (
    <AdminShell title="Proposal Generator" description="Draft a proposal outline from project scope and client goals.">
      <div className="grid gap-6 xl:grid-cols-2">
        <FormCard title="Project input"><div className="space-y-4"><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue="Local service website" /><textarea className="min-h-32 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" defaultValue="Premium website, copy direction, SEO setup and launch support." /><button className="btn btn-primary" type="button">Generate draft</button></div></FormCard>
        <Panel title="Preview"><p className="text-sm leading-6 text-gray-500">This proposal will focus on clear positioning, conversion-focused pages and a launch plan with measurable milestones.</p></Panel>
      </div>
    </AdminShell>
  );
}

export function CopywriterPage() {
  return (
    <AdminShell title="Copywriter" description="Create structured copy drafts for website sections.">
      <div className="grid gap-6 xl:grid-cols-3">
        <FormCard title="Copy brief"><div className="space-y-4"><select className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm"><option>Homepage hero</option><option>Service section</option><option>About intro</option></select><textarea className="min-h-32 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm" defaultValue="Confident, direct and premium." /></div></FormCard>
        <div className="xl:col-span-2"><Panel title="Output"><p className="text-sm leading-6 text-gray-500">We build websites that make your business easier to understand, trust and contact.</p></Panel></div>
      </div>
    </AdminShell>
  );
}

export function LeadFinderPage() {
  return (
    <AdminShell title="Lead Finder" description="Search for potential business clients and qualify opportunities.">
      <FormCard title="Search workflow"><div className="grid gap-3 md:grid-cols-[1fr_auto]"><input className="h-11 rounded-lg border border-gray-200 px-4 text-sm" defaultValue="Stockholm local businesses" /><button className="btn btn-primary" type="button">Find leads</button></div></FormCard>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{prospects.map((prospect) => <Panel key={prospect.id} title={prospect.company}><p className="text-sm text-gray-500">{prospect.industry}</p><p className="mt-4 text-sm font-medium text-gray-800">{prospect.fit}</p></Panel>)}</div>
    </AdminShell>
  );
}

export function CalendarPage() {
  return <AdminShell title="Calendar" description="Upcoming meetings, launches and operational reminders."><TaskList items={calendarEvents.map((event) => ({ id: event.id, title: event.title, meta: `${event.date} - ${event.type}`, description: event.client, status: event.status }))} /></AdminShell>;
}

export function EmailPage() {
  return (
    <AdminShell title="Email" description="Inbox-style overview for client messages and lead replies.">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><TaskList items={emailMessages.map((message) => ({ id: message.id, title: message.subject, meta: `${message.sender} - ${message.date}`, description: message.snippet, status: message.status }))} /></div>
        <EmptyState title="Select a message" description="A detailed message preview can live here when live email integration is added." />
      </div>
    </AdminShell>
  );
}

export function SettingsPage() {
  return (
    <AdminShell title="Settings" description="Profile, company, brand and workspace preferences for KWStudio admin.">
      <div className="grid gap-6 xl:grid-cols-2">
        <FormCard title="General"><div className="space-y-4"><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue={settingsProfile.studioName} /><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue={settingsProfile.email} /><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue={settingsProfile.timezone} /></div></FormCard>
        <FormCard title="Company"><div className="space-y-4"><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue="KWStudio AB" /><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue={settingsProfile.location} /><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue="Web design and development" /></div></FormCard>
        <FormCard title="Branding"><div className="space-y-4"><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue={settingsProfile.brandColor} /><input className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm" defaultValue="Inter" /></div></FormCard>
        <FormCard title="Notifications"><div className="space-y-4">{["Weekly summaries", "Lead reminders", "Launch alerts"].map((preference) => <label key={preference} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm font-medium text-gray-700"><span>{preference}</span><input type="checkbox" defaultChecked /></label>)}</div></FormCard>
        <Panel title="Integrations"><div className="grid gap-3">{["Supabase", "Email", "Analytics", "Invoicing"].map((item) => <div key={item} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm"><span className="font-medium text-gray-700">{item}</span><span className="text-gray-500">Coming soon</span></div>)}</div></Panel>
        <Panel title="API Keys"><p className="text-sm leading-6 text-gray-500">API key storage is disabled in this static demo. No secrets are shown or stored.</p></Panel>
        <Panel title="Security"><p className="text-sm leading-6 text-gray-500">Authentication, roles and audit logs will be configured when the admin is connected to Supabase.</p></Panel>
      </div>
    </AdminShell>
  );
}
