export type AssetStatus = "active" | "archived" | "deleted";

export type AssetType =
  | "image"
  | "document"
  | "video"
  | "audio"
  | "archive"
  | "design"
  | "spreadsheet"
  | "presentation"
  | "code"
  | "other";

export type AssetVisibility = "client" | "internal";

export type AssetRequestStatus = "pending" | "completed" | "cancelled";

export type PreviewType = "image" | "pdf" | "video" | "download";

export type AssetFolderDto = {
  id: string;
  projectId: string;
  parentFolderId: string | null;
  name: string;
  slug: string;
  visibility: AssetVisibility;
  sortOrder: number;
  icon: string | null;
  color: string | null;
};

export type AssetVersionDto = {
  id: string;
  assetId: string;
  fileName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  checksumSha256: string;
  version: number;
  changeNote: string | null;
  thumbnailStoragePath: string | null;
  previewStoragePath: string | null;
  previewType: PreviewType | null;
  uploadedAt: string;
};

export type AssetDto = {
  id: string;
  projectId: string;
  folderId: string;
  folderSlug: string | null;
  folderName: string | null;
  uploadedByProfileId: string | null;
  uploadedByRole: "admin" | "client";
  title: string;
  description: string | null;
  assetType: AssetType;
  status: AssetStatus;
  visibility: AssetVisibility;
  metadata: Record<string, unknown>;
  aiMetadata: Record<string, unknown>;
  currentVersion: AssetVersionDto | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetCommentDto = {
  id: string;
  assetId: string;
  profileId: string | null;
  body: string;
  createdAt: string;
};

export type AssetRequestDto = {
  id: string;
  projectId: string;
  folderId: string;
  folderSlug: string | null;
  workflowActionId: string | null;
  assetId: string | null;
  title: string;
  description: string | null;
  required: boolean;
  status: AssetRequestStatus;
  createdAt: string;
  completedAt: string | null;
};

export type GlobalAssetListItem = AssetDto & {
  projectTitle: string | null;
  clientName: string | null;
};

export type AssetTagDto = {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  color: string | null;
  createdAt: string;
};
