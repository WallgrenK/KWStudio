import { useCallback, useEffect, useState } from "react";
import { ConversationComposer } from "~/components/conversations/ConversationComposer";
import { ConversationList } from "~/components/conversations/ConversationList";
import { ConversationThread } from "~/components/conversations/ConversationThread";
import {
  attachAdminAssetToMessage,
  getAdminConversation,
  isConversationsApiConfigured,
  listAdminGlobalConversations,
  markAdminConversationRead,
  sendAdminMessage,
} from "~/services/conversationsApi";
import { listAdminProjectAssets } from "~/services/assetsApi";
import type { AssetDto } from "~/types/assets";
import type { ConversationDetailDto, ConversationDto } from "~/types/conversations";

export function AdminGlobalMessagesPanel() {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachMessageId, setAttachMessageId] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetDto[]>([]);

  const loadConversations = useCallback(async () => {
    const result = await listAdminGlobalConversations();
    if (result.ok && result.data) {
      setConversations(result.data.conversations);
      setSelectedId((current) => {
        if (current && result.data!.conversations.some((item) => item.id === current)) return current;
        return result.data!.conversations[0]?.id ?? null;
      });
    } else {
      setError(result.error ?? "Could not load messages.");
    }
  }, []);

  const loadDetail = useCallback(async (conversationId: string) => {
    const result = await getAdminConversation(conversationId);
    if (result.ok && result.data) {
      setDetail(result.data.conversation);
      await markAdminConversationRead(conversationId);
      await loadConversations();
    } else {
      setError(result.error ?? "Could not load conversation.");
    }
  }, [loadConversations]);

  useEffect(() => {
    if (!isConversationsApiConfigured) {
      setLoading(false);
      return;
    }

    void loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [loadDetail, selectedId]);

  async function handleSend(body: string) {
    if (!selectedId) return;
    setBusy(true);
    const result = await sendAdminMessage(selectedId, body);
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
    if (!detail) return;
    setAttachMessageId(messageId);
    const result = await listAdminProjectAssets(detail.projectId);
    if (result.ok && result.data) setAssets(result.data.assets);
  }

  async function handleAttachAsset(assetId: string) {
    if (!selectedId || !attachMessageId) return;
    setBusy(true);
    const result = await attachAdminAssetToMessage(selectedId, attachMessageId, assetId);
    if (result.ok && result.data) {
      setDetail(result.data.conversation);
      setAttachMessageId(null);
    } else {
      setError(result.error ?? "Could not attach asset.");
    }
    setBusy(false);
  }

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;

  if (!isConversationsApiConfigured) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Conversations API is not configured.
      </div>
    );
  }

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-500">Loading messages…</div>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          showProjectTitle
        />

        <div className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              {selected?.displayTitle ?? "Select a conversation"}
            </h3>
            {selected?.projectTitle ? (
              <p className="text-xs text-gray-500">{selected.projectTitle}</p>
            ) : null}
          </div>

          <ConversationThread
            messages={detail?.messages ?? []}
            mode="admin"
            onAttachAsset={selectedId ? openAttachmentPicker : undefined}
          />

          {selectedId ? (
            <ConversationComposer busy={busy} onSend={handleSend} />
          ) : null}
        </div>
      </div>

      {attachMessageId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-900">Attach asset</h4>
              <button type="button" onClick={() => setAttachMessageId(null)} className="text-sm text-gray-500">
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {assets.length ? (
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
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No assets available.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
