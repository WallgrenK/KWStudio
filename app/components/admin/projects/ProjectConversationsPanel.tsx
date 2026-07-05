import { ProjectConversationsBrowser } from "~/components/conversations/ProjectConversationsBrowser";

type ProjectConversationsPanelProps = {
  projectId: string;
};

export function ProjectConversationsPanel({ projectId }: ProjectConversationsPanelProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
        <p className="mt-1 text-sm text-gray-500">
          Project messages with your client. Workflow events appear as system messages.
        </p>
      </div>
      <ProjectConversationsBrowser projectId={projectId} mode="admin" />
    </section>
  );
}
