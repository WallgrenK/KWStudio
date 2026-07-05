import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AdminTable, type AdminTableColumn } from "~/components/admin/AdminTable";
import { EmptyState } from "~/components/admin/EmptyState";
import { StatusBadge } from "~/components/admin/StatusBadge";
import { formatAssetSize, isAssetsApiConfigured, listAdminGlobalAssets } from "~/services/assetsApi";
import type { GlobalAssetListItem } from "~/types/assets";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminGlobalFilesPanel() {
  const [assets, setAssets] = useState<GlobalAssetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAssetsApiConfigured) {
      setLoading(false);
      setError("Assets API is not configured.");
      return;
    }

    let cancelled = false;
    void listAdminGlobalAssets(100).then((result) => {
      if (cancelled) return;
      if (result.ok && result.data) {
        setAssets(result.data.assets);
      } else {
        setError(result.error ?? "Could not load assets.");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const columns: Array<AdminTableColumn<GlobalAssetListItem>> = [
    {
      key: "client",
      header: "Client",
      render: (asset) => <span className="text-gray-800">{asset.clientName ?? "—"}</span>,
    },
    {
      key: "project",
      header: "Project",
      render: (asset) => (
        <Link to={`/admin/projects/${asset.projectId}`} className="font-medium text-gray-900 hover:underline">
          {asset.projectTitle ?? asset.projectId}
        </Link>
      ),
    },
    {
      key: "folder",
      header: "Folder",
      render: (asset) => asset.folderName ?? asset.folderSlug ?? "—",
    },
    {
      key: "title",
      header: "Asset",
      render: (asset) => <strong className="text-gray-800">{asset.title}</strong>,
    },
    {
      key: "type",
      header: "Type",
      render: (asset) => <span className="capitalize">{asset.assetType}</span>,
    },
    {
      key: "size",
      header: "Size",
      render: (asset) => (asset.currentVersion ? formatAssetSize(asset.currentVersion.sizeBytes) : "—"),
    },
    {
      key: "updated",
      header: "Updated",
      render: (asset) => formatDate(asset.updatedAt),
    },
    {
      key: "status",
      header: "Status",
      render: (asset) => <StatusBadge status={asset.status} />,
    },
  ];

  if (loading) return <p className="text-sm text-gray-500">Loading assets…</p>;
  if (error) return <EmptyState title="Could not load files" description={error} />;

  return (
    <AdminTable
      columns={columns}
      rows={assets}
      getRowKey={(asset) => asset.id}
      emptyMessage="No project assets uploaded yet."
    />
  );
}
