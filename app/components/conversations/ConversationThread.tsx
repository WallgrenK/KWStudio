import type { ConversationMessageDto } from "~/types/conversations";

type ConversationThreadProps = {
  messages: ConversationMessageDto[];
  mode: "admin" | "portal";
  onAttachAsset?: (messageId: string) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationThread({ messages, mode, onAttachAsset }: ConversationThreadProps) {
  if (!messages.length) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12 text-sm text-gray-500">
        No messages yet. Start the conversation below.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      {messages.map((message) => {
        const isSystem = message.messageType === "system" || message.senderRole === "system";
        const isOwnSide = mode === "admin"
          ? message.senderRole === "admin"
          : message.senderRole === "client";

        if (isSystem) {
          return (
            <div key={message.id} className="flex justify-center">
              <div className="max-w-xl rounded-full bg-gray-100 px-4 py-2 text-center text-xs text-gray-600">
                {message.body}
                <span className="ml-2 text-gray-400">{formatDate(message.createdAt)}</span>
              </div>
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className={`flex ${isOwnSide ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                isOwnSide
                  ? "bg-[#2E75BD] text-white"
                  : "border border-gray-200 bg-white text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.body}</p>
              {message.attachments.length ? (
                <ul className={`mt-2 space-y-1 text-xs ${isOwnSide ? "text-blue-100" : "text-gray-500"}`}>
                  {message.attachments.map((attachment) => (
                    <li key={attachment.id}>
                      Attached: {attachment.assetTitle ?? attachment.entityId}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className={`mt-2 flex items-center gap-2 text-xs ${isOwnSide ? "text-blue-100" : "text-gray-400"}`}>
                <span>{formatDate(message.createdAt)}</span>
                {message.status === "edited" ? <span>· edited</span> : null}
                {onAttachAsset ? (
                  <button
                    type="button"
                    onClick={() => onAttachAsset(message.id)}
                    className={`underline ${isOwnSide ? "text-blue-100" : "text-[#2E75BD]"}`}
                  >
                    Attach asset
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
