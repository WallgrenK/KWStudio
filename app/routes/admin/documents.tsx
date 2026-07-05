import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AdminShell } from "~/components/admin/AdminShell";
import { AdminTable, type AdminTableColumn } from "~/components/admin/AdminTable";
import { EmptyState } from "~/components/admin/EmptyState";
import { FilterBar } from "~/components/admin/FilterBar";
import { StatusBadge } from "~/components/admin/StatusBadge";
import { bootstrapAdminProfile, listAdminProjects, listPortalClients, listPortalServices } from "~/services/portalApi";
import { isDocumentsApiConfigured, listDocumentTypes, listDocuments } from "~/services/documentsApi";
import type { DocumentDto, DocumentTypeDto } from "~/types/documents";
import type { PortalClientDto } from "~/types/portal";
import type { AdminProjectListItemDto, PortalServiceDto } from "~/types/workflow";

type EnrichedDocument = DocumentDto & {
  clientName: string;
  projectTitle: string;
  serviceName: string;
  typeName: string;
  versionLabel: string;
};

type SortKey = "updated_at" | "created_at" | "title" | "status";

const PAGE_SIZE = 20;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [clients, setClients] = useState<PortalClientDto[]>([]);
  const [projects, setProjects] = useState<AdminProjectListItemDto[]>([]);
  const [services, setServices] = useState<PortalServiceDto[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [updatedFrom, setUpdatedFrom] = useState("");
  const [updatedTo, setUpdatedTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isDocumentsApiConfigured) {
      setError("API not configured.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      const [documentsResult, clientsResult, projectsResult, servicesResult, typesResult] = await Promise.all([
        listDocuments({
          ...(clientFilter ? { clientId: clientFilter } : {}),
          ...(projectFilter ? { projectId: projectFilter } : {}),
          ...(typeFilter ? { documentTypeId: typeFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
        }),
        listPortalClients(),
        listAdminProjects(),
        listPortalServices(),
        listDocumentTypes(),
      ]);

      if (!documentsResult.ok && documentsResult.status === 403) {
        const bootstrap = await bootstrapAdminProfile();
        if (bootstrap.ok) {
          const retry = await listDocuments({
            ...(clientFilter ? { clientId: clientFilter } : {}),
            ...(projectFilter ? { projectId: projectFilter } : {}),
            ...(typeFilter ? { documentTypeId: typeFilter } : {}),
            ...(statusFilter ? { status: statusFilter } : {}),
          });
          if (retry.ok && retry.data?.documents) setDocuments(retry.data.documents);
          else setError(retry.error ?? "Could not load documents.");
        } else {
          setError(bootstrap.error ?? documentsResult.error ?? "Admin access required.");
        }
      } else if (documentsResult.ok && documentsResult.data?.documents) {
        setDocuments(documentsResult.data.documents);
      } else {
        setError(documentsResult.error ?? "Could not load documents.");
      }

      if (clientsResult.ok && clientsResult.data?.clients) setClients(clientsResult.data.clients);
      if (projectsResult.ok && projectsResult.data?.projects) setProjects(projectsResult.data.projects);
      if (servicesResult.ok && servicesResult.data?.services) setServices(servicesResult.data.services);
      if (typesResult.ok && typesResult.data?.documentTypes) setDocumentTypes(typesResult.data.documentTypes);

      setLoading(false);
    }

    void load();
  }, [clientFilter, projectFilter, statusFilter, typeFilter]);

  const enrichedDocuments = useMemo<EnrichedDocument[]>(() => {
    return documents.map((document) => {
      const client = clients.find((item) => item.id === document.client_id);
      const project = projects.find((item) => item.id === document.project_id);
      const service = services.find((item) => item.id === document.service_id);
      const type = documentTypes.find((item) => item.id === document.document_type_id);
      return {
        ...document,
        clientName: client?.company_name ?? "—",
        projectTitle: project?.title ?? "—",
        serviceName: service?.name ?? "—",
        typeName: type?.name ?? "—",
        versionLabel: document.active_version_id ? "Active" : "—",
      };
    });
  }, [clients, documentTypes, documents, projects, services]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrichedDocuments.filter((document) => {
      if (serviceFilter && document.service_id !== serviceFilter) return false;
      if (query) {
        const haystack = [
          document.title,
          document.reference_number ?? "",
          document.clientName,
          document.projectTitle,
          document.typeName,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (createdFrom && document.created_at.slice(0, 10) < createdFrom) return false;
      if (createdTo && document.created_at.slice(0, 10) > createdTo) return false;
      if (updatedFrom && document.updated_at.slice(0, 10) < updatedFrom) return false;
      if (updatedTo && document.updated_at.slice(0, 10) > updatedTo) return false;
      return true;
    });
  }, [createdFrom, createdTo, enrichedDocuments, search, serviceFilter, updatedFrom, updatedTo]);

  const sortedDocuments = useMemo(() => {
    const sorted = [...filteredDocuments];
    sorted.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (typeof left === "string" && typeof right === "string") {
        return sortDirection === "asc" ? left.localeCompare(right) : right.localeCompare(left);
      }
      return 0;
    });
    return sorted;
  }, [filteredDocuments, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedDocuments.length / PAGE_SIZE));
  const paginatedDocuments = sortedDocuments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, clientFilter, projectFilter, serviceFilter, createdFrom, createdTo, updatedFrom, updatedTo]);

  const columns: Array<AdminTableColumn<EnrichedDocument>> = [
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "title",
      header: "Document",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.title}</p>
          {row.reference_number ? <p className="text-xs text-gray-400">{row.reference_number}</p> : null}
        </div>
      ),
    },
    { key: "type", header: "Type", render: (row) => row.typeName },
    { key: "client", header: "Client", render: (row) => row.clientName },
    { key: "project", header: "Project", render: (row) => row.projectTitle },
    { key: "service", header: "Service", render: (row) => row.serviceName },
    { key: "version", header: "Version", render: (row) => row.versionLabel },
    { key: "updated", header: "Updated", render: (row) => formatDate(row.updated_at) },
    { key: "created", header: "Created", render: (row) => formatDate(row.created_at) },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <Link
          className="text-sm font-medium text-[#2E75BD] hover:underline"
          to={`/admin/documents/${row.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          Open
        </Link>
      ),
    },
  ];

  return (
    <AdminShell
      title="Documents"
      description="Browse proposals, contracts, and other generated client documents."
      action={(
        <Link className="btn btn-primary" to="/admin/documents/new">
          New document
        </Link>
      )}
    >
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search title, reference, client, project…"
        filters={[
          {
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All statuses", value: "" },
              { label: "Draft", value: "draft" },
              { label: "Generated", value: "generated" },
              { label: "Sent", value: "sent" },
              { label: "Archived", value: "archived" },
              { label: "Cancelled", value: "cancelled" },
            ],
          },
          {
            label: "Type",
            value: typeFilter,
            onChange: setTypeFilter,
            options: [{ label: "All types", value: "" }, ...documentTypes.map((type) => ({ label: type.name, value: type.id }))],
          },
          {
            label: "Client",
            value: clientFilter,
            onChange: setClientFilter,
            options: [{ label: "All clients", value: "" }, ...clients.map((client) => ({ label: client.company_name, value: client.id }))],
          },
          {
            label: "Project",
            value: projectFilter,
            onChange: setProjectFilter,
            options: [{ label: "All projects", value: "" }, ...projects.map((project) => ({ label: project.title, value: project.id }))],
          },
          {
            label: "Service",
            value: serviceFilter,
            onChange: setServiceFilter,
            options: [{ label: "All services", value: "" }, ...services.map((service) => ({ label: service.name, value: service.id }))],
          },
        ]}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Created from
          <input type="date" className="h-11 rounded-lg border border-gray-200 px-3 text-sm" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Created to
          <input type="date" className="h-11 rounded-lg border border-gray-200 px-3 text-sm" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Updated from
          <input type="date" className="h-11 rounded-lg border border-gray-200 px-3 text-sm" value={updatedFrom} onChange={(e) => setUpdatedFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Updated to
          <input type="date" className="h-11 rounded-lg border border-gray-200 px-3 text-sm" value={updatedTo} onChange={(e) => setUpdatedTo(e.target.value)} />
        </label>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <label className="flex items-center gap-2">
          Sort by
          <select className="h-10 rounded-lg border border-gray-200 px-3" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="updated_at">Updated</option>
            <option value="created_at">Created</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Direction
          <select className="h-10 rounded-lg border border-gray-200 px-3" value={sortDirection} onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <span>{sortedDocuments.length} document(s)</span>
      </div>

      {loading ? <p className="text-sm text-gray-500">Loading documents…</p> : null}
      {error ? <EmptyState title="Could not load documents" description={error} /> : null}

      {!loading && !error && sortedDocuments.length === 0 ? (
        <EmptyState
          title="No documents yet."
          description="Create your first document from a service template."
          action={(
            <Link className="btn btn-primary" to="/admin/documents/new">
              New document
            </Link>
          )}
        />
      ) : null}

      {!loading && paginatedDocuments.length > 0 ? (
        <>
          <AdminTable
            columns={columns}
            rows={paginatedDocuments}
            getRowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/documents/${row.id}`)}
          />
          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button type="button" className="btn border border-gray-200 bg-white" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                  Previous
                </button>
                <button type="button" className="btn border border-gray-200 bg-white" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </AdminShell>
  );
}
