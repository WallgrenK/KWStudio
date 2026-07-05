import { Link } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { DocumentCreateForm } from "~/components/admin/documents/DocumentCreateForm";

export default function AdminDocumentsNewPage() {
  return (
    <AdminShell
      title="New document"
      description="Create a document from a published template."
      action={(
        <Link className="btn border border-gray-200 bg-white text-gray-700 hover:border-kw-brand" to="/admin/documents">
          Back to library
        </Link>
      )}
    >
      <DocumentCreateForm />
    </AdminShell>
  );
}
