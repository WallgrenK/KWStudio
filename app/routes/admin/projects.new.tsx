import { Link } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { CreateProjectForm } from "~/components/admin/projects/CreateProjectForm";

export default function AdminNewProjectPage() {
  return (
    <AdminShell
      title="New project"
      description="Create a client project and initialize its delivery workflow."
      action={(
        <Link className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand" to="/admin/projects">
          Back to projects
        </Link>
      )}
    >
      <CreateProjectForm />
    </AdminShell>
  );
}
