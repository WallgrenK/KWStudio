export type DueStatus = "no_due_date" | "upcoming" | "due_today" | "overdue" | "completed";

export type ActionType = "task" | "approval" | "upload" | "review" | "meeting" | "payment";

export type ActivityImportance = "info" | "success" | "warning" | "critical";

export type WorkflowPhaseDto = {
  id: string;
  phaseKey: string;
  title: string;
  description: string | null;
  sortOrder: number;
  status: "upcoming" | "current" | "completed" | "skipped";
  startedAt: string | null;
  completedAt: string | null;
};

export type WorkflowProgressDto = {
  percent: number | null;
  completedCount: number;
  totalCount: number;
};

export type WorkflowMilestoneDto = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  status: string;
  completion_mode: string;
  due_date: string | null;
  completed_at: string | null;
  visibility: string;
  dueStatus: DueStatus;
};

export type WorkflowClientActionDto = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  action_type: ActionType;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
  estimated_minutes: number | null;
  created_at: string;
  dueStatus: DueStatus;
  isLocked: boolean;
  lockedReason: string | null;
  completedByActorType?: "admin" | "client" | "system" | null;
};

export type WorkflowActivityDto = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  importance: ActivityImportance;
  created_at: string;
  timeLabel: string;
  actorLabel?: string | null;
};

export type WorkflowContactDto = {
  name: string;
  role: string;
  email: string;
  responseTime: string;
};

export type PortalProjectDashboardDto = {
  ok: true;
  project: {
    id: string;
    client_id: string;
    service_id: string;
    title: string;
    status: string;
    description: string | null;
    start_date: string | null;
    due_date: string | null;
    created_at: string;
    updated_at: string;
  };
  workflow: {
    templateSlug: string;
    templateVersion: number;
    currentPhase: WorkflowPhaseDto | null;
    phases: WorkflowPhaseDto[];
    startedAt: string | null;
    completedAt: string | null;
  } | null;
  progress: WorkflowProgressDto;
  clientActions: WorkflowClientActionDto[];
  milestones: WorkflowMilestoneDto[];
  activity: WorkflowActivityDto[];
  contact: WorkflowContactDto | null;
  emptyState: {
    hasWorkflow: boolean;
    hints: string[];
  };
};

export type PortalServiceDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  default_workflow_template_id: string | null;
  is_active: boolean;
};

export type AdminProjectListItemDto = {
  id: string;
  title: string;
  status: string;
  client_id: string;
  service_id: string;
  created_at: string;
  updated_at: string;
  clients: { company_name: string } | null;
  services: { name: string; slug: string } | null;
  current_phase_title: string | null;
  has_workflow: boolean;
};
