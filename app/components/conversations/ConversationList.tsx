import type { ConversationDto } from "~/types/conversations";

type ConversationListProps = {
  conversations: ConversationDto[];
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
  showProjectTitle?: boolean;
};

function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  showProjectTitle = false,
}: ConversationListProps) {
  if (!conversations.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        No conversations yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedId;
        const unread = conversation.unreadCount ?? 0;

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                isSelected ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {conversation.displayTitle}
                  </p>
                  {unread > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#2E75BD] px-1.5 text-xs font-semibold text-white">
                      {unread}
                    </span>
                  ) : null}
                </div>
                {showProjectTitle && conversation.projectTitle ? (
                  <p className="mt-0.5 truncate text-xs text-gray-500">{conversation.projectTitle}</p>
                ) : null}
                {conversation.lastMessagePreview ? (
                  <p className="mt-1 truncate text-xs text-gray-500">{conversation.lastMessagePreview}</p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs text-gray-400">
                {formatRelativeTime(conversation.lastMessageAt ?? conversation.updatedAt)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
