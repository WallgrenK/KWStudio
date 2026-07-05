import { AdminShell } from "~/components/admin/AdminShell";
import { AdminGlobalMessagesPanel } from "~/components/admin/AdminGlobalMessagesPanel";

export default function AdminMessagesPage() {
  return (
    <AdminShell
      title="Messages"
      description="Cross-project conversations with clients."
    >
      <AdminGlobalMessagesPanel />
    </AdminShell>
  );
}
