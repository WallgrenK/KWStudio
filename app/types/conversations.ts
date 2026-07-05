export const CONVERSATION_VISIBILITIES = ["client", "admin", "internal"] as const;
export type ConversationVisibility = (typeof CONVERSATION_VISIBILITIES)[number];

export const CONVERSATION_STATUSES = [
  "active",
  "waiting_for_client",
  "waiting_for_admin",
  "resolved",
  "archived",
] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const MESSAGE_TYPES = ["text", "system", "note", "status", "file", "approval"] as const;
export type MessageType = (typeof MESSAGE_TYPES)[number];

export const MESSAGE_STATUSES = ["active", "edited", "deleted"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export type ConversationDto = {
  id: string;
  projectId: string;
  title: string;
  subject: string | null;
  displayTitle: string;
  conversationType: string;
  visibility: ConversationVisibility;
  status: ConversationStatus;
  createdByProfileId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  projectTitle?: string | null;
  clientName?: string | null;
};

export type ConversationAttachmentDto = {
  id: string;
  messageId: string;
  entityModule: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  assetTitle?: string | null;
};

export type ConversationMessageDto = {
  id: string;
  conversationId: string;
  parentMessageId: string | null;
  senderProfileId: string | null;
  senderRole: "admin" | "client" | "system";
  messageType: MessageType;
  body: string;
  status: MessageStatus;
  metadata: Record<string, unknown>;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  attachments: ConversationAttachmentDto[];
};

export type ConversationParticipantDto = {
  id: string;
  conversationId: string;
  profileId: string;
  role: "admin" | "client";
  lastReadMessageId: string | null;
  joinedAt: string;
};

export type ConversationDetailDto = ConversationDto & {
  participants: ConversationParticipantDto[];
  messages: ConversationMessageDto[];
};
