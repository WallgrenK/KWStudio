import { useCallback, useEffect, useMemo, useState } from "react";
import {
  attachAdminAssetToMessage,
  attachPortalAssetToMessage,
  getAdminConversation,
  getPortalConversation,
  isConversationsApiConfigured,
  listAdminProjectConversations,
  listPortalProjectConversations,
  markAdminConversationRead,
  markPortalConversationRead,
  sendAdminMessage,
  sendPortalMessage,
} from "~/services/conversationsApi";
import {
  listAdminProjectAssets,
  listPortalProjectAssets,
} from "~/services/assetsApi";
import type { AssetDto } from "~/types/assets";
import type { ConversationDetailDto, ConversationDto } from "~/types/conversations";
import { ConversationComposer } from "./ConversationComposer";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";

type ProjectConversationsBrowserProps = {
  projectId: string;
  mode: "admin" | "portal";
  showProjectTitleInList?: boolean;
  initialConversationId?: string | null;
  onConversationChange?: (conversationId: string | null) => void;
};

export function ProjectConversationsBrowser({
  projectId,
  mode,
  showProjectTitleInList = false,
  initialConversationId = null,
  onConversationChange,
}: ProjectConversationsBrowserProps) {
  const isAdmin = mode === "admin";

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [detail, setDetail] = useState<ConversationDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachMessageId, setAttachMessageId] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const loadConversations = useCallback(async () => {
    const result = isAdmin
      ? await listAdminProjectConversations(projectId)
      : await listPortalProjectConversations(projectId);

    if (result.ok && result.data) {
      setConversations(result.data.conversations);
      setSelectedId((current) => {
        if (current && result.data!.conversations.some((item) => item.id === current)) return current;
        return result.data!.conversations[0]?.id ?? null;
      });
    } else {
      setError(result.error ?? "Could not load conversations.");
    }
  }, [isAdmin, projectId]);

  const loadDetail = useCallback(async (conversationId: string) => {
    const result = isAdmin
      ? await getAdminConversation(conversationId)
      : await getPortalConversation(conversationId);

    if (result.ok && result.data) {
      setDetail(result.data.conversation);
      void (isAdmin
        ? markAdminConversationRead(conversationId)
        : markPortalConversationRead(conversationId));
    } else {
      setError(result.error ?? "Could not load conversation.");
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isConversationsApiConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void loadConversations().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      onConversationChange?.(null);
      return;
    }

    onConversationChange?.(selectedId);
    void loadDetail(selectedId);
  }, [loadDetail, onConversationChange, selectedId]);

  async function handleSend(body: string) {
    if (!selectedId) return;
    setBusy(true);
    setError(null);

    const result = isAdmin
      ? await sendAdminMessage(selectedId, body)
      : await sendPortalMessage(selectedId, body);

    if (result.ok && result.data) {
      setDetail(result.data.conversation);
      await loadConversations();
    } else {
      setError(result.error ?? "Could not send message.");
      throw new Error(result.error ?? "Could not send message.");
    }

    setBusy(false);
  }

  async function openAttachmentPicker(messageId: string) {
    setAttachMessageId(messageId);
    setAssetsLoading(true);
    setAssets([]);

    const result = isAdmin
      ? await listAdminProjectAssets(projectId)
      : await listPortalProjectAssets(projectId);

    if (result.ok && result.data) {
      setAssets(result.data.assets);
    } else {
      setError(result.error ?? "Could not load assets.");
    }
    setAssetsLoading(false);
  }

  async function handleAttachAsset(assetId: string) {
    if (!selectedId || !attachMessageId) return;
    setBusy(true);

    const result = isAdmin
      ? await attachAdminAssetToMessage(selectedId, attachMessageId, assetId)
      : await attachPortalAssetToMessage(selectedId, attachMessageId, assetId);

    if (result.ok && result.data) {
      setDetail(result.data.conversation);
      setAttachMessageId(null);
    } else {
      setError(result.error ?? "Could not attach asset.");
    }

    setBusy(false);
  }

  if (!isConversationsApiConfigured) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Conversations API is not configured.
      </div>
    );
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-500">Loading conversations…</div>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          showProjectTitle={showProjectTitleInList}
        />

        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedConversation?.displayTitle ?? "Select a conversation"}
            </h3>
            {selectedConversation ? (
              <p className="text-xs text-gray-500 capitalize">
                {selectedConversation.conversationType.replace(/_/g, " ")}
              </p>
            ) : null}
          </div>

          <ConversationThread
            messages={detail?.messages ?? []}
            mode={mode}
            onAttachAsset={selectedId ? openAttachmentPicker : undefined}
          />

          {selectedId ? (
            <ConversationComposer disabled={!selectedId} busy={busy} onSend={handleSend} />
          ) : null}
        </div>
      </div>

      {attachMessageId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-900">Attach asset</h4>
              <button
                type="button"
                onClick={() => setAttachMessageId(null)}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {assetsLoading ? (
                <p className="text-sm text-gray-500">Loading assets…</p>
              ) : assets.length ? (
                <ul className="divide-y divide-gray-100">
                  {assets.map((asset) => (
                    <li key={asset.id}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleAttachAsset(asset.id)}
                        className="flex w-full items-center justify-between px-2 py-3 text-left hover:bg-gray-50"
                      >
                        <span className="text-sm font-medium text-gray-900">{asset.title}</span>
                        <span className="text-xs text-gray-500">{asset.assetType}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No assets available for this project.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
