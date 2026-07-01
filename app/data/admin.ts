import {
  Banknote,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  FileSearch,
  FileText,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminStatus =
  | "New"
  | "Qualified"
  | "In review"
  | "Active"
  | "Scheduled"
  | "Pending"
  | "Paid"
  | "Overdue"
  | "Draft"
  | "Live"
  | "Won"
  | "Done"
  | "Blocked";

export type AdminStat = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
};

export type AdminLead = {
  id: string;
  name: string;
  company: string;
  email: string;
  service: string;
  source: string;
  status: AdminStatus;
  date: string;
};

export type PipelineDeal = {
  id: string;
  title: string;
  company: string;
  value: string;
  service: string;
  stage: "New" | "Qualified" | "Proposal" | "Won";
  nextAction: string;
};

export type Proposal = {
  id: string;
  title: string;
  client: string;
  value: string;
  status: AdminStatus;
  expiry: string;
};

export type FollowUp = {
  id: string;
  title: string;
  person: string;
  company: string;
  channel: string;
  due: string;
  status: AdminStatus;
};

export type AdminProject = {
  id: string;
  name: string;
  client: string;
  status: AdminStatus;
  deadline: string;
  scope: string;
  progress: number;
};

export type AdminTask = {
  id: string;
  title: string;
  project: string;
  owner: string;
  status: "To do" | "In progress" | "Review" | "Done";
  due: string;
  priority: "Low" | "Medium" | "High";
};

export type Client = {
  id: string;
  name: string;
  contact: string;
  email: string;
  status: AdminStatus;
  project: string;
  lastContact: string;
};

export type AdminFile = {
  id: string;
  name: string;
  client: string;
  type: string;
  size: string;
  updated: string;
};

export type WebsiteReport = {
  id: string;
  name: string;
  client: string;
  score: number;
  status: AdminStatus;
  date: string;
};

export type WebsiteAnalysis = {
  id: string;
  url: string;
  score: number;
  findings: number;
  status: AdminStatus;
};

export type SeoItem = {
  id: string;
  page: string;
  keyword: string;
  priority: "Low" | "Medium" | "High";
  status: AdminStatus;
};

export type UptimeMonitor = {
  id: string;
  site: string;
  status: AdminStatus;
  uptime: string;
  response: string;
  incident: string;
};

export type Invoice = {
  id: string;
  client: string;
  amount: string;
  due: string;
  status: AdminStatus;
};

export type Payment = {
  id: string;
  client: string;
  amount: string;
  method: string;
  date: string;
  status: AdminStatus;
};

export type Expense = {
  id: string;
  vendor: string;
  category: string;
  amount: string;
  date: string;
  status: AdminStatus;
};

export type SimpleActivity = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  status?: AdminStatus;
};

export type AiTool = {
  title: string;
  description: string;
  href: string;
  status: AdminStatus;
};

export type Prospect = {
  id: string;
  company: string;
  website: string;
  industry: string;
  fit: string;
  status: AdminStatus;
};

export type CalendarEvent = {
  id: string;
  title: string;
  client: string;
  date: string;
  type: string;
  status: AdminStatus;
};

export type EmailMessage = {
  id: string;
  sender: string;
  company: string;
  subject: string;
  snippet: string;
  date: string;
  status: AdminStatus;
};

export type AdminMetric = {
  label: string;
  value: string;
  detail: string;
  href?: string;
  icon?: LucideIcon;
};

export type AdminTimelineItem = {
  id: string;
  title: string;
  meta: string;
  detail: string;
  status?: AdminStatus;
};

export type WebsiteScore = {
  label: string;
  score: number;
  detail: string;
};

export type FeaturedClient = {
  id: string;
  name: string;
  contact: string;
  activeProject: string;
  latestInvoice: string;
  lastContact: string;
  notes: number;
  lifetimeValue: string;
  health: string;
};

export type AiPrompt = {
  id: string;
  title: string;
  prompt: string;
};

export type LeadStage = "New" | "Researching" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";

export type LeadPriority = "High" | "Medium" | "Low";

export type LeadSource =
  | "Website form"
  | "SCB company search"
  | "Manual prospect"
  | "Referral"
  | "LinkedIn"
  | "Audit tool";

export type LeadServiceInterest = "New website" | "Redesign" | "SEO / audit" | "Care plan" | "Ecommerce";

export type StudioLead = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  source: LeadSource;
  service: LeadServiceInterest;
  value: string;
  stage: LeadStage;
  priority: LeadPriority;
  nextAction: string;
  lastActivity: string;
  assignedTo: string;
  date: string;
  note: string;
};

export type LeadSourceStat = {
  source: LeadSource;
  count: number;
  detail: string;
};

export type ScbLeadFinderOption = {
  id: string;
  label: string;
  value: string;
};

export type ScbImportStatus = {
  label: string;
  value: string;
  detail: string;
};

export type LeadInsight = {
  id: string;
  title: string;
  detail: string;
  meta: string;
};

export const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Clients", href: "/admin/clients", icon: BriefcaseBusiness },
  { label: "Websites", href: "/admin/websites", icon: Globe2 },
  { label: "Finance", href: "/admin/finance", icon: Banknote },
  { label: "AI Hub", href: "/admin/ai-tools", icon: Bot },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const adminStats: AdminStat[] = [
  { label: "Leads total", value: "48", change: "+12% this month", trend: "up", icon: Users },
  { label: "Active projects", value: "7", change: "3 launches scheduled", trend: "up", icon: FolderKanban },
  { label: "Website reports", value: "16", change: "5 ready to send", trend: "neutral", icon: FileSearch },
  { label: "Pending invoices", value: "4", change: "42,000 SEK open", trend: "down", icon: ReceiptText },
];

export const adminLeads: AdminLead[] = [
  { id: "lead-001", name: "Maja Lind", company: "Lind Studio", email: "maja@lindstudio.se", service: "Website redesign", source: "Referral", status: "New", date: "2026-06-28" },
  { id: "lead-002", name: "Oskar Berg", company: "Northline Consulting", email: "oskar@northline.co", service: "Conversion strategy", source: "Website", status: "Qualified", date: "2026-06-26" },
  { id: "lead-003", name: "Sara Holm", company: "Maison Retail", email: "sara@maisonretail.com", service: "Ecommerce concept", source: "LinkedIn", status: "In review", date: "2026-06-24" },
  { id: "lead-004", name: "Daniel Noor", company: "Noor Finance", email: "daniel@noorfinance.se", service: "Brand identity", source: "Website", status: "Scheduled", date: "2026-06-22" },
  { id: "lead-005", name: "Elin Rask", company: "Rask Studio", email: "elin@raskstudio.se", service: "Care plan", source: "Audit", status: "Qualified", date: "2026-06-20" },
];

export const pipelineDeals: PipelineDeal[] = [
  { id: "deal-001", title: "Redesign sprint", company: "Lind Studio", value: "42,000 SEK", service: "Website redesign", stage: "New", nextAction: "Book discovery" },
  { id: "deal-002", title: "Conversion review", company: "Northline", value: "18,000 SEK", service: "Strategy", stage: "Qualified", nextAction: "Send recap" },
  { id: "deal-003", title: "Commerce build", company: "Maison Retail", value: "96,000 SEK", service: "Ecommerce", stage: "Proposal", nextAction: "Proposal follow-up" },
  { id: "deal-004", title: "Care plan", company: "Palo House", value: "8,000 SEK/mo", service: "Support", stage: "Won", nextAction: "Prepare onboarding" },
];

export const proposals: Proposal[] = [
  { id: "prop-001", title: "Lind Studio redesign", client: "Lind Studio", value: "42,000 SEK", status: "Draft", expiry: "2026-07-05" },
  { id: "prop-002", title: "Maison Retail commerce", client: "Maison Retail", value: "96,000 SEK", status: "Pending", expiry: "2026-07-12" },
  { id: "prop-003", title: "Northline optimization", client: "Northline", value: "18,000 SEK", status: "Won", expiry: "2026-07-01" },
];

export const followUps: FollowUp[] = [
  { id: "follow-001", title: "Send pricing note", person: "Oskar Berg", company: "Northline", channel: "Email", due: "Today", status: "Pending" },
  { id: "follow-002", title: "Discovery call reminder", person: "Maja Lind", company: "Lind Studio", channel: "Call", due: "Tomorrow", status: "Scheduled" },
  { id: "follow-003", title: "Post-launch check-in", person: "Palo Team", company: "Palo House", channel: "Email", due: "Friday", status: "Active" },
];

export const adminProjects: AdminProject[] = [
  { id: "project-001", name: "Palo House Refresh", client: "Palo House", status: "Active", deadline: "2026-07-12", scope: "Web design / Development", progress: 72 },
  { id: "project-002", name: "Northbound Strategy Site", client: "Northbound", status: "In review", deadline: "2026-07-22", scope: "Strategy / CMS", progress: 54 },
  { id: "project-003", name: "Maison Vala Commerce", client: "Maison Vala", status: "Draft", deadline: "2026-08-04", scope: "Ecommerce / Brand direction", progress: 26 },
];

export const adminTasks: AdminTask[] = [
  { id: "task-001", title: "Homepage responsive QA", project: "Palo House Refresh", owner: "Kevin", status: "To do", due: "Jun 30", priority: "High" },
  { id: "task-002", title: "Service page copy review", project: "Northbound", owner: "Kevin", status: "In progress", due: "Jul 02", priority: "Medium" },
  { id: "task-003", title: "Commerce product structure", project: "Maison Vala", owner: "Kevin", status: "Review", due: "Jul 05", priority: "High" },
  { id: "task-004", title: "Analytics event plan", project: "Palo House Refresh", owner: "Kevin", status: "Done", due: "Jun 26", priority: "Low" },
];

export const clients: Client[] = [
  { id: "client-001", name: "Palo House", contact: "Ida Palo", email: "ida@palohouse.se", status: "Active", project: "Palo House Refresh", lastContact: "2026-06-27" },
  { id: "client-002", name: "Northbound", contact: "Oskar Berg", email: "oskar@northbound.co", status: "In review", project: "Strategy Site", lastContact: "2026-06-25" },
  { id: "client-003", name: "Maison Vala", contact: "Sara Holm", email: "sara@maisonvala.com", status: "Draft", project: "Commerce Concept", lastContact: "2026-06-21" },
];

export const files: AdminFile[] = [
  { id: "file-001", name: "Palo brand pack.zip", client: "Palo House", type: "Brand", size: "24 MB", updated: "2026-06-24" },
  { id: "file-002", name: "Northbound sitemap.pdf", client: "Northbound", type: "Planning", size: "1.8 MB", updated: "2026-06-22" },
  { id: "file-003", name: "Maison product exports.csv", client: "Maison Vala", type: "Content", size: "620 KB", updated: "2026-06-20" },
];

export const websiteReports: WebsiteReport[] = [
  { id: "report-001", name: "June site health", client: "Palo House", score: 94, status: "Live", date: "2026-06-28" },
  { id: "report-002", name: "Launch QA checklist", client: "Northbound", score: 88, status: "In review", date: "2026-06-25" },
  { id: "report-003", name: "Conversion review", client: "Maison Vala", score: 81, status: "Draft", date: "2026-06-23" },
];

export const analyses: WebsiteAnalysis[] = [
  { id: "analysis-001", url: "https://palohouse.se", score: 94, findings: 6, status: "Live" },
  { id: "analysis-002", url: "https://northbound.co", score: 88, findings: 9, status: "In review" },
  { id: "analysis-003", url: "https://maisonvala.com", score: 81, findings: 12, status: "Draft" },
];

export const seoItems: SeoItem[] = [
  { id: "seo-001", page: "Homepage", keyword: "premium web design stockholm", priority: "High", status: "Active" },
  { id: "seo-002", page: "Services", keyword: "website redesign for small business", priority: "Medium", status: "In review" },
  { id: "seo-003", page: "Work", keyword: "web design case studies", priority: "Low", status: "Scheduled" },
];

export const uptimeMonitors: UptimeMonitor[] = [
  { id: "uptime-001", site: "Palo House", status: "Live", uptime: "99.99%", response: "148 ms", incident: "None" },
  { id: "uptime-002", site: "Northbound", status: "Live", uptime: "99.95%", response: "180 ms", incident: "Jun 12" },
  { id: "uptime-003", site: "Maison Vala", status: "Scheduled", uptime: "Pending", response: "-", incident: "Setup queued" },
];

export const invoices: Invoice[] = [
  { id: "INV-1024", client: "Palo House", amount: "18,000 SEK", due: "2026-07-02", status: "Pending" },
  { id: "INV-1025", client: "Northbound", amount: "24,000 SEK", due: "2026-06-21", status: "Paid" },
  { id: "INV-1026", client: "Maison Vala", amount: "32,000 SEK", due: "2026-06-15", status: "Overdue" },
];

export const payments: Payment[] = [
  { id: "pay-001", client: "Northbound", amount: "24,000 SEK", method: "Bank transfer", date: "2026-06-21", status: "Paid" },
  { id: "pay-002", client: "Palo House", amount: "8,000 SEK", method: "Invoice", date: "2026-06-18", status: "Paid" },
  { id: "pay-003", client: "Maison Vala", amount: "16,000 SEK", method: "Invoice", date: "Pending", status: "Pending" },
];

export const expenses: Expense[] = [
  { id: "exp-001", vendor: "Cloudflare", category: "Hosting", amount: "320 SEK", date: "2026-06-20", status: "Paid" },
  { id: "exp-002", vendor: "Figma", category: "Design tools", amount: "180 SEK", date: "2026-06-18", status: "Paid" },
  { id: "exp-003", vendor: "OpenAI", category: "AI tools", amount: "450 SEK", date: "2026-06-17", status: "Pending" },
];

export const bookkeepingTasks: SimpleActivity[] = [
  { id: "book-001", title: "Export June invoices", detail: "Prepare invoice PDFs for accounting.", meta: "Due Jul 02", status: "Pending" },
  { id: "book-002", title: "Categorize tool expenses", detail: "Review software subscriptions.", meta: "Due Jul 04", status: "Active" },
  { id: "book-003", title: "Reconcile payments", detail: "Match received payments to invoices.", meta: "Done Jun 25", status: "Done" },
];

export const aiTools: AiTool[] = [
  { title: "Proposal Generator", description: "Turn enquiry notes into a proposal outline.", href: "/admin/proposal-generator", status: "Live" },
  { title: "Copywriter", description: "Draft headlines, sections and CTA variants.", href: "/admin/copywriter", status: "Live" },
  { title: "Lead Finder", description: "Organize prospects and outreach angles.", href: "/admin/lead-finder", status: "Draft" },
  { title: "SEO Writer", description: "Plan search-focused copy and on-page improvements.", href: "/admin/seo", status: "Draft" },
  { title: "Email Writer", description: "Draft concise outreach and client follow-up messages.", href: "/admin/email", status: "Draft" },
  { title: "Website Analyzer", description: "Review audit findings and improvement opportunities.", href: "/admin/analyzer", status: "Live" },
];

export const prospects: Prospect[] = [
  { id: "prospect-001", company: "Nordic Clinics", website: "nordicclinics.se", industry: "Healthcare", fit: "92%", status: "Qualified" },
  { id: "prospect-002", company: "Urban Legal", website: "urbanlegal.se", industry: "Legal", fit: "84%", status: "New" },
  { id: "prospect-003", company: "Hemma Studio", website: "hemmastudio.se", industry: "Interior", fit: "79%", status: "In review" },
];

export const calendarEvents: CalendarEvent[] = [
  { id: "event-001", title: "Discovery call", client: "Lind Studio", date: "2026-06-30 10:00", type: "Sales", status: "Scheduled" },
  { id: "event-002", title: "Design review", client: "Northbound", date: "2026-07-01 14:30", type: "Project", status: "Active" },
  { id: "event-003", title: "Launch window", client: "Palo House", date: "2026-07-12 09:00", type: "Launch", status: "Scheduled" },
];

export const emailMessages: EmailMessage[] = [
  { id: "mail-001", sender: "Maja Lind", company: "Lind Studio", subject: "Website redesign enquiry", snippet: "We are looking for a more premium website presence.", date: "Today", status: "New" },
  { id: "mail-002", sender: "Ida Palo", company: "Palo House", subject: "QA notes", snippet: "I added a few notes on the service section.", date: "Yesterday", status: "In review" },
  { id: "mail-003", sender: "Oskar Berg", company: "Northbound", subject: "Proposal feedback", snippet: "The timeline looks good. Can we adjust phase two?", date: "Jun 25", status: "Pending" },
];

export const settingsProfile = {
  studioName: "KWStudio",
  email: "hello@kwstudio.se",
  location: "Stockholm, Sweden",
  timezone: "Europe/Stockholm",
  brandColor: "#2E75BD",
};

export const recentActivity: SimpleActivity[] = [
  { id: "activity-001", title: "New lead received", detail: "Maja Lind requested a website redesign.", meta: "5 min ago", status: "New" },
  { id: "activity-002", title: "Report ready", detail: "June site health is ready to send.", meta: "1 hr ago", status: "Live" },
  { id: "activity-003", title: "Invoice paid", detail: "Northbound paid INV-1025.", meta: "Yesterday", status: "Paid" },
];

export const quickActions = [
  { label: "Review leads", href: "/admin/leads", icon: Users, description: "Open new enquiries" },
  { label: "Open projects", href: "/admin/projects", icon: FolderKanban, description: "Check delivery status" },
  { label: "Website reports", href: "/admin/reports", icon: FileText, description: "Review site health" },
  { label: "Calendar", href: "/admin/calendar", icon: CalendarDays, description: "View upcoming meetings" },
];

export const dashboardTasks: AdminTimelineItem[] = [
  { id: "dash-task-001", title: "Review Lind Studio enquiry", meta: "Today - Sales", detail: "Confirm budget range and send discovery times.", status: "Pending" },
  { id: "dash-task-002", title: "QA Palo House mobile header", meta: "Today - Delivery", detail: "Check navigation spacing before client review.", status: "Active" },
  { id: "dash-task-003", title: "Send Maison report recap", meta: "Tomorrow - Websites", detail: "Summarize score changes and next recommendations.", status: "Scheduled" },
];

export const upcomingMeetings: AdminTimelineItem[] = [
  { id: "meeting-001", title: "Discovery call", meta: "Jun 30, 10:00", detail: "Lind Studio website redesign.", status: "Scheduled" },
  { id: "meeting-002", title: "Design review", meta: "Jul 01, 14:30", detail: "Northbound service pages.", status: "Active" },
  { id: "meeting-003", title: "Launch planning", meta: "Jul 03, 09:00", detail: "Palo House final checklist.", status: "Scheduled" },
];

export const dashboardFinanceMetrics: AdminMetric[] = [
  { label: "Revenue this month", value: "64,000 SEK", detail: "Two invoices paid", href: "/admin/payments", icon: ReceiptText },
  { label: "Outstanding", value: "50,000 SEK", detail: "One overdue invoice", href: "/admin/invoices", icon: Banknote },
];

export const leadStageMetrics: AdminMetric[] = [
  { label: "New leads", value: "14", detail: "5 need first response", href: "/admin/leads" },
  { label: "Qualified", value: "9", detail: "Ready for discovery", href: "/admin/pipeline" },
  { label: "Proposal value", value: "188k SEK", detail: "4 proposals open", href: "/admin/proposals" },
  { label: "Won this month", value: "3", detail: "74k SEK booked", href: "/admin/pipeline" },
  { label: "Lost / archived", value: "4", detail: "Review source quality", href: "/admin/leads" },
  { label: "Conversion rate", value: "18%", detail: "Lead to won this month", href: "/admin/leads" },
];

export const projectStatusMetrics: AdminMetric[] = [
  { label: "Active", value: "7", detail: "Work in progress", href: "/admin/projects" },
  { label: "In review", value: "3", detail: "Awaiting client notes", href: "/admin/projects" },
  { label: "At risk", value: "1", detail: "Deadline needs attention", href: "/admin/tasks" },
  { label: "Completed", value: "5", detail: "Launched this quarter", href: "/admin/files" },
];

export const projectTimeline: AdminTimelineItem[] = [
  { id: "project-time-001", title: "Palo House homepage sent", meta: "Today", detail: "Client review package is ready.", status: "In review" },
  { id: "project-time-002", title: "Northbound copy locked", meta: "Yesterday", detail: "Service page messaging approved.", status: "Done" },
  { id: "project-time-003", title: "Maison commerce map started", meta: "Jun 28", detail: "Product categories need final input.", status: "Active" },
];

export const clientHealthMetrics: AdminMetric[] = [
  { label: "Active", value: "6", detail: "Current projects", href: "/admin/clients" },
  { label: "Waiting", value: "3", detail: "Pending client feedback", href: "/admin/clients" },
  { label: "Needs attention", value: "1", detail: "Follow-up overdue", href: "/admin/follow-ups" },
  { label: "High value", value: "4", detail: "Long-term accounts", href: "/admin/clients" },
];

export const featuredClients: FeaturedClient[] = [
  { id: "featured-client-001", name: "Palo House", contact: "Ida Palo", activeProject: "Palo House Refresh", latestInvoice: "INV-1024 - Pending", lastContact: "2026-06-27", notes: 8, lifetimeValue: "86,000 SEK", health: "Healthy" },
  { id: "featured-client-002", name: "Northbound", contact: "Oskar Berg", activeProject: "Strategy Site", latestInvoice: "INV-1025 - Paid", lastContact: "2026-06-25", notes: 5, lifetimeValue: "64,000 SEK", health: "Waiting" },
  { id: "featured-client-003", name: "Maison Vala", contact: "Sara Holm", activeProject: "Commerce Concept", latestInvoice: "INV-1026 - Overdue", lastContact: "2026-06-21", notes: 6, lifetimeValue: "48,000 SEK", health: "Needs attention" },
];

export const websiteHealthMetrics: AdminMetric[] = [
  { label: "Average score", value: "88", detail: "Across active reports", href: "/admin/reports" },
  { label: "Open reports", value: "5", detail: "Ready to review", href: "/admin/reports" },
  { label: "Uptime issues", value: "1", detail: "One monitor needs setup", href: "/admin/uptime" },
  { label: "SEO tasks", value: "7", detail: "Three high priority", href: "/admin/seo" },
];

export const websiteScores: WebsiteScore[] = [
  { label: "Performance", score: 91, detail: "Strong load and asset hygiene" },
  { label: "SEO", score: 86, detail: "Local page coverage improving" },
  { label: "Accessibility", score: 94, detail: "Good contrast and semantics" },
  { label: "Best Practices", score: 89, detail: "Minor launch checklist items" },
];

export const recentWebsiteScans: WebsiteReport[] = [
  { id: "scan-001", name: "Homepage launch scan", client: "Palo House", score: 94, status: "Live", date: "2026-06-29" },
  { id: "scan-002", name: "SEO baseline", client: "Northbound", score: 87, status: "In review", date: "2026-06-28" },
  { id: "scan-003", name: "Commerce readiness", client: "Maison Vala", score: 81, status: "Draft", date: "2026-06-26" },
];

export const financeMetrics: AdminMetric[] = [
  { label: "Revenue this month", value: "64,000 SEK", detail: "Two payments received", href: "/admin/payments" },
  { label: "Outstanding", value: "50,000 SEK", detail: "Includes 32,000 SEK overdue", href: "/admin/invoices" },
  { label: "Expenses", value: "950 SEK", detail: "Software and hosting", href: "/admin/expenses" },
  { label: "Estimated VAT", value: "16,000 SEK", detail: "For next report", href: "/admin/bookkeeping" },
];

export const financeActivity: AdminTimelineItem[] = [
  { id: "finance-activity-001", title: "Northbound payment received", meta: "Jun 21", detail: "INV-1025 paid by bank transfer.", status: "Paid" },
  { id: "finance-activity-002", title: "Maison invoice overdue", meta: "Jun 15", detail: "Schedule a payment reminder.", status: "Overdue" },
  { id: "finance-activity-003", title: "Tool expenses categorized", meta: "Jun 24", detail: "Figma, Cloudflare and AI tools reviewed.", status: "Done" },
];

export const aiRecentTools = [
  { title: "Website Analyzer", href: "/admin/analyzer", meta: "Used today" },
  { title: "Proposal Generator", href: "/admin/proposal-generator", meta: "Used yesterday" },
  { title: "Copywriter", href: "/admin/copywriter", meta: "Used Jun 26" },
];

export const aiPinnedTools = ["Proposal Generator", "Website Analyzer", "Copywriter"];

export const aiQuickPrompts: AiPrompt[] = [
  { id: "prompt-001", title: "Proposal angle", prompt: "Summarize the strongest business case for this website project." },
  { id: "prompt-002", title: "SEO next step", prompt: "List the three highest-impact SEO improvements for this client." },
  { id: "prompt-003", title: "Follow-up email", prompt: "Write a concise follow-up after a discovery call." },
];

export const leadSourceStats: LeadSourceStat[] = [
  { source: "Website form", count: 12, detail: "Inbound enquiries from kwstudio.se" },
  { source: "SCB company search", count: 18, detail: "New and local companies to qualify" },
  { source: "Manual prospect", count: 7, detail: "Hand-picked local businesses" },
  { source: "Referral", count: 5, detail: "Warm intros from existing clients" },
  { source: "LinkedIn", count: 6, detail: "Founder outreach and content replies" },
  { source: "Audit tool", count: 9, detail: "Website report requests" },
];

export const scbLeadFinderFilters: Record<string, ScbLeadFinderOption[]> = {
  county: [
    { id: "county-any", label: "Any county", value: "" },
    { id: "county-stockholm", label: "Stockholm county", value: "stockholm" },
    { id: "county-uppsala", label: "Uppsala county", value: "uppsala" },
    { id: "county-sodermanland", label: "Sodermanland county", value: "sodermanland" },
    { id: "county-ostergotland", label: "Ostergotland county", value: "ostergotland" },
    { id: "county-skane", label: "Skane county", value: "skane" },
    { id: "county-vastra-gotaland", label: "Vastra Gotaland county", value: "vastra_gotaland" },
    { id: "county-vastmanland", label: "Vastmanland county", value: "vastmanland" },
    { id: "county-vasterbotten", label: "Vasterbotten county", value: "vasterbotten" },
  ],
  municipality: [
    { id: "municipality-any", label: "Any municipality", value: "" },
    { id: "municipality-solna", label: "Solna", value: "solna" },
    { id: "municipality-stockholm", label: "Stockholm", value: "stockholm" },
    { id: "municipality-ekero", label: "Ekero", value: "ekero" },
    { id: "municipality-vallentuna", label: "Vallentuna", value: "vallentuna" },
    { id: "municipality-osteraker", label: "Osteraker", value: "osteraker" },
    { id: "municipality-uppsala", label: "Uppsala", value: "uppsala" },
    { id: "municipality-goteborg", label: "Goteborg", value: "goteborg" },
    { id: "municipality-malmo", label: "Malmo", value: "malmo" },
    { id: "municipality-lund", label: "Lund", value: "lund" },
    { id: "municipality-helsingborg", label: "Helsingborg", value: "helsingborg" },
    { id: "municipality-vasteras", label: "Vasteras", value: "vasteras" },
    { id: "municipality-orebro", label: "Orebro", value: "orebro" },
    { id: "municipality-linkoping", label: "Linkoping", value: "linkoping" },
    { id: "municipality-norrkoping", label: "Norrkoping", value: "norrkoping" },
    { id: "municipality-jonkoping", label: "Jonkoping", value: "jonkoping" },
    { id: "municipality-umea", label: "Umea", value: "umea" },
  ],
  industry: [
    { id: "industry-any", label: "Any industry", value: "" },
    { id: "industry-retail", label: "Retail and ecommerce", value: "retail_ecommerce" },
    { id: "industry-restaurants", label: "Restaurants and cafes", value: "restaurants_cafes" },
    { id: "industry-construction", label: "Construction", value: "construction" },
    { id: "industry-real-estate", label: "Real estate", value: "real_estate" },
    { id: "industry-consulting", label: "Consulting", value: "consulting" },
    { id: "industry-it", label: "IT and software", value: "it_software" },
    { id: "industry-health", label: "Health and wellness", value: "health_wellness" },
    { id: "industry-beauty", label: "Beauty and personal services", value: "beauty_personal_services" },
    { id: "industry-manufacturing", label: "Manufacturing", value: "manufacturing" },
  ],
  companyStatus: [
    { id: "status-active", label: "Active companies", value: "active" },
  ],
  taxStatus: [
    { id: "tax-any", label: "Any tax status", value: "" },
    { id: "tax-f", label: "Approved for F-tax", value: "f_tax_approved" },
    { id: "tax-vat", label: "Registered for VAT", value: "vat_registered" },
  ],
  employeeRange: [
    { id: "employees-any", label: "Any employee count", value: "" },
    { id: "employees-0", label: "0 employees", value: "0" },
    { id: "employees-1-4", label: "1-4 employees", value: "1_4" },
    { id: "employees-5-9", label: "5-9 employees", value: "5_9" },
    { id: "employees-10-19", label: "10-19 employees", value: "10_19" },
    { id: "employees-20-49", label: "20-49 employees", value: "20_49" },
    { id: "employees-50-99", label: "50-99 employees", value: "50_99" },
  ],
  registrationPeriod: [
    { id: "registered-any", label: "Any registration date", value: "" },
    { id: "registered-30", label: "Last 30 days", value: "last_30_days" },
    { id: "registered-90", label: "Last 90 days", value: "last_90_days" },
    { id: "registered-180", label: "Last 180 days", value: "last_180_days" },
    { id: "registered-365", label: "Last 365 days", value: "last_365_days" },
  ],
  adStatus: [
    { id: "advertising-any", label: "Any advertising status", value: "" },
    { id: "advertising-ok", label: "Accepts advertising", value: "accepts_advertising" },
    { id: "advertising-blocked", label: "Advertising blocked", value: "advertising_blocked" },
  ],
};

export const scbImportStatus: ScbImportStatus[] = [
  { label: "Matched categories", value: "24", detail: "Ready from GET /categories" },
  { label: "Available variables", value: "11", detail: "Ready from GET /variables" },
  { label: "Estimated count", value: "186", detail: "Preview from POST /count" },
  { label: "Last import", value: "32", detail: "Demo companies from POST /companies" },
];

export const studioLeads: StudioLead[] = [
  {
    id: "studio-lead-001",
    company: "Nordic Glow Clinic",
    contact: "Maja Erlandsson",
    email: "maja@nordicglow.se",
    phone: "+46 70 112 45 20",
    location: "Stockholm",
    source: "SCB company search",
    service: "New website",
    value: "58,000 SEK",
    stage: "Researching",
    priority: "High",
    nextAction: "Check current site and book outreach",
    lastActivity: "Imported today",
    assignedTo: "Kevin",
    date: "2026-06-30",
    note: "New wellness company with no clear web presence.",
  },
  {
    id: "studio-lead-002",
    company: "Berg & Linde Juridik",
    contact: "Oskar Berg",
    email: "oskar@berglinde.se",
    phone: "+46 73 984 21 10",
    location: "Solna",
    source: "Website form",
    service: "Redesign",
    value: "74,000 SEK",
    stage: "Qualified",
    priority: "High",
    nextAction: "Send discovery recap",
    lastActivity: "Discovery call yesterday",
    assignedTo: "Kevin",
    date: "2026-06-29",
    note: "Wants a more premium legal-services website.",
  },
  {
    id: "studio-lead-003",
    company: "Maison Reko",
    contact: "Sara Holm",
    email: "sara@maisonreko.com",
    phone: "+46 76 401 90 02",
    location: "Nacka",
    source: "LinkedIn",
    service: "Ecommerce",
    value: "96,000 SEK",
    stage: "Proposal",
    priority: "High",
    nextAction: "Follow up on proposal questions",
    lastActivity: "Proposal sent Jun 28",
    assignedTo: "Kevin",
    date: "2026-06-24",
    note: "Small product catalog with editorial brand needs.",
  },
  {
    id: "studio-lead-004",
    company: "Greenline Byggservice",
    contact: "Daniel Noor",
    email: "daniel@greenlinebygg.se",
    phone: "+46 72 350 18 44",
    location: "Uppsala",
    source: "Audit tool",
    service: "SEO / audit",
    value: "22,000 SEK",
    stage: "Contacted",
    priority: "Medium",
    nextAction: "Send audit highlights",
    lastActivity: "Audit requested today",
    assignedTo: "Kevin",
    date: "2026-06-30",
    note: "Local service pages are thin and slow.",
  },
  {
    id: "studio-lead-005",
    company: "Studio Hemma",
    contact: "Elin Rask",
    email: "elin@studiohemma.se",
    phone: "+46 70 892 31 77",
    location: "Stockholm",
    source: "Referral",
    service: "Care plan",
    value: "8,000 SEK/mo",
    stage: "Won",
    priority: "Medium",
    nextAction: "Prepare onboarding checklist",
    lastActivity: "Agreement approved Jun 27",
    assignedTo: "Kevin",
    date: "2026-06-20",
    note: "Needs monthly updates and analytics reporting.",
  },
  {
    id: "studio-lead-006",
    company: "Urban Cycle Repair",
    contact: "Johan Vik",
    email: "johan@urbancycle.se",
    phone: "+46 79 555 18 90",
    location: "Stockholm",
    source: "Manual prospect",
    service: "Redesign",
    value: "42,000 SEK",
    stage: "New",
    priority: "Low",
    nextAction: "Review website before outreach",
    lastActivity: "Added manually Jun 29",
    assignedTo: "Kevin",
    date: "2026-06-29",
    note: "Outdated mobile experience and unclear booking CTA.",
  },
  {
    id: "studio-lead-007",
    company: "Vasterort Redovisning",
    contact: "Nadia Aziz",
    email: "nadia@vasterortredovisning.se",
    phone: "+46 70 663 14 80",
    location: "Sundbyberg",
    source: "SCB company search",
    service: "New website",
    value: "48,000 SEK",
    stage: "Researching",
    priority: "Medium",
    nextAction: "Find decision maker",
    lastActivity: "Imported Jun 28",
    assignedTo: "Kevin",
    date: "2026-06-28",
    note: "New accounting firm with only social profiles.",
  },
  {
    id: "studio-lead-008",
    company: "Little North Cafe",
    contact: "Ida Lund",
    email: "ida@littlenorth.se",
    phone: "+46 73 104 67 22",
    location: "Stockholm",
    source: "Website form",
    service: "New website",
    value: "36,000 SEK",
    stage: "Lost",
    priority: "Low",
    nextAction: "Archive and tag price mismatch",
    lastActivity: "Declined Jun 26",
    assignedTo: "Kevin",
    date: "2026-06-22",
    note: "Budget was below current project minimum.",
  },
];

export const leadInsights = {
  nextFollowUps: [
    { id: "lead-follow-001", title: "Maison Reko proposal", detail: "Clarify ecommerce phase two.", meta: "Today" },
    { id: "lead-follow-002", title: "Berg & Linde recap", detail: "Send positioning summary.", meta: "Tomorrow" },
    { id: "lead-follow-003", title: "Greenline audit", detail: "Send three highest-impact fixes.", meta: "Friday" },
  ],
  hotProspects: [
    { id: "hot-001", title: "Nordic Glow Clinic", detail: "New company, no strong website, high fit.", meta: "92% fit" },
    { id: "hot-002", title: "Maison Reko", detail: "Proposal open with clear launch goal.", meta: "96k SEK" },
    { id: "hot-003", title: "Berg & Linde Juridik", detail: "Premium redesign need and active budget.", meta: "High priority" },
  ],
  aiSuggestions: [
    { id: "ai-001", title: "Prioritize SCB wellness leads", detail: "Clinics and local services show fastest response rate.", meta: "Suggested" },
    { id: "ai-002", title: "Use audit-first outreach", detail: "Lead with one visible mobile or SEO issue.", meta: "Suggested" },
    { id: "ai-003", title: "Follow proposals within 48h", detail: "Two open proposals have decision windows this week.", meta: "Suggested" },
  ],
};

export const leadDashboardStates = [
  { id: "state-loading", title: "Loading leads", detail: "Lead records will stream here while Supabase or SCB data is loading." },
  { id: "state-empty", title: "No leads found", detail: "Adjust filters or import companies from SCB to rebuild this view." },
  { id: "state-supabase", title: "Supabase not configured", detail: "The page stays usable with demo data until frontend anon credentials are available." },
  { id: "state-render", title: "KWStudio API not configured", detail: "Render API actions show a calm status message instead of failing the dashboard." },
  { id: "state-api", title: "SCB API unavailable", detail: "Keep manual leads available and retry the SCB request later." },
  { id: "state-import-started", title: "Import started", detail: "Selected SCB companies can be queued for qualification through POST /companies." },
  { id: "state-import-failed", title: "Import failed", detail: "A failed import should keep existing lead data visible and preserve filter context." },
  { id: "state-import", title: "Import completed", detail: "Selected companies were added to the qualification queue." },
  { id: "state-audit-pending", title: "Audit pending", detail: "Website checks can run asynchronously after a lead has a detected domain." },
  { id: "state-audit-failed", title: "Audit failed", detail: "A failed website audit should keep the lead actionable for manual review." },
  { id: "state-audit-completed", title: "Audit completed", detail: "Scores and findings are ready to use in qualification and outreach." },
];
