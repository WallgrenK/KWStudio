/**
 * Demo/fallback content for the client portal dashboard.
 *
 * Used only when live backend modules are not yet available.
 * Do not treat these values as production business data.
 */

import { DEFAULT_BUSINESS_SETTINGS, DEFAULT_PUBLIC_SETTINGS } from "~/settings/settingsDefaults";
import type { ActionType, DueStatus } from "~/types/workflow";

export type PortalProjectPhaseId =
  | "discovery"
  | "planning"
  | "design"
  | "development"
  | "testing"
  | "launch"
  | "completed";

export type PortalTimelinePhase = {
  id: PortalProjectPhaseId;
  label: string;
  status: "completed" | "current" | "upcoming";
};

export type PortalChecklistItem = {
  id: string;
  label: string;
  description?: string | null;
  completed: boolean;
  status: "open" | "in_progress" | "completed" | "cancelled";
  actionType: ActionType;
  priority: "low" | "normal" | "high";
  dueStatus: DueStatus;
  dueDate: string | null;
  dueLabel?: string;
  isLocked: boolean;
  lockedReason?: string | null;
  estimatedMinutes?: number | null;
  createdAt?: string;
  completedAt?: string | null;
};

export type PortalChecklistMeta = {
  state: "empty" | "all_completed" | "has_pending";
  pendingCount: number;
  totalCount: number;
};

export type PortalActivityItem = {
  id: string;
  timeLabel: string;
  title: string;
  description?: string;
  importance?: "info" | "success" | "warning" | "critical";
  actorLabel?: string | null;
};

export type PortalQuickAccessItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type PortalProjectInfo = {
  id?: string;
  name: string;
  status: string;
  owner: string;
  estimatedLaunch: string;
  projectType: string;
  startedDate: string;
  currentPhase: PortalProjectPhaseId;
  progressPercent?: number | null;
};

export type PortalContactInfo = {
  name: string;
  role: string;
  email: string;
  responseTime: string;
};

export type PortalDashboardData = {
  project: PortalProjectInfo | null;
  phases: PortalTimelinePhase[];
  nextSteps: PortalChecklistItem[];
  activity: PortalActivityItem[];
  contact: PortalContactInfo | null;
};

export type PortalProjectSummary = {
  id: string;
  title: string;
  status: string;
};

/** Flags indicating which sections still use demo fallback content. */
export type PortalDashboardDemoFlags = {
  nextSteps: boolean;
  activity: boolean;
  contact: boolean;
};

export const PORTAL_PHASES: Array<{ id: PortalProjectPhaseId; label: string }> = [
  { id: "discovery", label: "Discovery" },
  { id: "planning", label: "Planning" },
  { id: "design", label: "Design" },
  { id: "development", label: "Development" },
  { id: "testing", label: "Testing" },
  { id: "launch", label: "Launch" },
];

export function buildTimelinePhases(currentPhase: PortalProjectPhaseId): PortalTimelinePhase[] {
  const currentIndex = PORTAL_PHASES.findIndex((phase) => phase.id === currentPhase);

  return PORTAL_PHASES.map((phase, index) => ({
    id: phase.id,
    label: phase.label,
    status: index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming",
  }));
}

/** Demo checklist shown until a tasks/actions API exists. */
export const DEMO_FALLBACK_NEXT_STEPS: PortalChecklistItem[] = [
  {
    id: "demo-step-1",
    label: "Kickoff meeting",
    completed: true,
    status: "completed",
    actionType: "meeting",
    priority: "normal",
    dueStatus: "completed",
    dueDate: null,
    isLocked: false,
  },
  {
    id: "demo-step-2",
    label: "Upload logo",
    completed: false,
    status: "open",
    actionType: "upload",
    priority: "high",
    dueStatus: "upcoming",
    dueDate: null,
    isLocked: false,
  },
  {
    id: "demo-step-3",
    label: "Send texts",
    completed: false,
    status: "open",
    actionType: "task",
    priority: "normal",
    dueStatus: "no_due_date",
    dueDate: null,
    isLocked: false,
  },
  {
    id: "demo-step-4",
    label: "Approve homepage",
    completed: false,
    status: "open",
    actionType: "approval",
    priority: "high",
    dueStatus: "upcoming",
    dueDate: null,
    isLocked: false,
  },
  {
    id: "demo-step-5",
    label: "Final review",
    completed: false,
    status: "open",
    actionType: "review",
    priority: "normal",
    dueStatus: "no_due_date",
    dueDate: null,
    isLocked: false,
  },
];

/** Demo activity feed shown until an activity API exists. */
export const DEMO_FALLBACK_ACTIVITY: PortalActivityItem[] = [
  { id: "demo-act-1", timeLabel: "Yesterday", title: "Project created", description: "Your project workspace is ready." },
  { id: "demo-act-2", timeLabel: "Today", title: "Kickoff scheduled", description: "We confirmed the first alignment meeting." },
  { id: "demo-act-3", timeLabel: "Tomorrow", title: "Waiting for logo upload", description: "Share your logo files when ready." },
];

/** Demo contact shown until team assignment API exists. */
export const DEMO_FALLBACK_CONTACT: PortalContactInfo = {
  name: "Kim Wahlström",
  role: "Project manager",
  email: DEFAULT_PUBLIC_SETTINGS.business.contactEmail,
  responseTime: "Within 1 business day",
};

/** Default owner label when project API has no owner field yet. */
export const DEMO_FALLBACK_PROJECT_OWNER = `${DEFAULT_BUSINESS_SETTINGS.companyName} team`;

export const PORTAL_QUICK_ACCESS: PortalQuickAccessItem[] = [
  { id: "documents", title: "Documents", description: "Proposals, contracts, and briefs", href: "/portal/documents" },
  { id: "invoices", title: "Invoices", description: "Billing history and receipts", href: "/portal/invoices" },
  { id: "messages", title: "Messages", description: `Conversations with ${DEFAULT_BUSINESS_SETTINGS.companyName}`, href: "/portal/messages" },
  { id: "files", title: "Files", description: "Shared assets and deliverables", href: "/portal/files" },
  { id: "support", title: "Support", description: "Help and project questions", href: "/portal/support" },
];
