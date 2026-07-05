import { supabase } from "~/lib/supabase";
import { isPortalApiConfigured } from "~/services/portalApi";
import type {
  AssetCommentDto,
  AssetDto,
  AssetFolderDto,
  AssetRequestDto,
  AssetVersionDto,
  GlobalAssetListItem,
} from "~/types/assets";

export { isPortalApiConfigured as isAssetsApiConfigured };

type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
};

const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL;

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function requestAssetsApi<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
): Promise<ApiResult<T>> {
  if (!apiUrl) return { ok: false, error: "API not configured." };

  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Authentication required." };

  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  const init: RequestInit = { method, headers };
  if (method !== "GET" && options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, init);
    const data = await response.json().catch(() => null) as T | { error?: string } | null;
    if (!response.ok) {
      return {
        ok: false,
        error: (data && typeof data === "object" && "error" in data && typeof data.error === "string")
          ? data.error
          : `Request failed (${response.status})`,
        status: response.status,
      };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error." };
  }
}

async function uploadAssetFile<T>(
  path: string,
  formData: FormData,
  method: "POST" = "POST",
): Promise<ApiResult<T>> {
  if (!apiUrl) return { ok: false, error: "API not configured." };

  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Authentication required." };

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json().catch(() => null) as T | { error?: string } | null;
    if (!response.ok) {
      return {
        ok: false,
        error: (data && typeof data === "object" && "error" in data && typeof data.error === "string")
          ? data.error
          : `Upload failed (${response.status})`,
        status: response.status,
      };
    }
    return { ok: true, data: data as T };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error." };
  }
}

export function listPortalProjectAssets(projectId: string, folderId?: string) {
  const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
  return requestAssetsApi<{ ok: true; assets: AssetDto[] }>(
    `/portal/projects/${projectId}/assets${query}`,
  );
}

export function listPortalProjectAssetFolders(projectId: string) {
  return requestAssetsApi<{ ok: true; folders: AssetFolderDto[]; requests: AssetRequestDto[] }>(
    `/portal/projects/${projectId}/assets/folders`,
  );
}

export function uploadPortalProjectAsset(
  projectId: string,
  input: { folderId: string; file: File; title?: string; description?: string; requestId?: string },
) {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("folderId", input.folderId);
  if (input.title) formData.append("title", input.title);
  if (input.description) formData.append("description", input.description);
  if (input.requestId) formData.append("requestId", input.requestId);
  return uploadAssetFile<{ ok: true; asset: AssetDto }>(
    `/portal/projects/${projectId}/assets/upload`,
    formData,
  );
}

export function replacePortalProjectAsset(
  projectId: string,
  assetId: string,
  input: { file: File; changeNote?: string },
) {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.changeNote) formData.append("changeNote", input.changeNote);
  return uploadAssetFile<{ ok: true; asset: AssetDto }>(
    `/portal/projects/${projectId}/assets/${assetId}/replace`,
    formData,
  );
}

export function listPortalAssetComments(projectId: string, assetId: string) {
  return requestAssetsApi<{ ok: true; comments: AssetCommentDto[] }>(
    `/portal/projects/${projectId}/assets/${assetId}/comments`,
  );
}

export function addPortalAssetComment(projectId: string, assetId: string, body: string) {
  return requestAssetsApi<{ ok: true; comment: AssetCommentDto }>(
    `/portal/projects/${projectId}/assets/${assetId}/comments`,
    { method: "POST", body: { body } },
  );
}

export function listPortalAssetHistory(projectId: string, assetId: string) {
  return requestAssetsApi<{ ok: true; versions: AssetVersionDto[] }>(
    `/portal/projects/${projectId}/assets/${assetId}/history`,
  );
}

export async function downloadPortalAsset(projectId: string, assetId: string, fileName: string) {
  if (!apiUrl) return { ok: false as const, error: "API not configured." };
  const token = await getAccessToken();
  if (!token) return { ok: false as const, error: "Authentication required." };

  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/portal/projects/${projectId}/assets/${assetId}/download`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string } | null;
    return { ok: false as const, error: data?.error ?? "Download failed." };
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  return { ok: true as const };
}

export function listAdminProjectAssets(projectId: string, folderId?: string) {
  const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : "";
  return requestAssetsApi<{ ok: true; assets: AssetDto[] }>(
    `/portal/admin/projects/${projectId}/assets${query}`,
  );
}

export function listAdminProjectAssetFolders(projectId: string) {
  return requestAssetsApi<{ ok: true; folders: AssetFolderDto[]; requests: AssetRequestDto[] }>(
    `/portal/admin/projects/${projectId}/assets/folders`,
  );
}

export function listAdminGlobalAssets(limit = 100) {
  return requestAssetsApi<{ ok: true; assets: GlobalAssetListItem[] }>(
    `/portal/admin/assets?limit=${limit}`,
  );
}

export function uploadAdminProjectAsset(
  projectId: string,
  input: { folderId: string; file: File; title?: string; description?: string; requestId?: string },
) {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("folderId", input.folderId);
  if (input.title) formData.append("title", input.title);
  if (input.description) formData.append("description", input.description);
  if (input.requestId) formData.append("requestId", input.requestId);
  return uploadAssetFile<{ ok: true; asset: AssetDto }>(
    `/portal/admin/projects/${projectId}/assets/upload`,
    formData,
  );
}

export function replaceAdminProjectAsset(
  projectId: string,
  assetId: string,
  input: { file: File; changeNote?: string },
) {
  const formData = new FormData();
  formData.append("file", input.file);
  if (input.changeNote) formData.append("changeNote", input.changeNote);
  return uploadAssetFile<{ ok: true; asset: AssetDto }>(
    `/portal/admin/projects/${projectId}/assets/${assetId}/replace`,
    formData,
  );
}

export function renameAdminProjectAsset(projectId: string, assetId: string, title: string) {
  return requestAssetsApi<{ ok: true; asset: AssetDto }>(
    `/portal/admin/projects/${projectId}/assets/${assetId}/rename`,
    { method: "PATCH", body: { title } },
  );
}

export function moveAdminProjectAsset(projectId: string, assetId: string, folderId: string) {
  return requestAssetsApi<{ ok: true; asset: AssetDto }>(
    `/portal/admin/projects/${projectId}/assets/${assetId}/move`,
    { method: "PATCH", body: { folderId } },
  );
}

export function archiveAdminProjectAsset(projectId: string, assetId: string) {
  return requestAssetsApi<{ ok: true; asset: AssetDto }>(
    `/portal/admin/projects/${projectId}/assets/${assetId}/archive`,
    { method: "POST" },
  );
}

export function deleteAdminProjectAsset(projectId: string, assetId: string) {
  return requestAssetsApi<{ ok: true; asset: AssetDto }>(
    `/portal/admin/projects/${projectId}/assets/${assetId}`,
    { method: "DELETE" },
  );
}

export function listAdminAssetComments(projectId: string, assetId: string) {
  return requestAssetsApi<{ ok: true; comments: AssetCommentDto[] }>(
    `/portal/admin/projects/${projectId}/assets/${assetId}/comments`,
  );
}

export function addAdminAssetComment(projectId: string, assetId: string, body: string) {
  return requestAssetsApi<{ ok: true; comment: AssetCommentDto }>(
    `/portal/admin/projects/${projectId}/assets/${assetId}/comments`,
    { method: "POST", body: { body } },
  );
}

export function listAdminAssetHistory(projectId: string, assetId: string) {
  return requestAssetsApi<{ ok: true; versions: AssetVersionDto[] }>(
    `/portal/admin/projects/${projectId}/assets/${assetId}/history`,
  );
}

export async function downloadAdminAsset(projectId: string, assetId: string, fileName: string) {
  if (!apiUrl) return { ok: false as const, error: "API not configured." };
  const token = await getAccessToken();
  if (!token) return { ok: false as const, error: "Authentication required." };

  const response = await fetch(
    `${apiUrl.replace(/\/$/, "")}/portal/admin/projects/${projectId}/assets/${assetId}/download`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) {
    const data = await response.json().catch(() => null) as { error?: string } | null;
    return { ok: false as const, error: data?.error ?? "Download failed." };
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  return { ok: true as const };
}

export function formatAssetSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
