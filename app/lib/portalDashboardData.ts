import type {
  PortalChecklistItem,
  PortalChecklistMeta,
  PortalContactInfo,
  PortalDashboardData,
  PortalProjectInfo,
  PortalTimelinePhase,
} from "~/data/portalDashboard";
import { formatDueStatusLabel } from "~/lib/portalClientActionUi";
import type {
  PortalProjectDashboardDto,
  WorkflowClientActionDto,
  WorkflowPhaseDto,
} from "~/types/workflow";

function mapPhasesToTimeline(phases: WorkflowPhaseDto[]): PortalTimelinePhase[] {
  if (!phases.length) return [];

  return phases.map((phase) => ({
    id: phase.phaseKey as PortalTimelinePhase["id"],
    label: phase.title,
    status:
      phase.status === "completed"
        ? "completed"
        : phase.status === "current"
          ? "current"
          : "upcoming",
  }));
}

function normalizePriority(priority: string): PortalChecklistItem["priority"] {
  if (priority === "low" || priority === "high") return priority;
  return "normal";
}

function normalizeStatus(status: string): PortalChecklistItem["status"] {
  if (status === "open" || status === "in_progress" || status === "completed" || status === "cancelled") {
    return status;
  }
  return "open";
}

function mapClientActionsToChecklist(actions: WorkflowClientActionDto[]): PortalChecklistItem[] {
  return actions.map((action) => ({
    id: action.id,
    label: action.title,
    description: action.description,
    completed: action.status === "completed",
    status: normalizeStatus(action.status),
    actionType: action.action_type,
    priority: normalizePriority(action.priority),
    dueStatus: action.dueStatus,
    dueDate: action.due_date,
    dueLabel: action.isLocked && action.status !== "completed"
      ? action.lockedReason ?? "Locked"
      : formatDueStatusLabel(action.dueStatus, action.due_date),
    isLocked: action.isLocked,
    lockedReason: action.lockedReason,
    estimatedMinutes: action.estimated_minutes,
    createdAt: action.created_at,
    completedAt: action.completed_at,
  }));
}

export function getChecklistMeta(actions: WorkflowClientActionDto[]): PortalChecklistMeta {
  const active = actions.filter((action) => action.status !== "cancelled");
  const pending = active.filter(
    (action) => action.status === "open" || action.status === "in_progress",
  );

  if (active.length === 0) {
    return { state: "empty", pendingCount: 0, totalCount: 0 };
  }
  if (pending.length === 0) {
    return { state: "all_completed", pendingCount: 0, totalCount: active.length };
  }
  return { state: "has_pending", pendingCount: pending.length, totalCount: active.length };
}

export function mapDashboardApiToViewModel(dashboard: PortalProjectDashboardDto): {
  data: PortalDashboardData;
  checklistMeta: PortalChecklistMeta;
  hasLiveProject: boolean;
  hasWorkflow: boolean;
  demoFlags: { nextSteps: boolean; activity: boolean; contact: boolean };
} {
  const { project, workflow, progress, clientActions, activity, contact } = dashboard;

  const projectInfo: PortalProjectInfo | null = workflow
    ? {
        id: project.id,
        name: project.title,
        status: project.status.replace(/_/g, " "),
        owner: "KWStudio team",
        estimatedLaunch: project.due_date
          ? new Date(project.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : "To be confirmed",
        projectType: project.description?.trim() || "Project",
        startedDate: project.start_date
          ? new Date(project.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
          : workflow.startedAt
            ? new Date(workflow.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
            : "To be confirmed",
        currentPhase: (workflow.currentPhase?.phaseKey ?? "discovery") as PortalProjectInfo["currentPhase"],
        progressPercent: progress.percent,
      }
    : null;

  const contactInfo: PortalContactInfo | null = contact
    ? {
        name: contact.name,
        role: contact.role,
        email: contact.email,
        responseTime: contact.responseTime,
      }
    : null;

  return {
    hasLiveProject: Boolean(project),
    hasWorkflow: Boolean(workflow),
    checklistMeta: getChecklistMeta(clientActions),
    demoFlags: {
      nextSteps: false,
      activity: false,
      contact: false,
    },
    data: {
      project: projectInfo,
      phases: workflow ? mapPhasesToTimeline(workflow.phases) : [],
      nextSteps: mapClientActionsToChecklist(clientActions),
      activity: activity.map((item) => ({
        id: item.id,
        timeLabel: item.timeLabel,
        title: item.title,
        description: item.description ?? undefined,
        importance: item.importance,
        actorLabel: item.actorLabel,
      })),
      contact: contactInfo,
    },
  };
}

export function getPortalFirstName(me: { contact?: { first_name?: string | null; email?: string } | null } | null): string {
  return me?.contact?.first_name?.trim() || me?.contact?.email?.split("@")[0] || "there";
}

export function pickPrimaryProjectId(
  projects: Array<{ id: string; status: string }>,
): string | null {
  if (projects.length === 0) return null;

  const active = projects.find((project) => {
    const status = project.status.toLowerCase();
    return !status.includes("archived") && !status.includes("cancelled") && status !== "completed";
  });

  return active?.id ?? projects[0]?.id ?? null;
}
