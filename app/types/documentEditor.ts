import type { DocumentBlockType, DocumentDto, DocumentVersionDto } from "~/types/documents";

export type EditorFocusedField = {
  blockClientId: string;
  fieldKey: string;
  insertText: (value: string) => void;
} | null;

export type EditorSelection = {
  selectedBlockClientId: string | null;
  hoveredBlockClientId: string | null;
  focusedField: EditorFocusedField;
};

export type EditorDirtyState = {
  isDirty: boolean;
  lastSavedAt: string | null;
  savedSnapshotKey: string;
};

export type EditorValidationState = {
  clientErrors: Record<string, string[]>;
  serverErrors: string[];
  serverWarnings: string[];
  serverOk: boolean | null;
};

export type EditorDocument = {
  id: string;
  title: string;
  status: DocumentDto["status"];
  clientId: string;
  projectId: string | null;
  currency: string;
  referenceNumber: string | null;
  versionId: string;
  versionNumber: number;
  versionStatus: DocumentVersionDto["status"];
  versionPublishedAt: string | null;
  versionCreatedAt: string;
  isReadOnly: boolean;
};

export type EditorBlock = {
  clientId: string;
  serverId: string | null;
  blockType: DocumentBlockType;
  sortOrder: number;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  collapsed: boolean;
};

export type EditorState = {
  document: EditorDocument;
  blocks: EditorBlock[];
};

export type DocumentBlockSavePayload = {
  sortOrder: number;
  blockType: DocumentBlockType;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
};

export type EditorRightTab = "properties" | "preview" | "variables";
