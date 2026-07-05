import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { EmptyState } from "~/components/admin/EmptyState";
import { ProjectWorkflowPanel } from "~/components/admin/projects/ProjectWorkflowPanel";
import { ProjectAssetsPanel } from "~/components/admin/projects/ProjectAssetsPanel";
import { getAdminProjectDashboard, isPortalApiConfigured } from "~/services/portalApi";

export default function AdminProjectWorkflowPage() {
  const { projectId } = useParams();
  const [title, setTitle] = useState("Project");
  const [clientName, setClientName] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId || !isPortalApiConfigured) return;

    void getAdminProjectDashboard(projectId).then((result) => {
      if (result.ok && result.data) {
        setTitle(result.data.project.title);
      }
    });
  }, [projectId]);

  if (!projectId) {
    return (
      <AdminShell title="Project" description="Workflow management">
        <EmptyState title="Project not found" description="Missing project ID." />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={title}
      description={clientName ? `${clientName} · Workflow` : "Delivery workflow"}
      action={(
        <Link className="btn btn-primary" to="/admin/projects">
          All projects
        </Link>
      )}
    >
      <ProjectWorkflowPanel projectId={projectId} />
      <div className="mt-8">
        <ProjectAssetsPanel projectId={projectId} />
      </div>
    </AdminShell>
  );
}
