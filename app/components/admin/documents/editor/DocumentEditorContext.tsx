import { createContext } from "react";
import type {
  DocumentBlockTypeMetadataDto,
  DocumentDto,
  DocumentVariableDefinitionDto,
  DocumentVersionDto,
} from "~/types/documents";
import type {
  EditorDirtyState,
  EditorRightTab,
  EditorSelection,
  EditorState,
  EditorValidationState,
} from "~/types/documentEditor";

export type DocumentEditorContextValue = {
  documentId: string;
  documentDto: DocumentDto;
  versions: DocumentVersionDto[];
  blockTypeMetadata: Record<string, DocumentBlockTypeMetadataDto>;
  variables: DocumentVariableDefinitionDto[];
  editorState: EditorState;
  selection: EditorSelection;
  dirtyState: EditorDirtyState;
  validationState: EditorValidationState;
  clipboardBlock: EditorState["blocks"][number] | null;
  isReadOnly: boolean;
  rightTab: EditorRightTab;
  previewHtml: string | null;
  previewWarnings: string[];
  previewLoading: boolean;
  previewError: string | null;
  actionLoading: string | null;
  actionMessage: string | null;
  loadVersion: (versionId: string) => Promise<void>;
  selectBlock: (clientId: string | null) => void;
  hoverBlock: (clientId: string | null) => void;
  setFocusedField: (field: EditorSelection["focusedField"]) => void;
  setRightTab: (tab: EditorRightTab) => void;
  updateBlock: (
    clientId: string,
    patch: Partial<Pick<EditorState["blocks"][number], "content" | "settings" | "collapsed">>,
  ) => void;
  insertBlock: (blockType: EditorState["blocks"][number]["blockType"], position?: number) => void;
  duplicateBlock: (clientId: string) => void;
  deleteBlock: (clientId: string) => void;
  moveBlockUp: (clientId: string) => void;
  moveBlockDown: (clientId: string) => void;
  toggleCollapse: (clientId: string) => void;
  copyBlock: (clientId: string) => void;
  pasteBlock: (position?: number) => void;
  saveDraft: () => Promise<void>;
  discardChanges: () => Promise<void>;
  discardDraftVersion: () => Promise<void>;
  validateClient: () => void;
  validateServer: () => Promise<boolean>;
  publish: () => Promise<void>;
  refreshPreview: () => Promise<void>;
  insertVariable: (key: string) => void;
  createDraftVersion: () => Promise<void>;
  createNewVersion: () => Promise<void>;
  reloadVersions: () => Promise<void>;
};

export const DocumentEditorContext = createContext<DocumentEditorContextValue | null>(null);
