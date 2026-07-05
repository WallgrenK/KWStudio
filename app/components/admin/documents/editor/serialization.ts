import type {
  DocumentBlockDto,
  DocumentDto,
  DocumentVersionDto,
} from "~/types/documents";
import type {
  DocumentBlockSavePayload,
  EditorBlock,
  EditorDocument,
  EditorState,
} from "~/types/documentEditor";

function createSnapshotKey(blocks: EditorBlock[]): string {
  return JSON.stringify(
    blocks.map((block) => ({
      blockType: block.blockType,
      sortOrder: block.sortOrder,
      content: block.content,
      settings: block.settings,
    })),
  );
}

export function computeEditorSnapshotKey(state: EditorState): string {
  return createSnapshotKey(state.blocks);
}

export function isDocumentEditorReadOnly(
  document: Pick<DocumentDto, "status">,
  version: Pick<DocumentVersionDto, "status">,
): boolean {
  if (document.status === "archived" || document.status === "cancelled" || document.status === "signed") {
    return true;
  }
  return version.status !== "draft";
}

export function documentVersionToEditorState(input: {
  document: DocumentDto;
  version: DocumentVersionDto;
  blocks: DocumentBlockDto[];
}): EditorState {
  const isReadOnly = isDocumentEditorReadOnly(input.document, input.version);

  const document: EditorDocument = {
    id: input.document.id,
    title: input.document.title,
    status: input.document.status,
    clientId: input.document.client_id,
    projectId: input.document.project_id,
    currency: input.document.currency,
    referenceNumber: input.document.reference_number,
    versionId: input.version.id,
    versionNumber: input.version.version_number,
    versionStatus: input.version.status,
    versionPublishedAt: input.version.published_at,
    versionCreatedAt: input.version.created_at ?? "",
    isReadOnly,
  };

  const blocks: EditorBlock[] = [...input.blocks]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((block, index) => ({
      clientId: block.id,
      serverId: block.id,
      blockType: block.block_type,
      sortOrder: block.sort_order ?? index + 1,
      content: { ...(block.content ?? {}) },
      settings: { ...(block.settings ?? {}) },
      collapsed: false,
    }));

  return { document, blocks };
}

export function editorStateToDocumentBlocksPayload(state: EditorState): DocumentBlockSavePayload[] {
  return state.blocks.map((block, index) => ({
    sortOrder: index + 1,
    blockType: block.blockType,
    content: block.content,
    settings: block.settings,
  }));
}

export function createEmptyEditorSnapshotKey(): string {
  return createSnapshotKey([]);
}

export { createSnapshotKey };
