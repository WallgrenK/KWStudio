import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { EmptyState } from "~/components/admin/EmptyState";
import { StatusBadge } from "~/components/admin/StatusBadge";
import { listAdminProjects, isPortalApiConfigured } from "~/services/portalApi";
import type { AdminProjectListItemDto } from "~/types/workflow";

function formatProjectDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProjectListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPortalApiConfigured) {
      setError("Portal API not configured.");
      setLoading(false);
      return;
    }

    void listAdminProjects().then((result) => {
      if (result.ok && result.data?.projects) {
        setProjects(result.data.projects);
      } else {
        setError(result.error ?? "Could not load projects.");
      }
      setLoading(false);
    });
  }, []);

  return (
    <AdminShell
      title="Projects"
      description="Track delivery workflow and client project progress."
      action={(
        <Link className="btn btn-primary" to="/admin/projects/new">
          New project
        </Link>
      )}
    >
      {loading ? <p className="text-sm text-gray-500">Loading projects…</p> : null}
      {error ? <EmptyState title="Could not load projects" description={error} /> : null}

      {!loading && !error && projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start a delivery workflow for a client."
          action={(
            <Link className="btn btn-primary" to="/admin/projects/new">
              New project
            </Link>
          )}
        />
      ) : null}

      {!loading && projects.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-gray-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-400 md:grid">
            <span>Project</span>
            <span>Client</span>
            <span>Service</span>
            <span>Phase</span>
            <span>Status</span>
            <span>Updated</span>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/admin/projects/${project.id}`}
                className="block px-5 py-4 transition hover:bg-gray-50"
              >
                <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.8fr_0.8fr] md:items-center md:gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400 md:hidden">
                      {project.clients?.company_name ?? "Client"}
                      {project.services?.name ? ` · ${project.services.name}` : ""}
                    </p>
                  </div>
                  <p className="hidden text-sm text-gray-600 md:block">{project.clients?.company_name ?? "—"}</p>
                  <p className="hidden text-sm text-gray-600 md:block">{project.services?.name ?? "—"}</p>
                  <p className="text-sm text-gray-600">
                    {project.current_phase_title ?? (project.has_workflow ? "—" : "Not initialized")}
                  </p>
                  <div>
                    <StatusBadge status={project.status.replace(/_/g, " ")} />
                  </div>
                  <p className="text-sm text-gray-500">{formatProjectDate(project.updated_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
