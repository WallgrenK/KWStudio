import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { EmptyState } from "~/components/admin/EmptyState";
import { DocumentEditorPageShell } from "~/components/admin/documents/editor/DocumentEditorPage";
import { DocumentEditorProvider } from "~/components/admin/documents/editor/DocumentEditorProvider";
import { documentVersionToEditorState, isDocumentEditorReadOnly } from "~/components/admin/documents/editor/serialization";
import {
  getDocument,
  getDocumentVersion,
  isDocumentsApiConfigured,
  listDocumentBlockTypes,
  listDocumentVariables,
  listDocumentVersions,
} from "~/services/documentsApi";
import type {
  DocumentBlockTypeMetadataDto,
  DocumentDto,
  DocumentVariableDefinitionDto,
  DocumentVersionDto,
} from "~/types/documents";
import type { EditorState } from "~/types/documentEditor";

export default function AdminDocumentEditorPage() {
  const { documentId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const requestedVersionId = searchParams.get("version");

  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [versions, setVersions] = useState<DocumentVersionDto[]>([]);
  const [blockTypes, setBlockTypes] = useState<DocumentBlockTypeMetadataDto[]>([]);
  const [variables, setVariables] = useState<DocumentVariableDefinitionDto[]>([]);
  const [editorBootstrap, setEditorBootstrap] = useState<{
    versionId: string;
    editorState: EditorState;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blockTypeMetadata = useMemo(
    () =>
      blockTypes.reduce<Record<string, DocumentBlockTypeMetadataDto>>((acc, item) => {
        acc[item.type] = item;
        return acc;
      }, {}),
    [blockTypes],
  );

  const loadEditor = useCallback(
    async (versionId: string, doc: DocumentDto) => {
      const versionResult = await getDocumentVersion(documentId, versionId);
      if (!versionResult.ok || !versionResult.data) {
        throw new Error(versionResult.error ?? "Could not load document version.");
      }
      setEditorBootstrap({
        versionId,
        editorState: documentVersionToEditorState({
          document: doc,
          version: versionResult.data.version,
          blocks: versionResult.data.blocks,
        }),
      });
    },
    [documentId],
  );

  const bootstrap = useCallback(async () => {
    if (!documentId || !isDocumentsApiConfigured) {
      setError("API not configured.");
      setLoading(false);
      return;
    }

    const [documentResult, versionsResult, blockTypesResult, variablesResult] = await Promise.all([
      getDocument(documentId),
      listDocumentVersions(documentId),
      listDocumentBlockTypes(),
      listDocumentVariables(),
    ]);

    if (!documentResult.ok || !documentResult.data?.document) {
      throw new Error(documentResult.error ?? "Document not found.");
    }

    const doc = documentResult.data.document;
    const versionList = versionsResult.ok && versionsResult.data?.versions ? versionsResult.data.versions : [];

    setDocument(doc);
    setVersions(versionList);
    setBlockTypes(blockTypesResult.ok && blockTypesResult.data?.blockTypes ? blockTypesResult.data.blockTypes : []);
    setVariables(variablesResult.ok && variablesResult.data?.variables ? variablesResult.data.variables : []);

    const draftVersion = versionList.find((version) => version.status === "draft");
    const targetVersionId =
      requestedVersionId ??
      draftVersion?.id ??
      documentResult.data.activeVersion?.id ??
      versionList[0]?.id ??
      null;

    if (!targetVersionId) {
      setEditorBootstrap(null);
      return;
    }

    await loadEditor(targetVersionId, doc);
  }, [documentId, loadEditor, requestedVersionId]);

  useEffect(() => {
    void bootstrap()
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load editor.");
      })
      .finally(() => setLoading(false));
  }, [bootstrap]);

  const handleDocumentUpdated = useCallback((nextDocument: DocumentDto, nextVersions: DocumentVersionDto[]) => {
    setDocument(nextDocument);
    setVersions(nextVersions);
  }, []);

  if (loading) {
    return (
      <AdminShell title="Document editor" description="Loading visual editor…">
        <p className="text-sm text-gray-500">Loading…</p>
      </AdminShell>
    );
  }

  if (error || !document) {
    return (
      <AdminShell title="Document editor" description="Visual document editor">
        <EmptyState title="Editor unavailable" description={error ?? "Document not found."} />
      </AdminShell>
    );
  }

  const draftVersion = versions.find((version) => version.status === "draft");
  const viewingPublished =
    editorBootstrap &&
    isDocumentEditorReadOnly(document, {
      status: editorBootstrap.editorState.document.versionStatus,
    }) &&
    editorBootstrap.editorState.document.versionStatus === "published";

  if (!editorBootstrap) {
    return (
      <AdminShell
        title={document.title}
        description="Visual document editor"
        action={(
          <Link className="btn border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD]" to={`/admin/documents/${documentId}`}>
            Back to detail
          </Link>
        )}
      >
        <EmptyState
          title="No version available"
          description="Create a draft or new version from the document detail page before editing."
        />
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={document.title}
      description="Visual document editor"
      action={(
        <Link className="btn border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD]" to={`/admin/documents/${documentId}`}>
          Back to detail
        </Link>
      )}
    >
      {!draftVersion && viewingPublished ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You are viewing a published version in read-only mode. Create a new version from the left panel to edit.
        </div>
      ) : null}

      <DocumentEditorProvider
        documentId={documentId}
        document={document}
        initialVersionId={editorBootstrap.versionId}
        initialEditorState={editorBootstrap.editorState}
        versions={versions}
        blockTypeMetadata={blockTypeMetadata}
        variables={variables}
        onDocumentUpdated={handleDocumentUpdated}
      >
        <DocumentEditorPageShell />
      </DocumentEditorProvider>
    </AdminShell>
  );
}
