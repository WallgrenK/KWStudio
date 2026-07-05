import { useCallback, useMemo, useState, type ReactNode } from "react";
import type {
  DocumentBlockTypeMetadataDto,
  DocumentDto,
  DocumentVariableDefinitionDto,
  DocumentVersionDto,
} from "~/types/documents";
import type { EditorBlock, EditorRightTab, EditorSelection, EditorState } from "~/types/documentEditor";
import {
  createDocumentDraftVersion,
  createDocumentNewVersion,
  discardDocumentDraftVersion,
  forceRenderDocumentVersion,
  getDocumentVersion,
  listDocumentVersions,
  publishDocumentVersion,
  saveDocumentDraftBlocks,
  validateDocumentVersionApi,
} from "~/services/documentsApi";
import { DocumentEditorContext } from "./DocumentEditorContext";
import { editorPluginRegistry } from "./plugins/registry";
import { createEditorClientId } from "./plugins/shared";
import {
  computeEditorSnapshotKey,
  documentVersionToEditorState,
  editorStateToDocumentBlocksPayload,
} from "./serialization";

type DocumentEditorProviderProps = {
  documentId: string;
  document: DocumentDto;
  initialVersionId: string;
  initialEditorState: EditorState;
  versions: DocumentVersionDto[];
  blockTypeMetadata: Record<string, DocumentBlockTypeMetadataDto>;
  variables: DocumentVariableDefinitionDto[];
  onDocumentUpdated: (document: DocumentDto, versions: DocumentVersionDto[]) => void;
  children: ReactNode;
};

function reindexBlocks(blocks: EditorBlock[]): EditorBlock[] {
  return blocks.map((block, index) => ({ ...block, sortOrder: index + 1 }));
}

function runClientValidation(state: EditorState): Record<string, string[]> {
  const clientErrors: Record<string, string[]> = {};
  state.blocks.forEach((block) => {
    const plugin = editorPluginRegistry.get(block.blockType);
    if (!plugin) return;
    const errors = plugin.validateClientSide(block);
    if (errors.length) clientErrors[block.clientId] = errors;
  });
  return clientErrors;
}

export function DocumentEditorProvider({
  documentId,
  document,
  initialVersionId,
  initialEditorState,
  versions: initialVersions,
  blockTypeMetadata,
  variables,
  onDocumentUpdated,
  children,
}: DocumentEditorProviderProps) {
  const [documentDto, setDocumentDto] = useState(document);
  const [versions, setVersions] = useState(initialVersions);
  const [editorState, setEditorState] = useState<EditorState>(initialEditorState);
  const [selection, setSelection] = useState<EditorSelection>({
    selectedBlockClientId: initialEditorState.blocks[0]?.clientId ?? null,
    hoveredBlockClientId: null,
    focusedField: null,
  });
  const [dirtyState, setDirtyState] = useState({
    isDirty: false,
    lastSavedAt: null as string | null,
    savedSnapshotKey: computeEditorSnapshotKey(initialEditorState),
  });
  const [validationState, setValidationState] = useState({
    clientErrors: {} as Record<string, string[]>,
    serverErrors: [] as string[],
    serverWarnings: [] as string[],
    serverOk: null as boolean | null,
  });
  const [clipboardBlock, setClipboardBlock] = useState<EditorBlock | null>(null);
  const [rightTab, setRightTab] = useState<EditorRightTab>("properties");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isReadOnly = editorState.document.isReadOnly;

  const applyEditorState = useCallback((nextState: EditorState, savedAt: string | null = null) => {
    const snapshotKey = computeEditorSnapshotKey(nextState);
    setEditorState(nextState);
    setDirtyState({
      isDirty: false,
      lastSavedAt: savedAt,
      savedSnapshotKey: snapshotKey,
    });
    setValidationState({
      clientErrors: runClientValidation(nextState),
      serverErrors: [],
      serverWarnings: [],
      serverOk: null,
    });
    setSelection((current) => ({
      ...current,
      selectedBlockClientId:
        nextState.blocks.find((block) => block.clientId === current.selectedBlockClientId)?.clientId ??
        nextState.blocks[0]?.clientId ??
        null,
    }));
  }, []);

  const markDirty = useCallback(
    (updater: (current: EditorState) => EditorState) => {
      setEditorState((current) => {
        const next = updater(current);
        const nextKey = computeEditorSnapshotKey(next);
        setDirtyState((dirty) => ({
          ...dirty,
          isDirty: nextKey !== dirty.savedSnapshotKey,
        }));
        setValidationState((validation) => ({
          ...validation,
          clientErrors: runClientValidation(next),
          serverOk: null,
        }));
        return next;
      });
    },
    [],
  );

  const reloadVersions = useCallback(async () => {
    const result = await listDocumentVersions(documentId);
    if (result.ok && result.data?.versions) {
      setVersions(result.data.versions);
      onDocumentUpdated(documentDto, result.data.versions);
    }
  }, [documentDto, documentId, onDocumentUpdated]);

  const loadVersion = useCallback(
    async (versionId: string) => {
      setActionLoading("load-version");
      setActionMessage(null);
      const result = await getDocumentVersion(documentId, versionId);
      setActionLoading(null);
      if (!result.ok || !result.data) {
        setActionMessage(result.error ?? "Could not load version.");
        return;
      }
      const nextState = documentVersionToEditorState({
        document: documentDto,
        version: result.data.version,
        blocks: result.data.blocks,
      });
      applyEditorState(nextState);
      setPreviewHtml(null);
      setPreviewError(null);
      setPreviewWarnings([]);
    },
    [applyEditorState, documentDto, documentId],
  );

  const selectBlock = useCallback((clientId: string | null) => {
    setSelection((current) => ({ ...current, selectedBlockClientId: clientId }));
    setRightTab("properties");
  }, []);

  const hoverBlock = useCallback((clientId: string | null) => {
    setSelection((current) => ({ ...current, hoveredBlockClientId: clientId }));
  }, []);

  const setFocusedField = useCallback((focusedField: EditorSelection["focusedField"]) => {
    setSelection((current) => ({ ...current, focusedField }));
  }, []);

  const updateBlock = useCallback(
    (clientId: string, patch: Partial<Pick<EditorBlock, "content" | "settings" | "collapsed">>) => {
      if (isReadOnly) return;
      markDirty((current) => ({
        ...current,
        blocks: current.blocks.map((block) =>
          block.clientId === clientId
            ? {
                ...block,
                content: patch.content ?? block.content,
                settings: patch.settings ?? block.settings,
                collapsed: patch.collapsed ?? block.collapsed,
              }
            : block,
        ),
      }));
    },
    [isReadOnly, markDirty],
  );

  const insertBlock = useCallback(
    (blockType: EditorBlock["blockType"], position = editorState.blocks.length) => {
      if (isReadOnly) return;
      markDirty((current) => {
        const nextBlock = editorPluginRegistry.createDefault(blockType, position + 1);
        const blocks = [...current.blocks];
        blocks.splice(position, 0, nextBlock);
        const reindexed = reindexBlocks(blocks);
        setSelection((sel) => ({ ...sel, selectedBlockClientId: nextBlock.clientId }));
        setRightTab("properties");
        return { ...current, blocks: reindexed };
      });
    },
    [editorState.blocks.length, isReadOnly, markDirty],
  );

  const duplicateBlock = useCallback(
    (clientId: string) => {
      if (isReadOnly) return;
      markDirty((current) => {
        const index = current.blocks.findIndex((block) => block.clientId === clientId);
        if (index < 0) return current;
        const source = current.blocks[index];
        const copy: EditorBlock = {
          ...source,
          clientId: createEditorClientId(),
          serverId: null,
          content: { ...source.content },
          settings: { ...source.settings },
        };
        const blocks = [...current.blocks];
        blocks.splice(index + 1, 0, copy);
        setSelection((sel) => ({ ...sel, selectedBlockClientId: copy.clientId }));
        return { ...current, blocks: reindexBlocks(blocks) };
      });
    },
    [isReadOnly, markDirty],
  );

  const deleteBlock = useCallback(
    (clientId: string) => {
      if (isReadOnly) return;
      markDirty((current) => {
        const blocks = reindexBlocks(current.blocks.filter((block) => block.clientId !== clientId));
        setSelection((sel) => ({
          ...sel,
          selectedBlockClientId:
            sel.selectedBlockClientId === clientId ? blocks[0]?.clientId ?? null : sel.selectedBlockClientId,
        }));
        return { ...current, blocks };
      });
    },
    [isReadOnly, markDirty],
  );

  const moveBlock = useCallback(
    (clientId: string, direction: -1 | 1) => {
      if (isReadOnly) return;
      markDirty((current) => {
        const index = current.blocks.findIndex((block) => block.clientId === clientId);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= current.blocks.length) return current;
        const blocks = [...current.blocks];
        const [item] = blocks.splice(index, 1);
        blocks.splice(target, 0, item);
        return { ...current, blocks: reindexBlocks(blocks) };
      });
    },
    [isReadOnly, markDirty],
  );

  const moveBlockUp = useCallback((clientId: string) => moveBlock(clientId, -1), [moveBlock]);
  const moveBlockDown = useCallback((clientId: string) => moveBlock(clientId, 1), [moveBlock]);

  const toggleCollapse = useCallback(
    (clientId: string) => {
      markDirty((current) => ({
        ...current,
        blocks: current.blocks.map((block) =>
          block.clientId === clientId ? { ...block, collapsed: !block.collapsed } : block,
        ),
      }));
    },
    [markDirty],
  );

  const copyBlock = useCallback((clientId: string) => {
    const block = editorState.blocks.find((item) => item.clientId === clientId);
    if (!block) return;
    setClipboardBlock({
      ...block,
      clientId: createEditorClientId(),
      serverId: null,
      content: { ...block.content },
      settings: { ...block.settings },
    });
    setActionMessage("Block copied.");
  }, [editorState.blocks]);

  const pasteBlock = useCallback(
    (position = editorState.blocks.length) => {
      if (isReadOnly || !clipboardBlock) return;
      markDirty((current) => {
        const pasted: EditorBlock = {
          ...clipboardBlock,
          clientId: createEditorClientId(),
          serverId: null,
          content: { ...clipboardBlock.content },
          settings: { ...clipboardBlock.settings },
        };
        const blocks = [...current.blocks];
        blocks.splice(position, 0, pasted);
        setSelection((sel) => ({ ...sel, selectedBlockClientId: pasted.clientId }));
        return { ...current, blocks: reindexBlocks(blocks) };
      });
    },
    [clipboardBlock, editorState.blocks.length, isReadOnly, markDirty],
  );

  const saveDraft = useCallback(async () => {
    if (isReadOnly) return;
    setActionLoading("save");
    setActionMessage(null);
    const payload = editorStateToDocumentBlocksPayload(editorState);
    const result = await saveDocumentDraftBlocks(editorState.document.versionId, payload);
    setActionLoading(null);
    if (!result.ok || !result.data) {
      setActionMessage(result.error ?? "Could not save draft.");
      return;
    }
    const nextState = documentVersionToEditorState({
      document: documentDto,
      version: result.data.version,
      blocks: result.data.blocks,
    });
    applyEditorState(nextState, new Date().toISOString());
    setActionMessage("Draft saved.");
  }, [applyEditorState, documentDto, editorState, isReadOnly]);

  const discardChanges = useCallback(async () => {
    await loadVersion(editorState.document.versionId);
    setActionMessage("Changes discarded.");
  }, [editorState.document.versionId, loadVersion]);

  const discardDraftVersion = useCallback(async () => {
    if (isReadOnly) return;
    setActionLoading("discard-draft");
    setActionMessage(null);
    const result = await discardDocumentDraftVersion(documentId, editorState.document.versionId);
    setActionLoading(null);
    if (!result.ok || !result.data?.document) {
      setActionMessage(result.error ?? "Could not discard draft.");
      return;
    }
    setDocumentDto(result.data.document);
    if (result.data.activeVersion) {
      applyEditorState(
        documentVersionToEditorState({
          document: result.data.document,
          version: result.data.activeVersion,
          blocks: result.data.blocks,
        }),
      );
    } else {
      await loadVersion(editorState.document.versionId);
    }
    await reloadVersions();
    setActionMessage("Draft discarded.");
  }, [
    applyEditorState,
    documentId,
    editorState.document.versionId,
    isReadOnly,
    loadVersion,
    reloadVersions,
  ]);

  const validateClient = useCallback(() => {
    setValidationState((current) => ({
      ...current,
      clientErrors: runClientValidation(editorState),
    }));
  }, [editorState]);

  const validateServer = useCallback(async () => {
    setActionLoading("validate");
    const result = await validateDocumentVersionApi(documentId, editorState.document.versionId);
    setActionLoading(null);
    if (!result.ok || !result.data) {
      setActionMessage(result.error ?? "Validation failed.");
      return false;
    }
    const validation = result.data;
    setValidationState((current) => ({
      ...current,
      serverOk: validation.ok,
      serverErrors: validation.errors ?? [],
      serverWarnings: validation.warnings ?? [],
    }));
    return validation.ok;
  }, [documentId, editorState.document.versionId]);

  const publish = useCallback(async () => {
    if (isReadOnly) return;
    if (dirtyState.isDirty) {
      setActionMessage("Save draft before publishing.");
      return;
    }
    setActionLoading("publish");
    setActionMessage(null);
    const ok = await validateServer();
    if (!ok) {
      setActionLoading(null);
      setActionMessage("Fix validation errors before publishing.");
      setRightTab("properties");
      return;
    }
    const result = await publishDocumentVersion(editorState.document.versionId);
    setActionLoading(null);
    if (!result.ok || !result.data?.document || !result.data.activeVersion) {
      setActionMessage(result.error ?? "Publish failed.");
      return;
    }
    setDocumentDto(result.data.document);
    applyEditorState(
      documentVersionToEditorState({
        document: result.data.document,
        version: result.data.activeVersion,
        blocks: result.data.blocks,
      }),
    );
    await reloadVersions();
    setActionMessage("Document published.");
  }, [
    applyEditorState,
    dirtyState.isDirty,
    editorState.document.versionId,
    isReadOnly,
    reloadVersions,
    validateServer,
  ]);

  const refreshPreview = useCallback(async () => {
    if (dirtyState.isDirty) {
      setActionMessage("Save draft before refreshing preview.");
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    setActionLoading("preview");
    const result = await forceRenderDocumentVersion(documentId, editorState.document.versionId);
    setPreviewLoading(false);
    setActionLoading(null);
    if (result.ok && result.data?.html) {
      setPreviewHtml(result.data.html);
      setPreviewWarnings(result.data.warnings ?? []);
      setPreviewError(null);
      setRightTab("preview");
    } else {
      setPreviewHtml(null);
      setPreviewError(result.error ?? "Could not render preview.");
      setPreviewWarnings([]);
    }
  }, [dirtyState.isDirty, documentId, editorState.document.versionId]);

  const insertVariable = useCallback(
    (key: string) => {
      const marker = `{{${key}}}`;
      if (selection.focusedField?.insertText) {
        selection.focusedField.insertText(marker);
        return;
      }
      setActionMessage("Focus a text field to insert a variable.");
    },
    [selection.focusedField],
  );

  const createDraftVersion = useCallback(async () => {
    setActionLoading("create-draft");
    setActionMessage(null);
    const result = await createDocumentDraftVersion(documentId);
    setActionLoading(null);
    if (!result.ok || !result.data) {
      setActionMessage(result.error ?? "Could not create draft.");
      return;
    }
    await reloadVersions();
    await loadVersion(result.data.version.id);
    setActionMessage("Draft version created.");
  }, [documentId, loadVersion, reloadVersions]);

  const createNewVersion = useCallback(async () => {
    setActionLoading("new-version");
    setActionMessage(null);
    const result = await createDocumentNewVersion(documentId);
    setActionLoading(null);
    if (!result.ok || !result.data) {
      setActionMessage(result.error ?? "Could not create version.");
      return;
    }
    await reloadVersions();
    await loadVersion(result.data.version.id);
    setActionMessage("New version created.");
  }, [documentId, loadVersion, reloadVersions]);

  const value = useMemo(
    () => ({
      documentId,
      documentDto,
      versions,
      blockTypeMetadata,
      variables,
      editorState,
      selection,
      dirtyState,
      validationState,
      clipboardBlock,
      isReadOnly,
      rightTab,
      previewHtml,
      previewWarnings,
      previewLoading,
      previewError,
      actionLoading,
      actionMessage,
      loadVersion,
      selectBlock,
      hoverBlock,
      setFocusedField,
      setRightTab,
      updateBlock,
      insertBlock,
      duplicateBlock,
      deleteBlock,
      moveBlockUp,
      moveBlockDown,
      toggleCollapse,
      copyBlock,
      pasteBlock,
      saveDraft,
      discardChanges,
      discardDraftVersion,
      validateClient,
      validateServer,
      publish,
      refreshPreview,
      insertVariable,
      createDraftVersion,
      createNewVersion,
      reloadVersions,
    }),
    [
      actionLoading,
      actionMessage,
      blockTypeMetadata,
      clipboardBlock,
      createDraftVersion,
      createNewVersion,
      dirtyState,
      discardChanges,
      discardDraftVersion,
      documentDto,
      documentId,
      duplicateBlock,
      editorState,
      hoverBlock,
      insertBlock,
      insertVariable,
      isReadOnly,
      loadVersion,
      moveBlockDown,
      moveBlockUp,
      pasteBlock,
      previewError,
      previewHtml,
      previewLoading,
      previewWarnings,
      publish,
      refreshPreview,
      reloadVersions,
      rightTab,
      saveDraft,
      selectBlock,
      selection,
      setFocusedField,
      toggleCollapse,
      updateBlock,
      validateClient,
      validateServer,
      validationState,
      variables,
      versions,
      copyBlock,
      deleteBlock,
    ],
  );

  return <DocumentEditorContext.Provider value={value}>{children}</DocumentEditorContext.Provider>;
}
