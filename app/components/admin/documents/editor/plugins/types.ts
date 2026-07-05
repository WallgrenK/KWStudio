import type { ReactNode } from "react";
import type { DocumentBlockType, DocumentBlockTypeMetadataDto } from "~/types/documents";
import type { EditorBlock, EditorDocument } from "~/types/documentEditor";

export type EditorPluginRenderContext = {
  block: EditorBlock;
  document: EditorDocument;
  isReadOnly: boolean;
  metadata: DocumentBlockTypeMetadataDto | null;
  updateBlock: (
    clientId: string,
    patch: Partial<Pick<EditorBlock, "content" | "settings" | "collapsed">>,
  ) => void;
  setFocusedField: (
    field: {
      blockClientId: string;
      fieldKey: string;
      insertText: (value: string) => void;
    } | null,
  ) => void;
};

export type EditorPlugin = {
  blockType: DocumentBlockType;
  label: string;
  icon: string;
  group: string;
  order: number;
  createDefaultBlock: (sortOrder: number) => EditorBlock;
  renderEditor: (ctx: EditorPluginRenderContext) => ReactNode;
  renderToolbar: (ctx: EditorPluginRenderContext) => ReactNode | null;
  renderProperties: (ctx: EditorPluginRenderContext) => ReactNode;
  getSummary: (block: EditorBlock) => string;
  validateClientSide: (block: EditorBlock) => string[];
};
