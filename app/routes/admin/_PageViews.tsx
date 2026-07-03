import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { AlertCircle, ArrowRight, CheckCircle2, Download, FileCheck2, Plus, ReceiptText, Upload } from "lucide-react";
import { AdminTabs as FinanceTabs } from "~/components/admin/AdminTabs";
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
import {
  activityItems,
  financeActions,
  assets as financeAssets,
  basAccountSuggestions,
  bookkeepingChecklist,
  cashFlow,
  categoryRules,
  backendInsights,
  emptyStateCopy,
  expenses as financeExpenses,
  financeKpiGroups,
  financeOverview,
  financeQuickActions,
  financeSettings,
  financeTabs,
  importMapping,
  importPreviewRows,
  importResult,
  importStatus,
  importSteps,
  invoices as financeInvoices,
  journalEntries,
  receipts as financeReceipts,
  reports as financeReports,
  reportStatus,
  supplierRules,
  systemSuggestion,
  financeHealth,
  taxEstimate,
  taxPocket,
  transactions as financeTransactions,
  outstandingInvoices,
  type FinanceAsset,
  type FinanceExpense,
  type FinanceInvoice,
  type FinanceReceipt,
  type FinanceReport,
  type FinanceTabId,
  type FinanceTransaction,
  type JournalEntry,
} from "~/data/finance";
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
import {
  createFinanceSupplier,
  createOwnerExpense,
  getFinanceAccountsCatalog,
  getFinanceImports,
  getFinanceSuppliers,
  getOwnerExpense,
  getOwnerExpenses,
  getFinanceReceipts,
  getFinanceTransactions,
  generateSieExport,
  getVatPeriods,
  ensureVatPeriod,
  calculateVatPeriod,
  getVatPeriodReport,
  getVatPeriodDeclaration,
  lockVatPeriod,
  unlockVatPeriod,
  submitVatPeriod,
  closeVatPeriod,
  getVatPeriodHistory,
  importRevolutCsv,
  isFinanceApiConfigured,
  matchFinanceReceipt,
  postOwnerExpense,
  recalculateReceiptMatches,
  reimburseOwnerExpense,
  unmatchFinanceReceipt,
  updateFinanceSupplier,
  updateOwnerExpense,
  uploadFinanceReceipt,
  type FinanceAccountCatalogDto,
  type FinanceImportBatchDto,
  type FinanceImportResultDto,
  type FinanceSupplierDto,
  type OwnerExpenseDto,
  type OwnerExpensePaymentSource,
  type FinanceReceiptCandidateDto,
  type FinanceReceiptDto,
  type FinanceTransactionDto,
  type SieExportMetadata,
  type VatDeclarationBoxesDto,
  type VatPeriodCalculatedDto,
  type VatPeriodHistoryEventDto,
  type VatPeriodStatus,
  type VatReportDto,
} from "~/services/financeApi";
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
                      <StatusBadge status={mapLeadPriority(lead.priority)} />
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
      <StatusBadge status={mapLeadStage(lead.status)} />
      <ScoreBadge score={lead.score} />
      <StatusBadge status={mapLeadPriority(lead.priority)} />
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
    { key: "status", header: "Status", render: (lead) => <StatusBadge status={mapLeadStage(lead.status)} /> },
    { key: "score", header: "Score", render: (lead) => <ScoreBadge score={lead.score} /> },
    { key: "priority", header: "Priority", render: (lead) => <StatusBadge status={mapLeadPriority(lead.priority)} /> },
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

function FinanceKpiGrid({ metrics }: { metrics: Array<{ label: string; value: string; detail: string }> }) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MiniMetricCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} />
      ))}
    </div>
  );
}

function FinancePanel({ title, children, description }: { title: string; children: ReactNode; description?: string }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FinanceDefinitionList({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <div className="divide-y divide-gray-100">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500">{row.label}</span>
          <strong className="text-sm font-semibold text-gray-800">{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

function FinanceQuickActionButtons({
  onImportCsv,
  onOpenTab,
}: {
  onImportCsv: () => void;
  onOpenTab: (tabId: FinanceTabId) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {financeQuickActions.map((action) => {
        const Icon = action.icon;
        const handleClick = () => {
          if (action.label === "Import CSV") {
            onImportCsv();
            return;
          }

          if (action.label === "Add transaction") {
            onOpenTab("transactions");
            return;
          }

          if (action.label === "Upload receipt") {
            onOpenTab("receipts");
            return;
          }

          if (action.label === "Generate VAT report") {
            onOpenTab("vat");
          }
        };

        return (
          <button
            key={action.label}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:border-[#2E75BD] hover:text-[#2E75BD]"
            type="button"
            onClick={handleClick}
          >
            <Icon className="size-4" aria-hidden="true" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

function financeStatus(status: FinanceTransaction["status"]) {
  if (status === "review") return "Review";
  if (status === "ready") return "Ready";
  return "Posted";
}

function receiptStatus(status: FinanceTransaction["receiptStatus"]) {
  if (status === "matched") return "Matched";
  if (status === "missing") return "Missing receipt";
  if (status === "not_required") return "Ready";
  return "Review";
}

function toNumber(value: number | string | null | undefined) {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapBackendTransaction(transaction: FinanceTransactionDto): FinanceTransaction {
  const status = transaction.status === "posted" ? "posted" : transaction.status === "ready" ? "ready" : "review";
  const receipt = transaction.receipt_status === "matched"
    ? "matched"
    : transaction.receipt_status === "not_required"
      ? "not_required"
      : transaction.receipt_status === "needs_review"
        ? "needs_review"
        : "missing";

  return {
    id: transaction.id,
    source: transaction.source === "manual" ? "manual" : "revolut_csv",
    externalId: transaction.external_id,
    transactionType: transaction.transaction_type === "income" || transaction.transaction_type === "transfer" || transaction.transaction_type === "unknown"
      ? transaction.transaction_type
      : "expense",
    bookingDate: transaction.booking_date?.slice(0, 10) ?? "-",
    paymentDate: transaction.payment_date?.slice(0, 10) ?? "-",
    description: transaction.description,
    grossAmount: toNumber(transaction.gross_amount),
    fee: toNumber(transaction.fee),
    currency: transaction.currency === "EUR" || transaction.currency === "USD" ? transaction.currency : "SEK",
    category: transaction.category ?? "Uncategorized",
    basAccount: transaction.bas_account ?? "-",
    vatRate: toNumber(transaction.vat_rate),
    vatAmount: toNumber(transaction.vat_amount),
    receiptStatus: receipt,
    aiConfidence: status === "review" ? 0 : 100,
    status,
  };
}

function formatFinanceAmount(amount: number, currency = "SEK") {
  const formatted = Math.abs(amount).toLocaleString("sv-SE", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });

  return `${amount < 0 ? "-" : "+"}${formatted} ${currency}`;
}

function formatReceiptAmount(value: number | string | null | undefined, currency = "SEK") {
  const amount = toNumber(value);
  if (!amount) return "-";
  return `${amount.toLocaleString("sv-SE", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })} ${currency}`;
}

function receiptMatchStatus(status: string) {
  if (status === "matched") return "Matched";
  if (status === "suggested") return "Ready";
  if (status === "unmatched") return "Review";
  return "Pending";
}


function formatKr(value: number | string | null | undefined) {
  const n = toNumber(value);
  return `${n.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;
}

function toVatFrequencyLabel(value: "monthly" | "quarterly" | "yearly") {
  if (value === "monthly") return "Monthly";
  if (value === "quarterly") return "Quarterly";
  return "Yearly";
}

function buildVatPeriodInput(frequency: "monthly" | "quarterly" | "yearly", year: number) {
  const now = new Date();
  if (frequency === "yearly") {
    return {
      periodType: frequency,
      periodStart: `${year}-01-01`,
      periodEnd: `${year}-12-31`,
    };
  }

  if (frequency === "quarterly") {
    const quarter = year === now.getFullYear() ? Math.floor(now.getMonth() / 3) + 1 : 1;
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = startMonth + 2;
    const endDate = new Date(Date.UTC(year, endMonth, 0)).getUTCDate();
    return {
      periodType: frequency,
      periodStart: `${year}-${String(startMonth).padStart(2, "0")}-01`,
      periodEnd: `${year}-${String(endMonth).padStart(2, "0")}-${String(endDate).padStart(2, "0")}`,
    };
  }

  const month = year === now.getFullYear() ? now.getMonth() + 1 : 1;
  const endDate = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    periodType: frequency,
    periodStart: `${year}-${String(month).padStart(2, "0")}-01`,
    periodEnd: `${year}-${String(month).padStart(2, "0")}-${String(endDate).padStart(2, "0")}`,
  };
}

function transactionSummary(transaction: FinanceReceiptDto["best_transaction"] | FinanceReceiptDto["confirmed_transaction"]) {
  if (!transaction) return "-";
  return `${transaction.description} - ${formatFinanceAmount(toNumber(transaction.gross_amount), transaction.currency)}`;
}

function OverviewTab({
  backendImports,
  backendTransactions,
}: {
  backendImports: FinanceImportBatchDto[];
  backendTransactions: FinanceTransaction[];
}) {
  const [, setSearchParams] = useSearchParams();
  const openTab = (tabId: string) => setSearchParams({ tab: tabId });
  const latestImport = backendImports[0];
  const reviewCount = backendTransactions.length > 0
    ? backendTransactions.filter((transaction) => transaction.status === "review").length
    : 3;
  const missingReceiptCount = backendTransactions.length > 0
    ? backendTransactions.filter((transaction) => transaction.receiptStatus === "missing").length
    : 2;
  const readyCount = backendTransactions.length > 0
    ? backendTransactions.filter((transaction) => transaction.status === "ready").length
    : 39;
  const dynamicActions = financeActions.map((item) => {
    if (item.id === "act-001") return { ...item, title: `${reviewCount} transactions need review` };
    if (item.id === "act-002") return { ...item, title: `${missingReceiptCount} receipts missing` };
    return item;
  });
  const dynamicImportStatus = latestImport
    ? [
        { label: "Last Revolut CSV import", value: new Date(latestImport.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }), detail: latestImport.filename ?? "Uploaded CSV" },
        { label: "Rows imported", value: String(latestImport.total_rows), detail: "Rows accepted from CSV" },
        { label: "Categorized", value: String(latestImport.categorized_rows), detail: "Matched by backend-ready rules" },
        { label: "Need review", value: String(latestImport.review_rows), detail: "Awaiting approval" },
      ]
    : importStatus;
  const categorizedRows = latestImport?.categorized_rows ?? readyCount;
  const totalRows = latestImport?.total_rows ?? 42;
  const categorizedProgress = totalRows > 0 ? Math.round((categorizedRows / totalRows) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {financeOverview.map((metric) => {
          const Icon = metric.icon;

          return (
            <button
              key={metric.label}
              className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-[#2E75BD] hover:shadow-theme-xs md:p-6"
              type="button"
              onClick={() => metric.targetTab ? openTab(metric.targetTab) : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">{metric.label}</span>
                  <strong className="mt-2 block text-2xl font-bold text-gray-800">{metric.value}</strong>
                </div>
                {Icon ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-[#eff6ff]">
                    <Icon className="size-5 text-gray-700 group-hover:text-[#2E75BD]" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-500">{metric.detail}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2E75BD]">
                View <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </button>
          );
        })}

        <button
          className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-[#2E75BD] hover:shadow-theme-xs md:p-6"
          type="button"
          onClick={() => openTab(taxPocket.targetTab)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Tax pocket target</span>
              <strong className="mt-2 block text-2xl font-bold text-gray-800">{taxPocket.current}</strong>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-[#eff6ff]">
              <ReceiptText className="size-5 text-gray-700 group-hover:text-[#2E75BD]" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-gray-500">
              <span>Current: {taxPocket.current}</span>
              <span>Target: {taxPocket.target}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-[#2E75BD]" style={{ width: `${taxPocket.progress}%` }} />
            </div>
            <p className="text-sm leading-6 text-gray-500">Missing: {taxPocket.missing}</p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2E75BD]">
            View <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </button>
      </div>

      <FinancePanel title="Action Center" description="Practical bookkeeping tasks for the current period.">
        <div className="grid gap-3 xl:grid-cols-5">
          {dynamicActions.map((item) => (
            <div key={item.id} className="flex h-full flex-col justify-between rounded-xl border border-gray-100 p-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-500">{item.detail}</p>
              </div>
              <button
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2E75BD]"
                type="button"
                onClick={() => openTab(item.targetTab)}
              >
                {item.actionLabel}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </FinancePanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <FinancePanel title="Finance Health">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
            <div className="lg:w-48">
              <span className="text-sm font-medium text-gray-500">{financeHealth.label}</span>
              <strong className="mt-2 block text-4xl font-bold text-gray-800">{financeHealth.score}</strong>
              <div className="mt-4 h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-[#2E75BD]" style={{ width: `${financeHealth.progress}%` }} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-6 text-gray-500">{financeHealth.summary}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {financeHealth.breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FinancePanel>

        <FinancePanel title="Import status">
          <div className="grid gap-3 sm:grid-cols-2">
            {dynamicImportStatus.map((item) => (
              <div key={item.label} className="rounded-xl bg-gray-50 p-3">
                <span className="text-xs font-medium text-gray-500">{item.label}</span>
                <strong className="mt-1 block text-lg text-gray-800">{item.value}</strong>
                <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
              <span>{categorizedRows} / {totalRows} categorized</span>
              <span>Calculated from latest CSV import</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-[#2E75BD]" style={{ width: `${categorizedProgress}%` }} />
            </div>
            <p className="mt-3 text-xs font-medium text-gray-500">Backend-ready demo metric.</p>
          </div>
        </FinancePanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <FinancePanel title="Cash flow" description="Demo movement for the current month.">
          <div className="space-y-3">
            {cashFlow.map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-100 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{item.label}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">{item.detail}</p>
                  </div>
                  <strong className="text-sm text-gray-800">{item.value}</strong>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-100">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </FinancePanel>

        <FinancePanel title="Backend insights" description="Calculated demo metrics from transaction history and latest import.">
          <div className="space-y-3">
            {backendInsights.map((insight) => (
              <div key={insight} className="flex gap-3 rounded-xl bg-gray-50 p-3 text-sm leading-6 text-gray-700">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2E75BD]" aria-hidden="true" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </FinancePanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <FinancePanel title="Outstanding invoices">
          <div className="space-y-3">
            {outstandingInvoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{invoice.client}</h3>
                  <p className="mt-1 text-sm text-gray-500">{invoice.amount} - {invoice.due}</p>
                </div>
                <StatusBadge status={invoice.status} />
              </div>
            ))}
          </div>
          <button className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#2E75BD]" type="button" onClick={() => openTab("invoices")}>
            View invoices
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </FinancePanel>
        <div className="xl:col-span-2">
          <Timeline title="Recent finance activity" items={activityItems.map((item) => ({ ...item, status: "Done" }))} />
        </div>
      </div>
    </div>
  );
}

function ImportTab({
  backendImports,
  importResultState,
  importError,
  isImporting,
  onImportFile,
  onOpenFilePicker,
}: {
  backendImports: FinanceImportBatchDto[];
  importResultState: FinanceImportResultDto | null;
  importError: string | null;
  isImporting: boolean;
  onImportFile: (file: File | null | undefined) => void;
  onOpenFilePicker: () => void;
}) {
  const resultRows = importResultState
    ? [
        { label: "Rows detected", value: String(importResultState.totalRows) },
        { label: "Imported rows", value: String(importResultState.importedRows) },
        { label: "Duplicates skipped", value: String(importResultState.duplicateRows) },
        { label: "Skipped rows", value: String(importResultState.skippedRows) },
        { label: "Categorized", value: String(importResultState.categorizedRows) },
        { label: "Need review", value: String(importResultState.reviewRows) },
      ]
    : importResult;
  const columns: Array<AdminTableColumn<(typeof importPreviewRows)[number]>> = [
    { key: "typ", header: "Typ", render: (row) => row.typ },
    { key: "produkt", header: "Produkt", render: (row) => row.produkt },
    { key: "startdatum", header: "Startdatum", render: (row) => row.startdatum },
    { key: "slutförtDatum", header: "Slutfört datum", render: (row) => row.slutförtDatum },
    { key: "beskrivning", header: "Beskrivning", render: (row) => <strong className="text-gray-800">{row.beskrivning}</strong> },
    { key: "belopp", header: "Belopp", render: (row) => row.belopp },
    { key: "avgift", header: "Avgift", render: (row) => row.avgift },
    { key: "valuta", header: "Valuta", render: (row) => row.valuta },
    { key: "state", header: "State", render: (row) => row.state },
    { key: "saldo", header: "Saldo", render: (row) => row.saldo },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <FinancePanel title="CSV Import Wizard" description={emptyStateCopy.csv}>
          <label
            className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#2E75BD]/40 bg-[#eff6ff] p-6 text-center transition hover:border-[#2E75BD]"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onImportFile(event.dataTransfer.files[0]);
            }}
            onClick={(event) => {
              event.preventDefault();
              onOpenFilePicker();
            }}
          >
            <Upload className="size-10 text-[#2E75BD]" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-gray-800">Drop Revolut CSV here</h3>
            <p className="mt-2 text-sm text-gray-500">Accepted format: .csv</p>
            <p className="mt-1 text-sm font-medium text-gray-700">Demo filename: revolut-pro-transactions-july.csv</p>
            <span className="btn btn-primary mt-5">{isImporting ? "Importing..." : "Select CSV file"}</span>
          </label>
          {importError ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{importError}</p> : null}
          {importResultState ? (
            <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
              CSV import completed. Batch ID: {importResultState.batchId}
            </p>
          ) : null}
        </FinancePanel>

        <FinancePanel title="Import result">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {resultRows.map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-100 p-3">
                <span className="text-sm text-gray-500">{item.label}</span>
                <strong className="mt-1 block text-2xl text-gray-800">{item.value}</strong>
              </div>
            ))}
          </div>
        </FinancePanel>
      </div>

      <FinancePanel title="Wizard steps">
        <div className="grid gap-3 md:grid-cols-3">
          {importSteps.map((step, index) => (
            <div key={step} className="rounded-xl border border-gray-100 p-4">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#eff6ff] text-sm font-semibold text-[#2E75BD]">{index + 1}</span>
              <h3 className="mt-3 text-sm font-semibold text-gray-800">{step}</h3>
            </div>
          ))}
        </div>
      </FinancePanel>

      {backendImports.length > 0 ? (
        <FinancePanel title="Import history" description="Latest backend import batches.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {backendImports.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-800">{item.filename ?? "Revolut CSV"}</h3>
                <p className="mt-1 text-xs font-medium text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                <p className="mt-3 text-sm text-gray-500">
                  {item.imported_rows} imported, {item.duplicate_rows} duplicates, {item.review_rows} review.
                </p>
              </div>
            ))}
          </div>
        </FinancePanel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Revolut CSV preview</h2>
          <AdminTable columns={columns} rows={importPreviewRows} getRowKey={(row) => row.id} />
        </div>
        <FinancePanel title="Internal mapping">
          <FinanceDefinitionList rows={importMapping.map((item) => ({ label: item.source, value: item.target }))} />
        </FinancePanel>
      </div>
    </div>
  );
}

function TransactionsTab({
  backendTransactions,
  onOpenReceipts,
}: {
  backendTransactions: FinanceTransaction[];
  onOpenReceipts: () => void;
}) {
  const [filter, setFilter] = useState("all");
  const rows = backendTransactions.length > 0 ? backendTransactions : financeTransactions;
  const filteredRows = rows.filter((transaction) => {
    if (filter === "all") return true;
    if (filter === "missing_receipt") return transaction.receiptStatus === "missing";
    return transaction.status === filter;
  });
  const reviewTransaction = rows.find((transaction) => transaction.status === "review");
  const columns: Array<AdminTableColumn<FinanceTransaction>> = [
    { key: "date", header: "Date", render: (transaction) => transaction.bookingDate },
    { key: "description", header: "Description", render: (transaction) => <strong className="text-gray-800">{transaction.description}</strong> },
    { key: "type", header: "Type", render: (transaction) => transaction.transactionType },
    { key: "amount", header: "Amount", render: (transaction) => formatFinanceAmount(transaction.grossAmount, transaction.currency) },
    { key: "category", header: "Category", render: (transaction) => transaction.category },
    { key: "bas", header: "BAS account", render: (transaction) => transaction.basAccount },
    { key: "vat", header: "VAT", render: (transaction) => `${transaction.vatRate}%` },
    { key: "receipt", header: "Receipt", render: (transaction) => <StatusBadge status={receiptStatus(transaction.receiptStatus)} /> },
    { key: "confidence", header: "Confidence", render: (transaction) => `${transaction.aiConfidence}%` },
    { key: "status", header: "Status", render: (transaction) => <StatusBadge status={financeStatus(transaction.status)} /> },
    {
      key: "action",
      header: "Action",
      render: (transaction) => transaction.receiptStatus === "missing" ? (
        <button className="text-sm font-semibold text-[#2E75BD]" type="button" onClick={onOpenReceipts}>
          Upload receipt
        </button>
      ) : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <FinanceKpiGrid metrics={financeKpiGroups.transactions} />
      <FilterBar
        filters={[{
          label: "Status",
          value: filter,
          options: [
            { label: "All", value: "all" },
            { label: "Needs review", value: "review" },
            { label: "Missing receipt", value: "missing_receipt" },
            { label: "Ready", value: "ready" },
            { label: "Posted", value: "posted" },
          ],
          onChange: setFilter,
        }]}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <AdminTable columns={columns} rows={filteredRows} getRowKey={(transaction) => transaction.id} />
        <FinancePanel title="System suggestion" description={reviewTransaction ? `Reviewing ${reviewTransaction.description}` : "No transaction selected."}>
          <FinanceDefinitionList
            rows={[
              { label: "Suggested category", value: systemSuggestion.suggestedCategory },
              { label: "Suggested BAS account", value: systemSuggestion.suggestedBasAccount },
              { label: "Suggested VAT rate", value: systemSuggestion.suggestedVatRate },
              { label: "Confidence", value: systemSuggestion.confidence },
            ]}
          />
          <div className="mt-5 grid gap-2">
            {["Approve", "Change", "Mark private"].map((label) => (
              <button key={label} className={label === "Approve" ? "btn btn-primary" : "btn border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD]"} type="button">
                {label}
              </button>
            ))}
          </div>
        </FinancePanel>
      </div>
    </div>
  );
}

function InvoicesFinanceTab() {
  const columns: Array<AdminTableColumn<FinanceInvoice>> = [
    { key: "invoice", header: "Invoice", render: (invoice) => <strong className="text-gray-800">{invoice.id}</strong> },
    { key: "client", header: "Client", render: (invoice) => invoice.client },
    { key: "project", header: "Project", render: (invoice) => invoice.project },
    { key: "amount", header: "Amount", render: (invoice) => invoice.amount },
    { key: "vat", header: "VAT", render: (invoice) => invoice.vat },
    { key: "due", header: "Due date", render: (invoice) => invoice.dueDate },
    { key: "status", header: "Status", render: (invoice) => <StatusBadge status={invoice.status} /> },
    { key: "matched", header: "Matched payment", render: (invoice) => invoice.matchedPayment },
  ];

  return (
    <div className="space-y-6">
      <FinanceKpiGrid metrics={financeKpiGroups.invoices} />
      <AdminTable columns={columns} rows={financeInvoices} getRowKey={(invoice) => invoice.id} />
      <FinancePanel title="Manual Revolut workflow">
        <div className="grid gap-3 md:grid-cols-4">
          {["Create invoice in Revolut Pro", "Register invoice here", "Mark as paid when payment arrives", "Match with CSV transaction at month end"].map((item, index) => (
            <div key={item} className="rounded-xl border border-gray-100 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2E75BD]">Step {index + 1}</span>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </FinancePanel>
    </div>
  );
}

function ExpensesFinanceTab() {
  const columns: Array<AdminTableColumn<FinanceExpense>> = [
    { key: "supplier", header: "Supplier", render: (expense) => <strong className="text-gray-800">{expense.supplier}</strong> },
    { key: "date", header: "Date", render: (expense) => expense.date },
    { key: "amount", header: "Amount", render: (expense) => expense.amount },
    { key: "category", header: "Category", render: (expense) => expense.category },
    { key: "bas", header: "BAS account", render: (expense) => expense.basAccount },
    { key: "vat", header: "VAT", render: (expense) => expense.vat },
    { key: "receipt", header: "Receipt", render: (expense) => expense.receipt },
    { key: "status", header: "Status", render: (expense) => <StatusBadge status={expense.status} /> },
  ];

  return (
    <div className="space-y-6">
      <FinanceKpiGrid metrics={financeKpiGroups.expenses} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {supplierRules.map((rule) => (
          <FinancePanel key={rule.supplier} title={rule.supplier}>
            <FinanceDefinitionList
              rows={[
                { label: "Category", value: rule.category },
                { label: "BAS account", value: rule.account },
                { label: "VAT", value: rule.vat },
              ]}
            />
          </FinancePanel>
        ))}
      </div>
      <AdminTable columns={columns} rows={financeExpenses} getRowKey={(expense) => expense.id} />
    </div>
  );
}

function OwnerExpensesTab({
  ownerExpenses = [],
  backendReceipts = [],
  onBackendRefresh,
}: {
  ownerExpenses: OwnerExpenseDto[];
  backendReceipts: FinanceReceiptDto[];
  onBackendRefresh: () => void;
}) {
  const [accounts, setAccounts] = useState<FinanceAccountCatalogDto[]>([]);
  const [suppliers, setSuppliers] = useState<FinanceSupplierDto[]>([]);
  const [supplierInput, setSupplierInput] = useState("");
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentSourceFilter, setPaymentSourceFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<OwnerExpenseDto | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [ownerExpenseError, setOwnerExpenseError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isReimbursing, setIsReimbursing] = useState(false);
  const [reimbursementAmount, setReimbursementAmount] = useState("");
  const [detailReceiptPicking, setDetailReceiptPicking] = useState(false);
  const [detailReceiptPickId, setDetailReceiptPickId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newDraft, setNewDraft] = useState<{
    description: string;
    gross_amount: string;
    vat_amount: string;
    expense_date: string;
    expense_account: string;
    supplier_id: string;
    supplier_name: string;
    receipt_id: string;
    notes: string;
    vat_treatment: string;
    payment_source: OwnerExpensePaymentSource;
    is_vat_deductible: boolean;
    reverse_charge: boolean;
  }>({
    description: "",
    gross_amount: "",
    vat_amount: "0",
    expense_date: new Date().toISOString().slice(0, 10),
    expense_account: "",
    supplier_id: "",
    supplier_name: "",
    receipt_id: "",
    notes: "",
    vat_treatment: "swedish_standard",
    payment_source: "owner_private",
    is_vat_deductible: true,
    reverse_charge: false,
  });

  // Load accounts catalog and active suppliers once on mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([getFinanceAccountsCatalog(), getFinanceSuppliers()])
      .then(([accountsResult, suppliersResult]) => {
        if (!isMounted) return;
        if (accountsResult.ok && accountsResult.data) setAccounts(accountsResult.data.accounts ?? []);
        if (suppliersResult.ok && suppliersResult.data) {
          setSuppliers((suppliersResult.data.suppliers ?? []).filter((s) => s.is_active));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedExpense(null);
      return;
    }
    let isMounted = true;
    setIsLoadingDetails(true);
    getOwnerExpense(selectedId)
      .then((result) => {
        if (!isMounted) return;
        if (result.ok && result.data) {
          setSelectedExpense(result.data.ownerExpense);
        } else {
          setOwnerExpenseError(result.error ?? "Could not load owner expense details.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  // Return "1234 — Account Name" for display; falls back to the number alone
  function accountLabel(accountNumber: string) {
    if (!accountNumber) return "—";
    const found = accounts.find((a) => a.account === accountNumber);
    return found ? `${found.account} — ${found.name}` : accountNumber;
  }

  // Normalize for duplicate-detection: lowercase, collapse whitespace
  function normalizeForMatch(name: string) {
    return name.toLowerCase().replace(/\s+/g, " ").trim();
  }

  // Combobox: filter suppliers by typed text
  const supplierMatches = supplierInput.trim()
    ? suppliers.filter((s) => s.name.toLowerCase().includes(supplierInput.toLowerCase()))
    : suppliers;

  // Show "Create" option only when typed text has no exact normalized match
  const canCreateSupplier =
    supplierInput.trim().length >= 2 &&
    !suppliers.some((s) => s.normalized_name === normalizeForMatch(supplierInput));

  // When a known supplier is selected from the dropdown
  function handleSupplierSelect(supplierId: string) {
    const supplier = suppliers.find((s) => s.id === supplierId);
    setSupplierInput(supplier?.name ?? "");
    setIsNewSupplier(false);
    setSupplierDropdownOpen(false);
    setNewDraft((prev) => ({
      ...prev,
      supplier_id: supplierId,
      supplier_name: supplier?.name ?? "",
      expense_account: supplier?.default_bas_account ?? prev.expense_account,
      vat_treatment: supplier?.vat_treatment ?? prev.vat_treatment,
      reverse_charge: Boolean(supplier?.reverse_charge),
      is_vat_deductible: !supplier?.reverse_charge,
    }));
  }

  // When user edits the combobox input — clears any existing selection
  function handleSupplierInputChange(value: string) {
    setSupplierInput(value);
    setIsNewSupplier(false);
    setSupplierDropdownOpen(true);
    setNewDraft((prev) => ({ ...prev, supplier_id: "", supplier_name: "" }));
  }

  // When user confirms "Create supplier X" from the dropdown
  function handleConfirmNewSupplier() {
    const name = supplierInput.trim();
    if (!name) return;
    setIsNewSupplier(true);
    setSupplierDropdownOpen(false);
    setNewDraft((prev) => ({ ...prev, supplier_id: "", supplier_name: name }));
  }

  // When a receipt is selected, auto-populate amounts, date, and supplier
  function handleReceiptSelect(receiptId: string) {
    const receipt = backendReceipts.find((r) => r.id === receiptId);
    if (!receipt) {
      setNewDraft((prev) => ({ ...prev, receipt_id: receiptId }));
      return;
    }
    const matchingSupplier = receipt.supplier
      ? suppliers.find((s) => s.name.toLowerCase() === receipt.supplier!.toLowerCase())
      : null;
    if (receipt.supplier) {
      setSupplierInput(receipt.supplier);
      setIsNewSupplier(!matchingSupplier);
    }
    setNewDraft((prev) => ({
      ...prev,
      receipt_id: receiptId,
      supplier_name: receipt.supplier ?? prev.supplier_name,
      supplier_id: matchingSupplier?.id ?? prev.supplier_id,
      gross_amount:
        receipt.total_amount !== null && receipt.total_amount !== undefined
          ? String(Math.abs(toNumber(receipt.total_amount)))
          : prev.gross_amount,
      vat_amount:
        receipt.vat_amount !== null && receipt.vat_amount !== undefined
          ? String(Math.abs(toNumber(receipt.vat_amount)))
          : prev.vat_amount,
      expense_date: receipt.receipt_date?.slice(0, 10) ?? prev.expense_date,
      expense_account: matchingSupplier?.default_bas_account ?? prev.expense_account,
    }));
  }

  async function handleLinkReceiptToDraft() {
    if (!selected || selected.status !== "draft" || !detailReceiptPickId) return;
    const result = await updateOwnerExpense(selected.id, { receipt_id: detailReceiptPickId });
    if (result.ok && result.data) {
      setSelectedExpense(result.data.ownerExpense);
      setDetailReceiptPicking(false);
      setDetailReceiptPickId("");
      onBackendRefresh();
    } else {
      setOwnerExpenseError(result.error ?? "Could not link receipt.");
    }
  }

  const filteredRows = ownerExpenses.filter((expense) => {
    if (statusFilter !== "all" && expense.status !== statusFilter) return false;
    if (paymentSourceFilter !== "all" && expense.payment_source !== paymentSourceFilter) return false;
    return true;
  });
  const selectedFallback = selectedId ? (ownerExpenses.find((e) => e.id === selectedId) ?? null) : null;
  const selected = selectedExpense ?? selectedFallback;
  const openOwnerExpenses = ownerExpenses.filter((e) => e.status !== "reimbursed" && e.status !== "cancelled").length;
  const outstandingTotal = ownerExpenses.reduce((sum, expense) => sum + toNumber(expense.outstanding_amount), 0);
  const reimbursedThisMonth = ownerExpenses.reduce((sum, expense) => {
    const reimbursements = expense.reimbursements ?? [];
    return sum + reimbursements.reduce((inner, reimbursement) => {
      const date = new Date(reimbursement.reimbursed_at);
      const now = new Date();
      const sameMonth = date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
      return sameMonth ? inner + toNumber(reimbursement.amount) : inner;
    }, 0);
  }, 0);
  const receiptLinkedCount = ownerExpenses.filter((expense) => Boolean(expense.receipt_id)).length;

  // Live journal preview calculations (purely client-side, no API needed)
  const draftGross = toNumber(newDraft.gross_amount);
  const draftVat = toNumber(newDraft.vat_amount);
  const draftDeductibleVat = newDraft.is_vat_deductible ? Math.min(draftVat, draftGross) : 0;
  const draftNet = Math.round((draftGross - draftDeductibleVat) * 100) / 100;

  // Form warnings — non-blocking for drafts, enforced before posting
  const draftWarnings: string[] = [];
  if (!newDraft.expense_account) draftWarnings.push("No expense account selected.");
  if (!newDraft.supplier_name) draftWarnings.push("No supplier selected or entered.");
  if (!newDraft.receipt_id) draftWarnings.push("No receipt linked. Receipt is required before posting.");
  if (draftGross > 0 && draftVat > draftGross) draftWarnings.push("VAT amount cannot exceed gross amount.");

  const metrics = [
    { label: "Outstanding reimbursements", value: formatKr(outstandingTotal), detail: "Posted owner expenses not yet reimbursed" },
    { label: "Open owner expenses", value: String(openOwnerExpenses), detail: "Draft, posted or partially reimbursed" },
    { label: "Reimbursed this month", value: formatKr(reimbursedThisMonth), detail: "Sum of reimbursement postings this month" },
    { label: "Items with receipt", value: String(receiptLinkedCount), detail: "Owner expenses linked to receipt records" },
  ];

  // Expense accounts are in the 4–9 range; show only those in the account dropdown
  const expenseAccounts = accounts.filter((a) => /^[456789]/.test(a.account));

  const columns: Array<AdminTableColumn<OwnerExpenseDto>> = [
    { key: "date",        header: "Date",        render: (expense) => expense.expense_date.slice(0, 10) },
    { key: "description", header: "Description", render: (expense) => <strong className="text-gray-800">{expense.description}</strong> },
    { key: "supplier",    header: "Supplier",    render: (expense) => expense.supplier_name ?? "-" },
    { key: "gross",       header: "Amount",      render: (expense) => formatReceiptAmount(expense.gross_amount, expense.currency), align: "right" },
    { key: "account",     header: "Account",     render: (expense) => accountLabel(expense.expense_account) },
    { key: "status",      header: "Status",      render: (expense) => <StatusBadge status={expense.status} /> },
  ];

  async function handleCreateDraft() {
    if (!newDraft.description || !newDraft.gross_amount || !newDraft.expense_account) {
      setOwnerExpenseError("Description, gross amount, and expense account are required.");
      return;
    }
    setOwnerExpenseError(null);

    // If user typed a new supplier name, create/find it before saving the expense
    let finalSupplierId = newDraft.supplier_id;
    let finalSupplierName = newDraft.supplier_name;

    if (isNewSupplier && newDraft.supplier_name) {
      const createResult = await createFinanceSupplier({
        name: newDraft.supplier_name,
        default_bas_account: newDraft.expense_account || null,
      });
      if (createResult.ok && createResult.data) {
        finalSupplierId = createResult.data.supplier.id;
        finalSupplierName = createResult.data.supplier.name;
        setSuppliers((prev) => {
          const exists = prev.some((s) => s.id === finalSupplierId);
          return exists ? prev : [...prev, createResult.data!.supplier];
        });
      } else {
        setOwnerExpenseError(createResult.error ?? "Could not create supplier.");
        return;
      }
    }

    const result = await createOwnerExpense({
      description: newDraft.description,
      gross_amount: newDraft.gross_amount,
      vat_amount: newDraft.vat_amount,
      expense_date: newDraft.expense_date,
      expense_account: newDraft.expense_account,
      supplier_id: finalSupplierId || null,
      supplier_name: finalSupplierName || null,
      receipt_id: newDraft.receipt_id || null,
      notes: newDraft.notes || null,
      vat_treatment: newDraft.vat_treatment || null,
      payment_source: newDraft.payment_source,
      is_vat_deductible: newDraft.is_vat_deductible,
      reverse_charge: newDraft.reverse_charge,
    });

    if (result.ok && result.data) {
      // Persist the chosen account as this supplier's default for next time (existing suppliers only)
      if (finalSupplierId && newDraft.expense_account && !isNewSupplier) {
        const supplier = suppliers.find((s) => s.id === finalSupplierId);
        if (supplier && supplier.default_bas_account !== newDraft.expense_account) {
          await updateFinanceSupplier(finalSupplierId, { default_bas_account: newDraft.expense_account }).catch(() => {});
          setSuppliers((prev) =>
            prev.map((s) => (s.id === finalSupplierId ? { ...s, default_bas_account: newDraft.expense_account } : s)),
          );
        }
      }
      setShowCreate(false);
      setSupplierInput("");
      setIsNewSupplier(false);
      setSelectedId(result.data.ownerExpense.id);
      onBackendRefresh();
      return;
    }
    setOwnerExpenseError(result.error ?? "Could not create owner expense draft.");
  }

  async function handleSaveDraft() {
    if (!selected || selected.status !== "draft" || isSavingDraft) return;
    setIsSavingDraft(true);
    setOwnerExpenseError(null);
    const result = await updateOwnerExpense(selected.id, {
      description: selected.description,
      supplier_name: selected.supplier_name,
      receipt_id: selected.receipt_id,
      gross_amount: selected.gross_amount,
      vat_amount: selected.vat_amount,
      vat_rate: selected.vat_rate,
      vat_treatment: selected.vat_treatment,
      expense_account: selected.expense_account,
      notes: selected.notes,
      is_vat_deductible: selected.is_vat_deductible,
      reverse_charge: selected.reverse_charge,
      payment_source: selected.payment_source,
    });
    if (result.ok && result.data) {
      setSelectedExpense(result.data.ownerExpense);
      onBackendRefresh();
    } else {
      setOwnerExpenseError(result.error ?? "Could not save draft.");
    }
    setIsSavingDraft(false);
  }

  async function handlePostExpense() {
    if (!selected || selected.status !== "draft" || isPosting) return;
    setIsPosting(true);
    setOwnerExpenseError(null);
    const result = await postOwnerExpense(selected.id);
    if (result.ok && result.data) {
      setSelectedExpense(result.data.ownerExpense);
      onBackendRefresh();
    } else {
      setOwnerExpenseError(result.error ?? "Could not post owner expense.");
    }
    setIsPosting(false);
  }

  async function handleReimburse() {
    if (!selected || isReimbursing || !reimbursementAmount) return;
    setIsReimbursing(true);
    setOwnerExpenseError(null);
    const result = await reimburseOwnerExpense(selected.id, { amount: reimbursementAmount });
    if (result.ok && result.data) {
      setSelectedExpense(result.data.ownerExpense);
      setReimbursementAmount("");
      onBackendRefresh();
    } else {
      setOwnerExpenseError(result.error ?? "Could not reimburse owner expense.");
    }
    setIsReimbursing(false);
  }

  return (
    <div className="space-y-6">
      <FinanceKpiGrid metrics={metrics} />
      <FilterBar
        filters={[
          {
            label: "Status",
            value: statusFilter,
            options: [
              { label: "All statuses", value: "all" },
              { label: "Draft", value: "draft" },
              { label: "Posted", value: "posted" },
              { label: "Partially reimbursed", value: "partially_reimbursed" },
              { label: "Reimbursed", value: "reimbursed" },
              { label: "Cancelled", value: "cancelled" },
            ],
            onChange: setStatusFilter,
          },
          {
            label: "Payment source",
            value: paymentSourceFilter,
            options: [
              { label: "All sources", value: "all" },
              { label: "Owner private", value: "owner_private" },
              { label: "Company bank", value: "company_bank" },
            ],
            onChange: setPaymentSourceFilter,
          },
        ]}
      />

      <div className="flex justify-end">
        <button
          className="btn btn-primary inline-flex items-center"
          type="button"
          onClick={() => {
            const next = !showCreate;
            setShowCreate(next);
            if (!next) {
              setSupplierInput("");
              setIsNewSupplier(false);
              setSupplierDropdownOpen(false);
            }
          }}
        >
          <Plus className="mr-2 size-4" aria-hidden="true" />
          + New Owner Expense
        </button>
      </div>

      {showCreate ? (
        <FinancePanel title="New owner expense draft" description="Register a privately paid business expense. Supplier defaults are applied automatically from saved preferences.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Supplier
              <div className="relative">
                <input
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                  placeholder="Search or create supplier…"
                  value={supplierInput}
                  autoComplete="off"
                  onChange={(event) => handleSupplierInputChange(event.target.value)}
                  onFocus={() => setSupplierDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setSupplierDropdownOpen(false), 160)}
                />
                {supplierDropdownOpen ? (
                  <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                    {supplierMatches.length > 0 ? (
                      supplierMatches.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50"
                          onMouseDown={(e) => { e.preventDefault(); handleSupplierSelect(s.id); }}
                        >
                          <span>{s.name}</span>
                          {s.default_bas_account ? (
                            <span className="ml-2 text-xs text-gray-400">{accountLabel(s.default_bas_account)}</span>
                          ) : null}
                        </button>
                      ))
                    ) : supplierInput.trim() ? null : (
                      <p className="px-4 py-3 text-sm text-gray-400">No suppliers yet. Type a name to create one.</p>
                    )}
                    {canCreateSupplier ? (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-left text-sm font-semibold text-[#2E75BD] hover:bg-blue-50"
                        onMouseDown={(e) => { e.preventDefault(); handleConfirmNewSupplier(); }}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                        Create supplier &ldquo;{supplierInput.trim()}&rdquo;
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              {isNewSupplier ? (
                <span className="text-xs text-amber-600">New supplier — will be created when you save the draft.</span>
              ) : newDraft.supplier_id ? (
                <span className="text-xs text-emerald-600">Using existing supplier.</span>
              ) : null}
            </div>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Receipt
              <select
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                value={newDraft.receipt_id}
                onChange={(event) => handleReceiptSelect(event.target.value)}
              >
                <option value="">Select receipt…</option>
                {backendReceipts.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.original_filename ?? r.filename}
                    {r.supplier ? ` — ${r.supplier}` : ""}
                    {r.receipt_date ? ` (${r.receipt_date.slice(0, 10)})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Description
              <input
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                placeholder="What was purchased?"
                value={newDraft.description}
                onChange={(event) => setNewDraft((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Expense date
              <input
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                type="date"
                value={newDraft.expense_date}
                onChange={(event) => setNewDraft((prev) => ({ ...prev, expense_date: event.target.value }))}
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
              Expense account
              <select
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                value={newDraft.expense_account}
                onChange={(event) => setNewDraft((prev) => ({ ...prev, expense_account: event.target.value }))}
              >
                <option value="">Select account…</option>
                {expenseAccounts.map((a) => (
                  <option key={a.account} value={a.account}>{a.account} — {a.name}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                Gross amount (incl. VAT)
                <input
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                  placeholder="48.80"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newDraft.gross_amount}
                  onChange={(event) => setNewDraft((prev) => ({ ...prev, gross_amount: event.target.value }))}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                VAT amount
                <input
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                  placeholder="9.76"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newDraft.vat_amount}
                  onChange={(event) => setNewDraft((prev) => ({ ...prev, vat_amount: event.target.value }))}
                />
              </label>
            </div>

            <div className="flex flex-col justify-end gap-3 text-sm text-gray-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newDraft.is_vat_deductible}
                  onChange={(event) => setNewDraft((prev) => ({ ...prev, is_vat_deductible: event.target.checked }))}
                />
                VAT deductible
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newDraft.reverse_charge}
                  onChange={(event) =>
                    setNewDraft((prev) => ({
                      ...prev,
                      reverse_charge: event.target.checked,
                      is_vat_deductible: !event.target.checked,
                    }))
                  }
                />
                Reverse charge
              </label>
            </div>
          </div>

          <textarea
            className="mt-4 min-h-20 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
            placeholder="Internal notes (optional)"
            value={newDraft.notes}
            onChange={(event) => setNewDraft((prev) => ({ ...prev, notes: event.target.value }))}
          />

          {draftWarnings.length > 0 ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-amber-800">Warnings</h4>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                {draftWarnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </div>
          ) : null}

          {newDraft.expense_account && draftGross > 0 ? (() => {
            const draftLines = draftDeductibleVat > 0
              ? [
                  { account: newDraft.expense_account, description: newDraft.description || "Expense", debit: draftNet, credit: 0 },
                  { account: "2641", description: "Ingående moms", debit: draftDeductibleVat, credit: 0 },
                  { account: "2018", description: "Egen insättning", debit: 0, credit: draftGross },
                ]
              : [
                  { account: newDraft.expense_account, description: newDraft.description || "Expense", debit: draftGross, credit: 0 },
                  { account: "2018", description: "Egen insättning", debit: 0, credit: draftGross },
                ];
            const totalDebit = draftLines.reduce((sum, l) => sum + l.debit, 0);
            const totalCredit = draftLines.reduce((sum, l) => sum + l.credit, 0);
            const balanced = Math.abs(totalDebit - totalCredit) < 0.01;
            return (
              <div className="mt-4 rounded-xl border border-gray-100 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="text-base font-semibold text-gray-900">Recognition Journal</h4>
                  <span className={`text-xs font-medium ${balanced ? "text-emerald-600" : "text-red-500"}`}>
                    {balanced ? "✓ Balanced" : "⚠ Unbalanced"}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
                      <th className="pb-2 text-left">Account</th>
                      <th className="pb-2 text-left">Description</th>
                      <th className="pb-2 text-right">Debit</th>
                      <th className="pb-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {draftLines.map((line, i) => (
                      <tr key={i} className="text-gray-700">
                        <td className="py-2 pr-3 font-mono text-xs">{accountLabel(line.account)}</td>
                        <td className="py-2 pr-3 text-gray-500">{line.description}</td>
                        <td className="py-2 text-right tabular-nums">{line.debit > 0 ? formatKr(line.debit) : ""}</td>
                        <td className="py-2 text-right tabular-nums">{line.credit > 0 ? formatKr(line.credit) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200 text-xs font-semibold text-gray-700">
                      <td className="pt-2" colSpan={2}>Total</td>
                      <td className="pt-2 text-right tabular-nums">{formatKr(totalDebit)}</td>
                      <td className="pt-2 text-right tabular-nums">{formatKr(totalCredit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })() : null}

          <button
            className="btn btn-primary mt-4"
            type="button"
            disabled={!newDraft.description || !newDraft.expense_account || !newDraft.gross_amount}
            onClick={() => void handleCreateDraft()}
          >
            Save Draft
          </button>
        </FinancePanel>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AdminTable
          columns={columns}
          rows={filteredRows}
          getRowKey={(expense) => expense.id}
          emptyMessage="No owner expenses found."
          onRowClick={(expense) => setSelectedId(expense.id)}
          isSelected={(expense) => expense.id === selectedId}
        />
        <FinancePanel title="Owner expense details" description="Receipt, accounting preview, and reimbursement history.">
          {isLoadingDetails ? (
            <p className="text-sm text-gray-500">Loading details...</p>
          ) : selected ? (
            <div className="space-y-6">
              {/* Receipt section */}
              <div className="rounded-xl border border-gray-100 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-800">Receipt</h3>
                {selected.receipt ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-800">
                      {selected.receipt.original_filename ?? selected.receipt.filename ?? "Attached receipt"}
                    </p>
                    {selected.receipt.receipt_date ? (
                      <p className="text-xs text-gray-500">Receipt date: {selected.receipt.receipt_date.slice(0, 10)}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Uploaded {selected.receipt.created_at.slice(0, 10)}</p>
                    )}
                    {selected.status === "draft" && !detailReceiptPicking ? (
                      <div className="pt-2">
                        <button
                          type="button"
                          className="btn btn-primary text-xs"
                          onClick={() => { setDetailReceiptPicking(true); setDetailReceiptPickId(""); }}
                        >
                          Replace Receipt
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">No receipt attached</p>
                    {selected.status === "draft" && !detailReceiptPicking ? (
                      <button
                        type="button"
                        className="btn btn-primary text-xs"
                        onClick={() => { setDetailReceiptPicking(true); setDetailReceiptPickId(""); }}
                      >
                        Attach Receipt
                      </button>
                    ) : null}
                  </div>
                )}
                {detailReceiptPicking && selected.status === "draft" ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <select
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                      value={detailReceiptPickId}
                      onChange={(e) => setDetailReceiptPickId(e.target.value)}
                    >
                      <option value="">Select receipt…</option>
                      {backendReceipts.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.original_filename ?? r.filename}
                          {r.supplier ? ` — ${r.supplier}` : ""}
                          {r.receipt_date ? ` (${r.receipt_date.slice(0, 10)})` : ""}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-primary py-1 text-xs"
                        disabled={!detailReceiptPickId}
                        onClick={() => void handleLinkReceiptToDraft()}
                      >
                        Link
                      </button>
                      <button
                        type="button"
                        className="text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => { setDetailReceiptPicking(false); setDetailReceiptPickId(""); }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Supplier */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Supplier</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {selected.supplier?.name ?? selected.supplier_name ?? "—"}
                </p>
              </div>

              {/* Amounts, account, status */}
              <div className="divide-y divide-gray-100">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-semibold tabular-nums text-gray-800">{formatKr(selected.gross_amount)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">VAT</span>
                  <span className="text-sm font-semibold tabular-nums text-gray-800">{formatKr(selected.vat_amount)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">Outstanding</span>
                  <span className="text-sm font-semibold tabular-nums text-gray-800">{formatKr(selected.outstanding_amount)}</span>
                </div>
                <div className="flex items-baseline justify-between py-2.5">
                  <span className="text-sm text-gray-500">Account</span>
                  <span className="max-w-[60%] text-right text-sm font-semibold text-gray-800">{accountLabel(selected.expense_account)}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-gray-500">Status</span>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {(() => {
                type JournalLine = { key: string; account: string; description: string; debit: number; credit: number };
                let journalLines: JournalLine[];
                if (selected.recognition_lines && selected.recognition_lines.length > 0) {
                  journalLines = selected.recognition_lines.map((line) => ({
                    key: line.id,
                    account: line.account,
                    description: line.description ?? "",
                    debit: toNumber(line.debit),
                    credit: toNumber(line.credit),
                  }));
                } else if (selected.is_vat_deductible && toNumber(selected.vat_amount) > 0) {
                  const ownerAcc = selected.recognition_owner_account ?? "2018";
                  journalLines = [
                    { key: "exp", account: selected.expense_account, description: selected.description, debit: toNumber(selected.net_amount), credit: 0 },
                    { key: "vat", account: "2641", description: "Ingående moms", debit: toNumber(selected.vat_amount), credit: 0 },
                    { key: "own", account: ownerAcc, description: "Egen insättning", debit: 0, credit: toNumber(selected.gross_amount) },
                  ];
                } else {
                  const ownerAcc = selected.recognition_owner_account ?? "2018";
                  journalLines = [
                    { key: "exp", account: selected.expense_account, description: selected.description, debit: toNumber(selected.gross_amount), credit: 0 },
                    { key: "own", account: ownerAcc, description: "Egen insättning", debit: 0, credit: toNumber(selected.gross_amount) },
                  ];
                }
                const totalDebit = journalLines.reduce((sum, l) => sum + l.debit, 0);
                const totalCredit = journalLines.reduce((sum, l) => sum + l.credit, 0);
                const balanced = Math.abs(totalDebit - totalCredit) < 0.01;
                return (
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-900">Recognition Journal</h3>
                      <span className={`text-xs font-medium ${balanced ? "text-emerald-600" : "text-red-500"}`}>
                        {balanced ? "✓ Balanced" : "⚠ Unbalanced"}
                      </span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
                          <th className="pb-2 text-left">Account</th>
                          <th className="pb-2 text-left">Description</th>
                          <th className="pb-2 text-right">Debit</th>
                          <th className="pb-2 text-right">Credit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {journalLines.map((line) => (
                          <tr key={line.key} className="text-gray-700">
                            <td className="py-2 pr-3 font-mono text-xs">{accountLabel(line.account)}</td>
                            <td className="py-2 pr-3 text-gray-500">{line.description}</td>
                            <td className="py-2 text-right tabular-nums">{line.debit > 0 ? formatKr(line.debit) : ""}</td>
                            <td className="py-2 text-right tabular-nums">{line.credit > 0 ? formatKr(line.credit) : ""}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200 text-xs font-semibold text-gray-700">
                          <td className="pt-2" colSpan={2}>Total</td>
                          <td className="pt-2 text-right tabular-nums">{formatKr(totalDebit)}</td>
                          <td className="pt-2 text-right tabular-nums">{formatKr(totalCredit)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                );
              })()}

              <div className="rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-800">History</h3>
                {(selected.reimbursements ?? []).length > 0 ? (
                  <div className="mt-3 divide-y divide-gray-50 text-sm">
                    {(selected.reimbursements ?? []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 py-2">
                        <span className="text-gray-500">{item.reimbursed_at.slice(0, 10)} · journal {item.journal_entry_id.slice(0, 8)}</span>
                        <span className="tabular-nums font-medium text-gray-800">{formatKr(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">No reimbursement transactions yet.</p>
                )}
              </div>

              {selected.status === "draft" ? (
                <div className="space-y-2">
                  {!selected.receipt_id && !selected.receipt ? (
                    <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
                      A receipt must be attached before posting. Saving drafts is still allowed.
                    </p>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button className="btn border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD]" type="button" disabled={isSavingDraft} onClick={() => void handleSaveDraft()}>
                      {isSavingDraft ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={isPosting || (!selected.receipt_id && !selected.receipt)}
                      title={!selected.receipt_id && !selected.receipt ? "Attach a receipt before posting" : undefined}
                      onClick={() => void handlePostExpense()}
                    >
                      {isPosting ? "Posting..." : "Post Expense"}
                    </button>
                  </div>
                </div>
              ) : selected.status === "posted" || selected.status === "partially_reimbursed" ? (
                <div className="space-y-2">
                  <input
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                    placeholder={`Reimbursement amount (max ${formatKr(selected.outstanding_amount)})`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={reimbursementAmount}
                    onChange={(event) => setReimbursementAmount(event.target.value)}
                  />
                  <button className="btn btn-primary w-full" type="button" disabled={isReimbursing || !reimbursementAmount} onClick={() => void handleReimburse()}>
                    {isReimbursing ? "Posting reimbursement…" : "Reimburse"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select an owner expense row to view receipt, amounts, VAT, and history.</p>
          )}
          {ownerExpenseError ? (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{ownerExpenseError}</pre>
          ) : null}
        </FinancePanel>
      </div>
    </div>
  );
}

function ReceiptsTab({
  backendReceipts,
  backendTransactions,
  onBackendRefresh,
}: {
  backendReceipts: FinanceReceiptDto[];
  backendTransactions: FinanceTransaction[];
  onBackendRefresh: () => void;
}) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [supplier, setSupplier] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [vatAmount, setVatAmount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<FinanceReceiptDto | null>(null);

  async function handleReceiptUpload() {
    if (!receiptFile || isUploading) return;

    setIsUploading(true);
    setReceiptError(null);

    const result = await uploadFinanceReceipt(receiptFile, {
      supplier,
      receiptDate,
      totalAmount,
      vatAmount,
      currency: "SEK",
    });

    if (result.ok && result.data) {
      setUploadedReceipt(result.data.receipt);
      setReceiptFile(null);
      onBackendRefresh();
    } else {
      setReceiptError(result.error ?? "Receipt upload failed.");
    }

    setIsUploading(false);
  }

  async function handleMatch(receiptId: string, transactionId: string) {
    const result = await matchFinanceReceipt(receiptId, transactionId);
    if (result.ok && result.data) {
      setUploadedReceipt(result.data.receipt);
      onBackendRefresh();
    } else {
      setReceiptError(result.error ?? "Could not match receipt.");
    }
  }

  async function handleUnmatch(receiptId: string) {
    const result = await unmatchFinanceReceipt(receiptId);
    if (result.ok && result.data) {
      setUploadedReceipt(result.data.receipt);
      onBackendRefresh();
    } else {
      setReceiptError(result.error ?? "Could not unmatch receipt.");
    }
  }

  async function handleRecalculate(receiptId: string) {
    const result = await recalculateReceiptMatches(receiptId);
    if (result.ok && result.data) {
      setUploadedReceipt(result.data.receipt);
      onBackendRefresh();
    } else {
      setReceiptError(result.error ?? "Could not recalculate matches.");
    }
  }

  const rows = backendReceipts.length > 0 ? backendReceipts : [];
  const selectedReceipt = uploadedReceipt ?? rows[0] ?? null;
  const missingReceiptTransactions = backendTransactions.filter((transaction) => transaction.receiptStatus === "missing").slice(0, 6);
  const columns: Array<AdminTableColumn<FinanceReceiptDto>> = [
    { key: "filename", header: "Filename", render: (receipt) => <strong className="text-gray-800">{receipt.original_filename ?? receipt.filename}</strong> },
    { key: "supplier", header: "Supplier", render: (receipt) => receipt.supplier ?? "-" },
    { key: "date", header: "Date", render: (receipt) => receipt.receipt_date?.slice(0, 10) ?? "-" },
    { key: "amount", header: "Amount", render: (receipt) => formatReceiptAmount(receipt.total_amount, receipt.currency ?? "SEK") },
    { key: "vat", header: "VAT", render: (receipt) => formatReceiptAmount(receipt.vat_amount, receipt.currency ?? "SEK") },
    { key: "matched", header: "Best match", render: (receipt) => transactionSummary(receipt.confirmed_transaction ?? receipt.best_transaction) },
    { key: "status", header: "Status", render: (receipt) => <StatusBadge status={receiptMatchStatus(receipt.match_status)} /> },
    {
      key: "actions",
      header: "Actions",
      render: (receipt) => (
        <div className="flex flex-wrap gap-2">
          {receipt.match_status === "matched" ? (
            <button className="text-sm font-semibold text-[#2E75BD]" type="button" onClick={() => void handleUnmatch(receipt.id)}>
              Unmatch
            </button>
          ) : (
            <button className="text-sm font-semibold text-[#2E75BD]" type="button" onClick={() => void handleRecalculate(receipt.id)}>
              Recalculate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FinancePanel title="Receipt upload" description="Upload PDF, JPG or PNG receipt. PDFs use text extraction when possible; images use manual fields and deterministic matching.">
        <div
          className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setReceiptFile(event.dataTransfer.files[0] ?? null);
          }}
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
            <label className="flex min-h-44 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl bg-white p-5 text-center transition hover:border-[#2E75BD]">
              <ReceiptText className="size-10 text-[#2E75BD]" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-gray-800">{receiptFile ? receiptFile.name : "Upload PDF, JPG or PNG receipt"}</h3>
              <p className="mt-2 text-sm text-gray-500">Drop a file here or select one from disk.</p>
              <span className="btn btn-primary mt-5">{receiptFile ? "Change file" : "Select receipt"}</span>
              <input
                className="sr-only"
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <input className="h-11 rounded-lg border border-gray-200 px-4 text-sm" placeholder="Supplier" value={supplier} onChange={(event) => setSupplier(event.target.value)} />
              <input className="h-11 rounded-lg border border-gray-200 px-4 text-sm" type="date" value={receiptDate} onChange={(event) => setReceiptDate(event.target.value)} />
              <input className="h-11 rounded-lg border border-gray-200 px-4 text-sm" placeholder="Total amount" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value)} />
              <input className="h-11 rounded-lg border border-gray-200 px-4 text-sm" placeholder="VAT amount" value={vatAmount} onChange={(event) => setVatAmount(event.target.value)} />
              <button className="btn btn-primary sm:col-span-2" type="button" disabled={!receiptFile || isUploading} onClick={() => void handleReceiptUpload()}>
                {isUploading ? "Uploading..." : "Upload and match"}
              </button>
            </div>
          </div>
        </div>
        {receiptError ? (
          <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">{receiptError}</pre>
        ) : null}
      </FinancePanel>

      <FinanceKpiGrid metrics={financeKpiGroups.receipts} />

      {selectedReceipt ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <FinancePanel title="Extracted fields">
            <FinanceDefinitionList
              rows={[
                { label: "Supplier", value: selectedReceipt.supplier ?? "-" },
                { label: "Receipt date", value: selectedReceipt.receipt_date?.slice(0, 10) ?? "-" },
                { label: "Total amount", value: formatReceiptAmount(selectedReceipt.total_amount, selectedReceipt.currency ?? "SEK") },
                { label: "VAT", value: formatReceiptAmount(selectedReceipt.vat_amount, selectedReceipt.currency ?? "SEK") },
                { label: "Extraction status", value: selectedReceipt.extraction_status },
              ]}
            />
          </FinancePanel>

          <FinancePanel title="Best match suggestion">
            {selectedReceipt.best_transaction ? (
              <div className="rounded-xl border border-gray-100 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{selectedReceipt.best_transaction.description}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedReceipt.best_transaction.booking_date?.slice(0, 10) ?? "-"} - {formatFinanceAmount(toNumber(selectedReceipt.best_transaction.gross_amount), selectedReceipt.best_transaction.currency)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{selectedReceipt.match_reason ?? "Suggested by deterministic matching."}</p>
                  </div>
                  <strong className="text-sm text-gray-800">{selectedReceipt.best_match_score ?? 0} score</strong>
                </div>
                {selectedReceipt.match_status !== "matched" ? (
                  <button className="btn btn-primary mt-4" type="button" onClick={() => void handleMatch(selectedReceipt.id, selectedReceipt.best_transaction_id ?? selectedReceipt.best_transaction!.id)}>
                    Confirm match
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm leading-6 text-gray-500">No best match found yet. Use a candidate or manual fallback below.</p>
            )}
          </FinancePanel>
        </div>
      ) : null}

      {selectedReceipt?.candidates && selectedReceipt.candidates.length > 0 ? (
        <FinancePanel title="Match candidates">
          <div className="grid gap-3 xl:grid-cols-2">
            {selectedReceipt.candidates.map((candidate) => (
              <div key={candidate.transaction.id} className="rounded-xl border border-gray-100 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">{candidate.transaction.description}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {candidate.transaction.booking_date?.slice(0, 10) ?? "-"} - {formatFinanceAmount(toNumber(candidate.transaction.gross_amount), candidate.transaction.currency)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{candidate.reason}</p>
                  </div>
                  <strong className="text-sm text-gray-800">{candidate.score}</strong>
                </div>
                <button className="mt-4 text-sm font-semibold text-[#2E75BD]" type="button" onClick={() => void handleMatch(selectedReceipt.id, candidate.transaction.id)}>
                  Match
                </button>
              </div>
            ))}
          </div>
        </FinancePanel>
      ) : selectedReceipt && missingReceiptTransactions.length > 0 ? (
        <FinancePanel title="Manual fallback">
          <div className="grid gap-3 xl:grid-cols-2">
            {missingReceiptTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-800">{transaction.description}</h3>
                <p className="mt-1 text-sm text-gray-500">{transaction.bookingDate} - {formatFinanceAmount(transaction.grossAmount, transaction.currency)}</p>
                <button className="mt-4 text-sm font-semibold text-[#2E75BD]" type="button" onClick={() => void handleMatch(selectedReceipt.id, transaction.id)}>
                  Match
                </button>
              </div>
            ))}
          </div>
        </FinancePanel>
      ) : null}

      {rows.length > 0 ? (
        <AdminTable columns={columns} rows={rows} getRowKey={(receipt) => receipt.id} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {financeReceipts.map((receipt) => (
              <FinancePanel key={receipt.id} title={receipt.filename}>
                <p className="text-sm text-gray-500">{receipt.supplier} - {receipt.amount}</p>
                <div className="mt-4"><StatusBadge status={receipt.status} /></div>
              </FinancePanel>
            ))}
          </div>
          <p className="text-sm text-gray-500">Backend receipts are unavailable, so static demo receipts remain visible.</p>
        </>
      )}
    </div>
  );
}

function BookkeepingTab() {
  const columns: Array<AdminTableColumn<JournalEntry>> = [
    { key: "verification", header: "Verification no.", render: (entry) => <strong className="text-gray-800">{entry.verificationNo}</strong> },
    { key: "date", header: "Date", render: (entry) => entry.date },
    { key: "description", header: "Description", render: (entry) => entry.description },
    { key: "debit", header: "Debit account", render: (entry) => entry.debitAccount },
    { key: "credit", header: "Credit account", render: (entry) => entry.creditAccount },
    { key: "amount", header: "Amount", render: (entry) => entry.amount },
    { key: "status", header: "Status", render: (entry) => <StatusBadge status={entry.status} /> },
  ];

  return (
    <div className="space-y-6">
      <FinanceKpiGrid metrics={financeKpiGroups.bookkeeping} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <TaskList items={bookkeepingChecklist} />
        <FinancePanel title="BAS account suggestions">
          <div className="space-y-2">
            {basAccountSuggestions.map((account) => (
              <div key={account} className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">{account}</div>
            ))}
          </div>
        </FinancePanel>
      </div>
      <AdminTable columns={columns} rows={journalEntries} getRowKey={(entry) => entry.id} />
    </div>
  );
}

function VatTab() {
  const currentYear = new Date().getFullYear();
  const [frequency, setFrequency] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [year, setYear] = useState(String(currentYear));
  const [periods, setPeriods] = useState<VatPeriodCalculatedDto[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [report, setReport] = useState<VatReportDto | null>(null);
  const [declarationBoxes, setDeclarationBoxes] = useState<VatDeclarationBoxesDto | null>(null);
  const [history, setHistory] = useState<VatPeriodHistoryEventDto[]>([]);
  const [unlockReason, setUnlockReason] = useState("");
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vatError, setVatError] = useState<string | null>(null);

  const yearNumber = Number.parseInt(year, 10);
  const selectedPeriodRow = periods.find((period) => period.period.id === selectedPeriodId) ?? null;
  const selectedPeriod = selectedPeriodRow?.period ?? report?.period ?? null;
  const periodStatus: VatPeriodStatus = selectedPeriod?.status ?? "open";
  const periodMode = report?.calculation_mode ?? selectedPeriodRow?.calculation_mode ?? "live";

  const lifecycleHelper = periodStatus === "submitted"
    ? "Period is submitted. Close it when VAT bookkeeping is complete."
    : periodStatus === "closed"
      ? "This VAT period is closed and read-only."
      : "Close is only available after the period has been submitted.";

  const declarationRows = useMemo(() => {
    if (!declarationBoxes) return [];
    return [
      { box: "05", description: "Taxable sales (placeholder)", value: formatKr(declarationBoxes.box_05) },
      { box: "06", description: "Taxable sales (placeholder)", value: formatKr(declarationBoxes.box_06) },
      { box: "07", description: "Taxable sales (placeholder)", value: formatKr(declarationBoxes.box_07) },
      { box: "08", description: "Taxable sales (placeholder)", value: formatKr(declarationBoxes.box_08) },
      { box: "10", description: "Output VAT 25%", value: formatKr(declarationBoxes.box_10) },
      { box: "11", description: "Output VAT 12%", value: formatKr(declarationBoxes.box_11) },
      { box: "12", description: "Output VAT 6%", value: formatKr(declarationBoxes.box_12) },
      { box: "48", description: "Deductible input VAT", value: formatKr(declarationBoxes.box_48) },
      { box: "49", description: "VAT payable / refundable", value: formatKr(declarationBoxes.box_49) },
    ];
  }, [declarationBoxes]);

  const validation = useMemo(() => {
    const warnings: string[] = [];
    const errors: string[] = [];
    if (!report) return { warnings, errors };

    if (periodMode === "live") warnings.push("Open period values are live-calculated from posted journals and may change until locked.");
    if (report.summary.non_deductible_vat > 0) warnings.push("Non-deductible input VAT is excluded from deductible VAT totals.");
    if (declarationBoxes && declarationBoxes.box_05 === 0 && declarationBoxes.box_06 === 0 && declarationBoxes.box_07 === 0 && declarationBoxes.box_08 === 0 && report.summary.output_vat > 0) {
      warnings.push("Boxes 05-08 are currently placeholders. Review taxable sales mapping before submission.");
    }
    if (report.summary.vat_payable > 0 && report.summary.vat_refundable > 0) {
      errors.push("Invalid VAT state: payable and refundable values are both positive.");
    }
    if (!declarationBoxes) errors.push("Declaration values are missing for this period.");

    return { warnings, errors };
  }, [declarationBoxes, periodMode, report]);

  async function loadPeriodDetails(periodId: string) {
    setIsLoadingDetails(true);
    setVatError(null);

    const [reportResult, declarationResult, historyResult] = await Promise.all([
      getVatPeriodReport(periodId),
      getVatPeriodDeclaration(periodId),
      getVatPeriodHistory(periodId),
    ]);

    if (reportResult.ok && reportResult.data) {
      setReport(reportResult.data.report);
    } else {
      setReport(null);
      setVatError(reportResult.error ?? "Could not load VAT report.");
    }

    if (declarationResult.ok && declarationResult.data) {
      setDeclarationBoxes(declarationResult.data.declaration.boxes);
    } else {
      setDeclarationBoxes(null);
      if (!vatError) setVatError(declarationResult.error ?? "Could not load VAT declaration values.");
    }

    if (historyResult.ok && historyResult.data) {
      setHistory(historyResult.data.history);
    } else {
      setHistory([]);
      if (!vatError) setVatError(historyResult.error ?? "Could not load VAT period history.");
    }

    setIsLoadingDetails(false);
  }

  async function refreshPeriods(autoEnsure = true) {
    if (!Number.isFinite(yearNumber)) {
      setVatError("Year must be a valid number.");
      return;
    }

    setIsLoadingPeriods(true);
    setVatError(null);
    const listResult = await getVatPeriods({
      frequency,
      year: yearNumber,
      limit: 200,
    });

    if (listResult.ok && listResult.data) {
      const rows = listResult.data.periods;
      if (rows.length > 0) {
        setPeriods(rows);
        const preferred = rows.find((row) => row.period.id === selectedPeriodId)?.period.id ?? rows[0]?.period.id ?? null;
        setSelectedPeriodId(preferred);
        if (preferred) {
          await loadPeriodDetails(preferred);
        } else {
          setReport(null);
          setDeclarationBoxes(null);
          setHistory([]);
        }
      } else if (autoEnsure) {
        const ensurePayload = buildVatPeriodInput(frequency, yearNumber);
        const ensureResult = await ensureVatPeriod(ensurePayload);
        if (ensureResult.ok && ensureResult.data) {
          const refreshed = await getVatPeriods({ frequency, year: yearNumber, limit: 200 });
          if (refreshed.ok && refreshed.data && refreshed.data.periods.length > 0) {
            setPeriods(refreshed.data.periods);
            const id = refreshed.data.periods[0]!.period.id;
            setSelectedPeriodId(id);
            await loadPeriodDetails(id);
          } else {
            setPeriods([]);
            setSelectedPeriodId(null);
            setReport(null);
            setDeclarationBoxes(null);
            setHistory([]);
          }
        } else {
          setPeriods([]);
          setSelectedPeriodId(null);
          setReport(null);
          setDeclarationBoxes(null);
          setHistory([]);
          setVatError(ensureResult.error ?? "Could not ensure VAT period.");
        }
      } else {
        setPeriods([]);
        setSelectedPeriodId(null);
        setReport(null);
        setDeclarationBoxes(null);
        setHistory([]);
      }
    } else {
      setVatError(listResult.error ?? "Could not load VAT periods.");
    }

    setIsLoadingPeriods(false);
  }

  useEffect(() => {
    void refreshPeriods(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency, year]);

  async function handleSelectPeriod(periodId: string) {
    setSelectedPeriodId(periodId);
    await loadPeriodDetails(periodId);
  }

  async function handleLifecycleAction(
    action: "calculate" | "lock" | "unlock" | "submit" | "close",
  ) {
    if (!selectedPeriodId || isProcessing) return;

    const actionAllowed = (
      (action === "calculate" || action === "lock") && periodStatus === "open"
    ) || (
      (action === "unlock" || action === "submit") && periodStatus === "locked"
    ) || (
      action === "close" && periodStatus === "submitted"
    );

    if (!actionAllowed) {
      setVatError(
        action === "close"
          ? "Close is only available after the period has been submitted."
          : action === "submit"
            ? "Submit is only available after the period has been locked."
            : action === "unlock" || action === "lock"
              ? "This lifecycle action is not available for the current period status."
              : "This lifecycle action is not available for the current period status.",
      );
      return;
    }

    if (action === "unlock" && !unlockReason.trim()) {
      setVatError("Unlock reason is required.");
      return;
    }

    setIsProcessing(true);
    setVatError(null);

    const result = action === "calculate"
      ? await calculateVatPeriod(selectedPeriodId)
      : action === "lock"
        ? await lockVatPeriod(selectedPeriodId)
        : action === "unlock"
          ? await unlockVatPeriod(selectedPeriodId, unlockReason.trim())
          : action === "submit"
            ? await submitVatPeriod(selectedPeriodId)
            : await closeVatPeriod(selectedPeriodId);

    if (!result.ok) {
      setVatError(result.error ?? "Could not update VAT period lifecycle.");
      setIsProcessing(false);
      return;
    }

    if (action === "unlock") setUnlockReason("");
    await refreshPeriods(false);
    if (selectedPeriodId) await loadPeriodDetails(selectedPeriodId);
    setIsProcessing(false);
  }

  const periodColumns: Array<AdminTableColumn<VatPeriodCalculatedDto>> = [
    { key: "period", header: "Period", render: (row) => <strong className="text-gray-800">{row.period.period_start} - {row.period.period_end}</strong> },
    { key: "frequency", header: "Frequency", render: (row) => toVatFrequencyLabel(row.period.period_type) },
    { key: "mode", header: "Mode", render: (row) => row.calculation_mode === "live" ? "Live" : "Snapshot" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.period.status} /> },
  ];

  const declarationColumns: Array<AdminTableColumn<{ box: string; description: string; value: string }>> = [
    { key: "box", header: "Box", render: (row) => <strong className="text-gray-800">{row.box}</strong> },
    { key: "description", header: "Description", render: (row) => row.description },
    { key: "value", header: "Value", render: (row) => row.value, align: "right" },
  ];

  const accountColumns: Array<AdminTableColumn<VatReportDto["breakdownByAccount"][number]>> = [
    { key: "account", header: "Account", render: (row) => <strong className="text-gray-800">{row.account}</strong> },
    { key: "name", header: "Name", render: (row) => row.account_name ?? "-" },
    { key: "output", header: "Output VAT", render: (row) => formatKr(row.output_vat), align: "right" },
    { key: "input", header: "Input VAT", render: (row) => formatKr(row.input_vat), align: "right" },
    { key: "deductible", header: "Deductible", render: (row) => formatKr(row.deductible_vat), align: "right" },
    { key: "non_deductible", header: "Non-deductible", render: (row) => formatKr(row.non_deductible_vat), align: "right" },
  ];

  const journalColumns: Array<AdminTableColumn<VatReportDto["breakdownByJournal"][number]>> = [
    { key: "verification", header: "Verification", render: (row) => <strong className="text-gray-800">{row.verification_number ?? row.journal_entry_id.slice(0, 8)}</strong> },
    { key: "date", header: "Posting date", render: (row) => row.posting_date ?? "-" },
    { key: "description", header: "Description", render: (row) => row.description ?? "-" },
    { key: "output", header: "Output VAT", render: (row) => formatKr(row.output_vat), align: "right" },
    { key: "input", header: "Input VAT", render: (row) => formatKr(row.input_vat), align: "right" },
  ];

  const historyColumns: Array<AdminTableColumn<VatPeriodHistoryEventDto>> = [
    { key: "at", header: "Date", render: (row) => row.at.slice(0, 10) },
    { key: "action", header: "Action", render: (row) => <StatusBadge status={row.action} /> },
    { key: "from", header: "From", render: (row) => row.from_status ?? "-" },
    { key: "to", header: "To", render: (row) => row.to_status },
    { key: "actor", header: "Actor", render: (row) => row.actor ?? "-" },
    { key: "reason", header: "Reason", render: (row) => row.reason ?? "-" },
  ];

  const kpiMetrics = report
    ? [
        { label: "Output VAT", value: formatKr(report.summary.output_vat), detail: "From posted journals only" },
        { label: "Input VAT", value: formatKr(report.summary.input_vat), detail: "Total input VAT in period" },
        {
          label: report.summary.vat_payable > 0 ? "VAT payable" : "VAT refundable",
          value: formatKr(report.summary.vat_payable > 0 ? report.summary.vat_payable : report.summary.vat_refundable),
          detail: report.summary.vat_payable > 0 ? "Amount due to Skatteverket" : "Refund amount",
        },
        { label: "Calculation mode", value: periodMode === "live" ? "Live" : "Snapshot", detail: periodStatus === "open" ? "Open period" : "Locked lifecycle state" },
      ]
    : [
        { label: "Output VAT", value: "-", detail: "No period selected" },
        { label: "Input VAT", value: "-", detail: "No period selected" },
        { label: "VAT payable / refundable", value: "-", detail: "No period selected" },
        { label: "Calculation mode", value: "-", detail: "No period selected" },
      ];

  const periodFilterOptions = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ];
  const yearFilterOptions = Array.from({ length: 6 }, (_, index) => currentYear - 3 + index)
    .map((value) => ({ label: String(value), value: String(value) }));

  return (
    <div className="space-y-6">
      <FilterBar
        filters={[
          {
            label: "Frequency",
            value: frequency,
            options: periodFilterOptions,
            onChange: (value) => setFrequency(value as "monthly" | "quarterly" | "yearly"),
          },
          {
            label: "Year",
            value: year,
            options: yearFilterOptions,
            onChange: setYear,
          },
        ]}
      />

      {vatError ? (
        <pre className="overflow-auto whitespace-pre-wrap rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{vatError}</pre>
      ) : null}

      <FinancePanel title="VAT periods" description="Select lifecycle period and status for VAT reporting.">
        {isLoadingPeriods ? (
          <p className="text-sm text-gray-500">Loading VAT periods...</p>
        ) : periods.length > 0 ? (
          <>
            <AdminTable
              columns={periodColumns}
              rows={periods}
              getRowKey={(row) => row.period.id}
              isSelected={(row) => row.period.id === selectedPeriodId}
              onRowClick={(row) => void handleSelectPeriod(row.period.id)}
            />
            {selectedPeriod ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <span className="text-sm text-gray-600">Current status:</span>
                <StatusBadge status={selectedPeriod.status} />
                <span className="text-sm text-gray-500">
                  {selectedPeriod.period_start} - {selectedPeriod.period_end}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState title="No VAT periods" description="No periods exist for selected frequency/year. Use Ensure to create one." />
        )}
      </FinancePanel>

      <FinanceKpiGrid metrics={kpiMetrics} />

      {isLoadingDetails ? (
        <FinancePanel title="VAT details"><p className="text-sm text-gray-500">Loading VAT report...</p></FinancePanel>
      ) : !report ? (
        <FinancePanel title="VAT details"><EmptyState title="No VAT data" description="Select a VAT period to load report and declaration values." /></FinancePanel>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <FinancePanel title="Lifecycle actions" description="Run lifecycle actions for the selected VAT period.">
              <div className="flex flex-wrap gap-2">
                {periodStatus === "open" ? (
                  <>
                    <button className="btn btn-secondary" type="button" disabled={isProcessing} onClick={() => void handleLifecycleAction("calculate")}>Calculate</button>
                    <button className="btn btn-primary" type="button" disabled={isProcessing} onClick={() => void handleLifecycleAction("lock")}>Lock period</button>
                  </>
                ) : null}
                {periodStatus === "locked" ? (
                  <button className="btn btn-secondary" type="button" disabled={isProcessing} onClick={() => void handleLifecycleAction("submit")}>Submit</button>
                ) : null}
                {periodStatus === "submitted" ? (
                  <button className="btn btn-secondary" type="button" disabled={isProcessing} onClick={() => void handleLifecycleAction("close")}>Close</button>
                ) : null}
              </div>
              {periodStatus === "locked" ? (
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    className="h-11 rounded-lg border border-gray-200 px-4 text-sm"
                    placeholder="Unlock reason"
                    value={unlockReason}
                    onChange={(event) => setUnlockReason(event.target.value)}
                    disabled={isProcessing}
                  />
                  <button className="btn btn-secondary" type="button" disabled={isProcessing || !unlockReason.trim()} onClick={() => void handleLifecycleAction("unlock")}>
                    Unlock
                  </button>
                </div>
              ) : null}
              <p className="mt-4 text-sm text-gray-500">
                {periodStatus === "open"
                  ? "Open periods are live-calculated. Lock the period before submission."
                  : lifecycleHelper}
              </p>
            </FinancePanel>

            <FinancePanel title="Validation warnings / errors">
              {validation.errors.length === 0 && validation.warnings.length === 0 ? (
                <p className="text-sm text-gray-500">No validation warnings or errors.</p>
              ) : null}
              {validation.warnings.length > 0 ? (
                <div className="rounded-lg bg-amber-50 p-3">
                  <h3 className="text-sm font-semibold text-amber-900">Warnings</h3>
                  <ul className="mt-2 space-y-1 text-sm text-amber-800">
                    {validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              ) : null}
              {validation.errors.length > 0 ? (
                <div className="mt-3 rounded-lg bg-red-50 p-3">
                  <h3 className="text-sm font-semibold text-red-900">Errors</h3>
                  <ul className="mt-2 space-y-1 text-sm text-red-800">
                    {validation.errors.map((error) => <li key={error}>{error}</li>)}
                  </ul>
                </div>
              ) : null}
            </FinancePanel>
          </div>

          <FinancePanel title="VAT declaration boxes" description="Swedish declaration scope: 05-08, 10-12, 48, 49.">
            {declarationRows.length > 0 ? (
              <AdminTable columns={declarationColumns} rows={declarationRows} getRowKey={(row) => row.box} />
            ) : (
              <EmptyState title="No declaration values" description="Declaration values are not available for this period." />
            )}
          </FinancePanel>

          <FinancePanel title="Breakdown by account">
            {report.breakdownByAccount.length > 0 ? (
              <AdminTable columns={accountColumns} rows={report.breakdownByAccount} getRowKey={(row) => row.account} />
            ) : (
              <EmptyState title="No VAT accounts" description="No VAT-related account movement found in this period." />
            )}
          </FinancePanel>

          <FinancePanel title="Journal references">
            {report.breakdownByJournal.length > 0 ? (
              <AdminTable columns={journalColumns} rows={report.breakdownByJournal} getRowKey={(row) => row.journal_entry_id} />
            ) : (
              <EmptyState title="No journal references" description="No VAT journal references were returned for this period." />
            )}
          </FinancePanel>

          <FinancePanel title="History">
            {history.length > 0 ? (
              <AdminTable columns={historyColumns} rows={history} getRowKey={(row) => `${row.at}-${row.action}`} />
            ) : (
              <EmptyState title="No history yet" description="Lifecycle history is empty for this period." />
            )}
          </FinancePanel>
        </>
      )}
    </div>
  );
}

function TaxesTab() {
  const columns: Array<AdminTableColumn<(typeof taxEstimate.monthlyPlan)[number]>> = [
    { key: "month", header: "Month", render: (row) => <strong className="text-gray-800">{row.month}</strong> },
    { key: "amount", header: "Suggested reserve", render: (row) => row.amount },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status === "reserved" ? "Paid" : row.status === "behind" ? "Overdue" : "Scheduled"} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">{taxEstimate.disclaimer}</div>
      <FinanceKpiGrid metrics={taxEstimate.metrics} />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <FinancePanel title="Calculation">
          <FinanceDefinitionList rows={taxEstimate.calculation} />
        </FinancePanel>
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Monthly reserve plan</h2>
          <AdminTable columns={columns} rows={taxEstimate.monthlyPlan} getRowKey={(row) => row.month} />
        </div>
      </div>
    </div>
  );
}

function AssetsTab() {
  const columns: Array<AdminTableColumn<FinanceAsset>> = [
    { key: "asset", header: "Asset", render: (asset) => <strong className="text-gray-800">{asset.asset}</strong> },
    { key: "purchaseDate", header: "Purchase date", render: (asset) => asset.purchaseDate },
    { key: "purchaseAmount", header: "Purchase amount", render: (asset) => asset.purchaseAmount },
    { key: "category", header: "Category", render: (asset) => asset.category },
    { key: "period", header: "Depreciation period", render: (asset) => asset.depreciationPeriod },
    { key: "depreciation", header: "This year depreciation", render: (asset) => asset.thisYearDepreciation },
    { key: "bookValue", header: "Book value", render: (asset) => asset.bookValue },
    { key: "status", header: "Status", render: (asset) => <StatusBadge status={asset.status} /> },
  ];

  return (
    <div className="space-y-6">
      <FinanceKpiGrid metrics={financeKpiGroups.assets} />
      <AdminTable columns={columns} rows={financeAssets} getRowKey={(asset) => asset.id} />
      <FinancePanel title="Add asset" description="Depreciation is demo only in this frontend version.">
        <button className="btn btn-primary" type="button">
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add asset
        </button>
      </FinancePanel>
    </div>
  );
}

function ReportsTab() {
  const currentYear = new Date().getFullYear();
  const [from, setFrom] = useState(`${currentYear}-01-01`);
  const [to, setTo] = useState(`${currentYear}-12-31`);
  const [includeOpeningBalances, setIncludeOpeningBalances] = useState(true);
  const [includeClosingBalances, setIncludeClosingBalances] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportResult, setExportResult] = useState<SieExportMetadata | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleSieExport() {
    if (isGenerating) return;

    setIsGenerating(true);
    setExportError(null);

    const result = await generateSieExport({
      from,
      to,
      includeOpeningBalances,
      includeClosingBalances,
    });

    if (result.ok && result.data) {
      const url = URL.createObjectURL(result.data.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.data.metadata.filename;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setExportResult(result.data.metadata);
    } else {
      setExportResult(result.data?.metadata ?? null);
      setExportError(result.error ?? "Could not generate SIE export.");
    }

    setIsGenerating(false);
  }

  const validation = exportResult?.validation;
  const validationRows = [
    { label: "Trial Balance Balanced", passed: validation?.checks.trialBalanceBalanced ?? false },
    { label: "Journal Entries Posted", passed: validation?.checks.journalEntriesPosted ?? false },
    { label: "Accounts Valid", passed: validation?.checks.accountsValid ?? false },
    { label: "Verifications Balanced", passed: validation?.checks.verificationsBalanced ?? false },
  ];

  return (
    <div className="space-y-6">
      <FinancePanel title="Current period status">
        <FinanceDefinitionList
          rows={[
            { label: "Current period", value: reportStatus.currentPeriod },
            { label: "Reports ready", value: reportStatus.reportsReady },
            { label: "Missing data", value: reportStatus.missingData },
          ]}
        />
      </FinancePanel>
      <FinancePanel title="Exports" description="Generate a backend-built Swedish SIE4 file from posted journal entries.">
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-800">SIE Export</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">Exports posted verifications from the general ledger. Draft entries are not included.</p>
              </div>
              <FileCheck2 className="size-6 shrink-0 text-[#2E75BD]" aria-hidden="true" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-2 block">From</span>
                <input
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-2 block">To</span>
                <input
                  className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none transition focus:border-[#2E75BD] focus:ring-2 focus:ring-[#2E75BD]/15"
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
                <span>Include Opening Balances</span>
                <input
                  className="size-4 accent-[#2E75BD]"
                  type="checkbox"
                  checked={includeOpeningBalances}
                  onChange={(event) => setIncludeOpeningBalances(event.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
                <span>Include Closing Balances</span>
                <input
                  className="size-4 accent-[#2E75BD]"
                  type="checkbox"
                  checked={includeClosingBalances}
                  onChange={(event) => setIncludeClosingBalances(event.target.checked)}
                />
              </label>
            </div>

            <button
              className="btn btn-primary mt-5 inline-flex items-center"
              type="button"
              disabled={isGenerating || !isFinanceApiConfigured}
              onClick={() => void handleSieExport()}
            >
              <Download className="mr-2 size-4" aria-hidden="true" />
              {isGenerating ? "Generating..." : "Generate SIE4"}
            </button>
            {!isFinanceApiConfigured ? <p className="mt-3 text-sm text-amber-700">Set VITE_KWSTUDIO_API_URL to enable backend exports.</p> : null}
            {exportError ? <pre className="mt-4 overflow-auto rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-800">{exportError}</pre> : null}
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="text-base font-semibold text-gray-800">Validation</h3>
            <div className="mt-4 grid gap-3">
              {validationRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                  <span className="text-sm text-gray-600">{row.label}</span>
                  {row.passed ? (
                    <CheckCircle2 className="size-5 text-emerald-600" aria-label="Passed" />
                  ) : (
                    <AlertCircle className="size-5 text-gray-300" aria-label="Not checked" />
                  )}
                </div>
              ))}
            </div>

            {exportResult ? (
              <div className="mt-5">
                <FinanceDefinitionList
                  rows={[
                    { label: "Filename", value: exportResult.filename },
                    { label: "Created", value: formatShortDate(exportResult.created) },
                    { label: "Verifications", value: String(exportResult.verifications) },
                    { label: "Accounts", value: String(exportResult.accounts) },
                    { label: "Warnings", value: String(exportResult.validation.warnings.length) },
                  ]}
                />
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-gray-500">Generate an export to see file metadata and validation results.</p>
            )}

            {validation?.warnings.length ? (
              <div className="mt-4 rounded-lg bg-amber-50 p-3">
                <h4 className="text-sm font-semibold text-amber-900">Warnings</h4>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-800">
                  {validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                </ul>
              </div>
            ) : null}

            {validation?.errors.length ? (
              <div className="mt-4 rounded-lg bg-red-50 p-3">
                <h4 className="text-sm font-semibold text-red-900">Errors</h4>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-red-800">
                  {validation.errors.map((error) => <li key={error}>{error}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </FinancePanel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {financeReports.map((report: FinanceReport) => {
          const Icon = report.icon;

          return (
            <FinancePanel key={report.id} title={report.title}>
              <Icon className="size-6 text-[#2E75BD]" aria-hidden="true" />
              <p className="mt-3 text-sm leading-6 text-gray-500">{report.description}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <StatusBadge status={report.status} />
                <button className="text-sm font-semibold text-[#2E75BD]" type="button">{report.action}</button>
              </div>
            </FinancePanel>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab() {
  const sections = [
    { title: "Business profile", rows: financeSettings.businessProfile },
    { title: "Import settings", rows: financeSettings.importSettings },
    { title: "VAT settings", rows: financeSettings.vatSettings },
    { title: "Tax reserve settings", rows: financeSettings.taxReserveSettings },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {sections.map((section) => (
          <FinancePanel key={section.title} title={section.title}>
            <FinanceDefinitionList rows={section.rows} />
          </FinancePanel>
        ))}
      </div>
      <FinancePanel title="Category rules">
        <div className="grid gap-3 md:grid-cols-3">
          {categoryRules.map((rule) => (
            <div key={rule.supplier} className="rounded-xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-800">{rule.supplier}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{rule.category} - {rule.basAccount} - {rule.vat}</p>
            </div>
          ))}
        </div>
      </FinancePanel>
    </div>
  );
}

function renderFinanceTab(
  activeTab: FinanceTabId,
  context: {
    backendImports: FinanceImportBatchDto[];
    backendTransactions: FinanceTransaction[];
    backendReceipts: FinanceReceiptDto[];
    backendOwnerExpenses: OwnerExpenseDto[];
    onBackendRefresh: () => void;
    onOpenTab: (tabId: FinanceTabId) => void;
    importResultState: FinanceImportResultDto | null;
    importError: string | null;
    isImporting: boolean;
    onImportFile: (file: File | null | undefined) => void;
    onOpenFilePicker: () => void;
  },
) {
  if (activeTab === "import") {
    return (
      <ImportTab
        backendImports={context.backendImports}
        importResultState={context.importResultState}
        importError={context.importError}
        isImporting={context.isImporting}
        onImportFile={context.onImportFile}
        onOpenFilePicker={context.onOpenFilePicker}
      />
    );
  }
  if (activeTab === "transactions") {
    return <TransactionsTab backendTransactions={context.backendTransactions} onOpenReceipts={() => context.onOpenTab("receipts")} />;
  }
  if (activeTab === "invoices") return <InvoicesFinanceTab />;
  if (activeTab === "expenses") return <ExpensesFinanceTab />;
  if (activeTab === "owner-expenses") {
    return (
      <OwnerExpensesTab
        ownerExpenses={context.backendOwnerExpenses}
        backendReceipts={context.backendReceipts}
        onBackendRefresh={context.onBackendRefresh}
      />
    );
  }
  if (activeTab === "receipts") {
    return (
      <ReceiptsTab
        backendReceipts={context.backendReceipts}
        backendTransactions={context.backendTransactions}
        onBackendRefresh={context.onBackendRefresh}
      />
    );
  }
  if (activeTab === "bookkeeping") return <BookkeepingTab />;
  if (activeTab === "vat") return <VatTab />;
  if (activeTab === "taxes") return <TaxesTab />;
  if (activeTab === "assets") return <AssetsTab />;
  if (activeTab === "reports") return <ReportsTab />;
  if (activeTab === "settings") return <SettingsTab />;
  return <OverviewTab backendImports={context.backendImports} backendTransactions={context.backendTransactions} />;
}

export function FinancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const [backendImports, setBackendImports] = useState<FinanceImportBatchDto[]>([]);
  const [backendTransactions, setBackendTransactions] = useState<FinanceTransaction[]>([]);
  const [backendReceipts, setBackendReceipts] = useState<FinanceReceiptDto[]>([]);
  const [backendOwnerExpenses, setBackendOwnerExpenses] = useState<OwnerExpenseDto[]>([]);
  const [backendRefreshKey, setBackendRefreshKey] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResultState, setImportResultState] = useState<FinanceImportResultDto | null>(null);
  const tabParam = searchParams.get("tab");
  const activeTab = financeTabs.some((tab) => tab.id === tabParam) ? (tabParam as FinanceTabId) : "overview";
  const openFinanceTab = (tabId: FinanceTabId) => setSearchParams(tabId === "overview" ? {} : { tab: tabId });
  const openCsvFilePicker = () => {
    openFinanceTab("import");
    window.setTimeout(() => csvInputRef.current?.click(), 0);
  };

  async function handleCsvImport(file: File | null | undefined) {
    if (!file || isImporting) return;

    openFinanceTab("import");
    setIsImporting(true);
    setImportError(null);

    const result = await importRevolutCsv(file);

    if (result.ok && result.data) {
      setImportResultState(result.data);
      setBackendRefreshKey((value) => value + 1);
    } else {
      setImportError(result.error ?? "CSV import failed.");
    }

    setIsImporting(false);

    if (csvInputRef.current) {
      csvInputRef.current.value = "";
    }
  }

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getFinanceImports(),
      getFinanceTransactions({ limit: 200 }),
      getFinanceReceipts({ limit: 100, includeCandidates: true }),
      getOwnerExpenses({ limit: 200 }),
    ])
      .then(([importsResult, transactionsResult, receiptsResult, ownerExpensesResult]) => {
        if (!isMounted) return;

        if (importsResult.ok && importsResult.data) {
          setBackendImports(importsResult.data.imports);
        }

        if (transactionsResult.ok && transactionsResult.data) {
          setBackendTransactions(transactionsResult.data.transactions.map(mapBackendTransaction));
        }

        if (receiptsResult.ok && receiptsResult.data) {
          setBackendReceipts(receiptsResult.data.receipts);
        }

        if (ownerExpensesResult.ok && ownerExpensesResult.data) {
          setBackendOwnerExpenses(ownerExpensesResult.data.ownerExpenses ?? []);
        }
      })
      .catch((error) => {
        console.warn("Could not load backend finance data. Demo fallback remains active.", error);
      });

    return () => {
      isMounted = false;
    };
  }, [backendRefreshKey]);

  return (
    <AdminShell
      eyebrow="KWSTUDIO FINANCE"
      title="Finance"
      description="CSV imports, invoices, expenses, VAT and bookkeeping support for KWStudio."
      action={<FinanceQuickActionButtons onImportCsv={openCsvFilePicker} onOpenTab={openFinanceTab} />}
    >
      <input
        ref={csvInputRef}
        className="sr-only"
        type="file"
        accept=".csv,text/csv"
        disabled={isImporting}
        onChange={(event) => void handleCsvImport(event.target.files?.[0])}
      />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-sm leading-6 text-gray-500 md:p-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <p className="xl:col-span-2">{emptyStateCopy.demoOnly}</p>
          <p>{emptyStateCopy.csv}</p>
          <p>{emptyStateCopy.tax}</p>
        </div>
      </div>

      <FinanceTabs
        tabs={financeTabs}
        activeTab={activeTab}
        onChange={(tabId) => setSearchParams(tabId === "overview" ? {} : { tab: tabId })}
      />

      {renderFinanceTab(activeTab, {
        backendImports,
        backendTransactions,
        backendReceipts,
        backendOwnerExpenses,
        onBackendRefresh: () => setBackendRefreshKey((value) => value + 1),
        onOpenTab: openFinanceTab,
        importResultState,
        importError,
        isImporting,
        onImportFile: (file) => void handleCsvImport(file),
        onOpenFilePicker: openCsvFilePicker,
      })}
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
