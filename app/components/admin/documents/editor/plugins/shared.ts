import type { DocumentBlockType } from "~/types/documents";
import type { EditorBlock } from "~/types/documentEditor";

export function createEditorClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEditorBlock(
  blockType: DocumentBlockType,
  sortOrder: number,
  content: Record<string, unknown>,
  settings: Record<string, unknown> = {},
): EditorBlock {
  return {
    clientId: createEditorClientId(),
    serverId: null,
    blockType,
    sortOrder,
    content,
    settings,
    collapsed: false,
  };
}

export function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function readNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function truncateSummary(value: string, max = 72): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return "Empty";
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}
