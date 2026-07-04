import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { EmptyState } from "~/components/admin/EmptyState";
import { FormCard } from "~/components/admin/FormCard";
import { StatusBadge } from "~/components/admin/StatusBadge";
import {
  advanceProjectPhase,
  completeProjectClientActionAdmin,
  completeProjectMilestone,
  createProjectClientAction,
  createProjectMilestone,
  getAdminProjectDashboard,
  initProjectWorkflow,
  isPortalApiConfigured,
  updateProjectStatus,
} from "~/services/portalApi";
import type { PortalProjectDashboardDto } from "~/types/workflow";

const PROJECT_STATUSES = [
  "draft",
  "active",
  "waiting_for_client",
  "on_hold",
  "completed",
  "cancelled",
] as const;

type ProjectWorkflowPanelProps = {
  projectId: string;
};

export function ProjectWorkflowPanel({ projectId }: ProjectWorkflowPanelProps) {
  const [dashboard, setDashboard] = useState<PortalProjectDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [actionTitle, setActionTitle] = useState("");
  const [actionType, setActionType] = useState("task");

  const load = useCallback(async () => {
    if (!isPortalApiConfigured) {
      setError("Portal API not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await getAdminProjectDashboard(projectId);
    if (result.ok && result.data) {
      setDashboard(result.data);
    } else {
      setError(result.error ?? "Could not load workflow.");
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(key: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(key);
    setMessage(null);
    setError(null);
    const result = await fn();
    if (result.ok) {
      setMessage("Updated.");
      await load();
    } else {
      setError(result.error ?? "Action failed.");
    }
    setBusy(null);
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading workflow…</p>;
  }

  if (error && !dashboard) {
    return <EmptyState title="Workflow unavailable" description={error} />;
  }

  if (!dashboard) {
    return (
      <EmptyState
        title="No workflow data"
        description="Initialize the workflow to begin managing delivery."
        action={(
          <button
            className="btn btn-primary"
            type="button"
            disabled={busy === "init"}
            onClick={() => void runAction("init", () => initProjectWorkflow(projectId))}
          >
            Initialize workflow
          </button>
        )}
      />
    );
  }

  const { project, workflow, progress, milestones, clientActions, activity, emptyState } = dashboard;

  return (
    <div className="space-y-6">
      {message ? <p className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {!workflow ? (
        <FormCard title="Workflow not initialized">
          <p className="text-sm text-gray-500">This project does not have a workflow yet.</p>
          <button
            className="btn btn-primary mt-4"
            type="button"
            disabled={busy === "init"}
            onClick={() => void runAction("init", () => initProjectWorkflow(projectId))}
          >
            Initialize workflow
          </button>
        </FormCard>
      ) : (
        <>
          <FormCard title="Delivery overview">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Template</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {workflow.templateSlug} v{workflow.templateVersion}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Current phase</p>
                <p className="mt-1 text-sm font-medium text-[#2E75BD]">
                  {workflow.currentPhase?.title ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Progress</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {progress.percent !== null ? `${progress.percent}%` : "Not configured"}
                </p>
              </div>
            </div>
          </FormCard>

          <FormCard title="Project status">
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={project.status}
                onChange={(event) => void runAction("status", () => updateProjectStatus(projectId, event.target.value))}
                disabled={busy === "status"}
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <StatusBadge status={project.status.replace(/_/g, " ")} />
              <button
                className="btn btn-primary"
                type="button"
                disabled={busy === "advance"}
                onClick={() => void runAction("advance", () => advanceProjectPhase(projectId))}
              >
                Advance to next phase
              </button>
            </div>
          </FormCard>

          <FormCard title="Timeline">
            <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {workflow.phases.map((phase) => (
                <li
                  key={phase.id}
                  className={`rounded-xl border px-4 py-3 ${phase.status === "current" ? "border-[#2E75BD] bg-[#eff6ff]" : "border-gray-100"}`}
                >
                  <p className="text-sm font-semibold text-gray-900">{phase.title}</p>
                  <p className="mt-1 text-xs capitalize text-gray-500">{phase.status}</p>
                </li>
              ))}
            </ol>
          </FormCard>
        </>
      )}

      <FormCard title="Milestones">
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="New milestone title"
            value={milestoneTitle}
            onChange={(event) => setMilestoneTitle(event.target.value)}
          />
          <button
            className="btn btn-primary"
            type="button"
            disabled={!milestoneTitle.trim() || busy === "milestone"}
            onClick={() => void runAction("milestone", async () => {
              const result = await createProjectMilestone(projectId, { title: milestoneTitle.trim() });
              if (result.ok) setMilestoneTitle("");
              return result;
            })}
          >
            Add milestone
          </button>
        </div>
        <div className="space-y-2">
          {milestones.length === 0 ? (
            <p className="text-sm text-gray-500">No milestones yet.</p>
          ) : (
            milestones.map((milestone) => (
              <div key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                  <p className="text-xs capitalize text-gray-500">{milestone.status} · {milestone.dueStatus.replace(/_/g, " ")}</p>
                </div>
                {milestone.status !== "completed" ? (
                  <button
                    className="text-sm font-medium text-[#2E75BD]"
                    type="button"
                    disabled={busy === `ms-${milestone.id}`}
                    onClick={() => void runAction(`ms-${milestone.id}`, () => completeProjectMilestone(projectId, milestone.id))}
                  >
                    Complete
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </FormCard>

      <FormCard title="Client actions">
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="New client action"
            value={actionTitle}
            onChange={(event) => setActionTitle(event.target.value)}
          />
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={actionType}
            onChange={(event) => setActionType(event.target.value)}
          >
            {["task", "approval", "upload", "review", "meeting", "payment"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!actionTitle.trim() || busy === "action"}
            onClick={() => void runAction("action", async () => {
              const result = await createProjectClientAction(projectId, {
                title: actionTitle.trim(),
                actionType,
              });
              if (result.ok) setActionTitle("");
              return result;
            })}
          >
            Add action
          </button>
        </div>
        <div className="space-y-2">
          {clientActions.length === 0 ? (
            <p className="text-sm text-gray-500">No client actions yet.</p>
          ) : (
            clientActions.map((action) => (
              <div key={action.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                    {action.status === "completed" && action.completedByActorType === "client" ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                        Completed by client
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs capitalize text-gray-500">
                    {action.action_type} · {action.status.replace(/_/g, " ")}
                    {action.completed_at
                      ? ` · ${new Date(action.completed_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                      : ""}
                  </p>
                  {action.isLocked && action.status !== "completed" && action.lockedReason ? (
                    <p className="mt-1 text-xs text-amber-700">{action.lockedReason}</p>
                  ) : null}
                </div>
                {action.status !== "completed" ? (
                  <button
                    className="text-sm font-medium text-[#2E75BD] disabled:opacity-50"
                    type="button"
                    disabled={busy === `act-${action.id}` || action.isLocked}
                    onClick={() => void runAction(`act-${action.id}`, () => completeProjectClientActionAdmin(projectId, action.id))}
                  >
                    Complete
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </FormCard>

      <FormCard title="Activity">
        {activity.length === 0 ? (
          <p className="text-sm text-gray-500">{emptyState.hints[0] ?? "No activity yet."}</p>
        ) : (
          <ol className="space-y-3">
            {activity.map((event) => (
              <li key={event.id} className="rounded-lg border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400">{event.timeLabel}</p>
                <p className="text-sm font-medium text-gray-900">{event.title}</p>
                {event.actorLabel ? (
                  <p className="mt-0.5 text-xs text-gray-500">{event.actorLabel}</p>
                ) : null}
                {event.description ? <p className="mt-1 text-sm text-gray-500">{event.description}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </FormCard>

      <Link className="text-sm font-medium text-[#2E75BD]" to="/admin/projects">
        Back to projects
      </Link>
    </div>
  );
}
