import { supabase } from "~/lib/supabase";
import { isPortalApiConfigured } from "~/services/portalApi";

async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function downloadPortalBinary(
  path: string,
  fallbackFileName: string,
  method: "GET" | "POST" = "GET",
): Promise<{ ok: boolean; error?: string }> {
  if (!isPortalApiConfigured) {
    return { ok: false, error: "API not configured." };
  }

  const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL?.replace(/\/$/, "");
  if (!apiUrl) return { ok: false, error: "API not configured." };

  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Authentication required." };

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
      },
      ...(method === "POST" ? { body: "{}" } : {}),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: payload?.error ?? `Download failed (${response.status}).` };
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="([^"]+)"/);
    const fileName = match?.[1] ?? fallbackFileName;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = "noopener";
    anchor.click();
    URL.revokeObjectURL(url);

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Download failed." };
  }
}

export function downloadAdminDocumentPdf(documentId: string, versionId?: string) {
  const path = versionId
    ? `/portal/admin/documents/${documentId}/versions/${versionId}/pdf`
    : `/portal/admin/documents/${documentId}/pdf`;
  return downloadPortalBinary(path, "document.pdf");
}

export function regenerateAdminDocumentPdf(documentId: string, versionId: string) {
  return downloadPortalBinary(
    `/portal/admin/documents/${documentId}/versions/${versionId}/pdf/render`,
    "document.pdf",
    "POST",
  );
}

export function downloadPortalDocumentPdf(documentId: string) {
  return downloadPortalBinary(`/portal/documents/${documentId}/pdf`, "document.pdf");
}

export async function fetchPortalBinaryBlob(path: string): Promise<{ ok: boolean; blob?: Blob; error?: string }> {
  if (!isPortalApiConfigured) {
    return { ok: false, error: "API not configured." };
  }

  const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL?.replace(/\/$/, "");
  if (!apiUrl) return { ok: false, error: "API not configured." };

  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Authentication required." };

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      return { ok: false, error: payload?.error ?? `Request failed (${response.status}).` };
    }

    return { ok: true, blob: await response.blob() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Request failed." };
  }
}
