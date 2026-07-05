import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { EmptyState } from "~/components/admin/EmptyState";
import { FormCard } from "~/components/admin/FormCard";
import { bootstrapAdminProfile, listAdminProjects, listPortalClients, listPortalServices } from "~/services/portalApi";
import {
  createDocumentFromTemplate,
  isDocumentsApiConfigured,
  listDocumentTemplates,
  listDocumentTypes,
  listServiceDocumentDefaults,
} from "~/services/documentsApi";
import type { DocumentTemplateDto, DocumentTypeDto, ServiceDocumentDefaultDto } from "~/types/documents";
import type { PortalClientDto } from "~/types/portal";
import type { AdminProjectListItemDto, PortalServiceDto } from "~/types/workflow";

type TemplateOption = DocumentTemplateDto & { isDefaultForType: boolean };

export function DocumentCreateForm() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<PortalClientDto[]>([]);
  const [projects, setProjects] = useState<AdminProjectListItemDto[]>([]);
  const [services, setServices] = useState<PortalServiceDto[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [defaults, setDefaults] = useState<ServiceDocumentDefaultDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");

  const clientProjects = useMemo(
    () => projects.filter((project) => project.client_id === clientId),
    [clientId, projects],
  );

  const selectedType = useMemo(
    () => documentTypes.find((type) => type.id === documentTypeId) ?? null,
    [documentTypeId, documentTypes],
  );

  const visibleTemplates = useMemo(() => {
    const filtered = templates.filter(
      (template) =>
        template.document_type_id === documentTypeId &&
        (!serviceId || template.service_id === serviceId || template.service_id === null),
    );
    return filtered.sort((a, b) => Number(b.isDefaultForType) - Number(a.isDefaultForType));
  }, [documentTypeId, serviceId, templates]);

  useEffect(() => {
    if (!isDocumentsApiConfigured) {
      setLoadError("API not configured. Set VITE_KWSTUDIO_API_URL.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setLoadError(null);

      const [clientsResult, projectsResult, servicesResult, typesResult] = await Promise.all([
        listPortalClients(),
        listAdminProjects(),
        listPortalServices(),
        listDocumentTypes(),
      ]);

      if (!clientsResult.ok && clientsResult.status === 403) {
        const bootstrap = await bootstrapAdminProfile();
        if (!bootstrap.ok) {
          setLoadError(bootstrap.error ?? "Admin access required.");
          setLoading(false);
          return;
        }
      }

      if (clientsResult.ok && clientsResult.data?.clients) setClients(clientsResult.data.clients);
      if (projectsResult.ok && projectsResult.data?.projects) setProjects(projectsResult.data.projects);
      if (servicesResult.ok && servicesResult.data?.services) {
        const active = servicesResult.data.services.filter((service) => service.is_active);
        setServices(active);
        setServiceId((current) => current || active.find((service) => service.slug === "website")?.id || active[0]?.id || "");
      }
      if (typesResult.ok && typesResult.data?.documentTypes) {
        setDocumentTypes(typesResult.data.documentTypes);
        setDocumentTypeId((current) => current || typesResult.data!.documentTypes[0]?.id || "");
      }

      if (!clientsResult.ok && clientsResult.status !== 403) {
        setLoadError(clientsResult.error ?? "Could not load clients.");
      } else if (!typesResult.ok) {
        setLoadError(typesResult.error ?? "Could not load document types.");
      }

      setLoading(false);
    }

    void load();
  }, []);

  useEffect(() => {
    if (!clientId && clients[0]?.id) setClientId(clients[0].id);
  }, [clientId, clients]);

  useEffect(() => {
    if (!serviceId) return;

    async function loadTemplates() {
      const [templatesResult, defaultsResult] = await Promise.all([
        listDocumentTemplates({ serviceId }),
        listServiceDocumentDefaults(serviceId),
      ]);

      if (templatesResult.ok && templatesResult.data?.templates) {
        const serviceDefaults = defaultsResult.ok ? defaultsResult.data?.defaults ?? [] : [];
        setDefaults(serviceDefaults);
        setTemplates(
          templatesResult.data.templates.map((template) => ({
            ...template,
            isDefaultForType: serviceDefaults.some(
              (item) => item.template_id === template.id && item.document_type_id === template.document_type_id,
            ),
          })),
        );
      }
    }

    void loadTemplates();
  }, [serviceId]);

  useEffect(() => {
    if (!documentTypeId) return;
    const defaultTemplate = visibleTemplates.find((template) => template.isDefaultForType) ?? visibleTemplates[0];
    if (defaultTemplate) {
      setTemplateId(defaultTemplate.id);
      if (!title.trim()) setTitle(defaultTemplate.name);
    }
  }, [documentTypeId, visibleTemplates, title]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    if (!clientId || !templateId || !title.trim()) {
      setSubmitError("Client, template, and title are required.");
      return;
    }

    setSubmitting(true);
    const result = await createDocumentFromTemplate({
      clientId,
      templateId,
      title: title.trim(),
      projectId: projectId || null,
      serviceId: serviceId || null,
    });
    setSubmitting(false);

    if (result.ok && result.data?.document?.id) {
      navigate(`/admin/documents/${result.data.document.id}`);
      return;
    }

    setSubmitError(result.error ?? "Could not create document.");
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading create form…</p>;
  }

  if (loadError) {
    return <EmptyState title="Could not open create form" description={loadError} />;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <FormCard
        eyebrow="New document"
        title="Create from template"
        description="Select client context and a template. You will land on the document detail page with preview — no editor in this release."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Client
            <select
              className="h-11 rounded-lg border border-gray-200 px-3 text-gray-800 outline-none focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10"
              value={clientId}
              onChange={(event) => {
                setClientId(event.target.value);
                setProjectId("");
              }}
              required
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Project (optional)
            <select
              className="h-11 rounded-lg border border-gray-200 px-3 text-gray-800 outline-none focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              <option value="">No project</option>
              {clientProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Service
            <select
              className="h-11 rounded-lg border border-gray-200 px-3 text-gray-800 outline-none focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              required
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Document type
            <select
              className="h-11 rounded-lg border border-gray-200 px-3 text-gray-800 outline-none focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10"
              value={documentTypeId}
              onChange={(event) => setDocumentTypeId(event.target.value)}
              required
            >
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-gray-700">
            Title
            <input
              className="h-11 rounded-lg border border-gray-200 px-3 text-gray-800 outline-none focus:border-[#2E75BD] focus:ring-3 focus:ring-[#2E75BD]/10"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={selectedType ? `${selectedType.name} title` : "Document title"}
              required
            />
          </label>
        </div>
      </FormCard>

      <FormCard
        title="Template"
        description="Service defaults are listed first. Pick the template that should seed this document."
      >
        {!visibleTemplates.length ? (
          <p className="text-sm text-gray-500">No templates available for this service and document type.</p>
        ) : (
          <div className="grid gap-3">
            {visibleTemplates.map((template) => {
              const typeName = documentTypes.find((type) => type.id === template.document_type_id)?.name ?? "Document";
              const isDefault = defaults.some(
                (item) => item.template_id === template.id && item.document_type_id === template.document_type_id,
              );
              return (
                <label
                  key={template.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    templateId === template.id
                      ? "border-[#2E75BD] bg-[#eff6ff]"
                      : "border-gray-200 hover:border-[#2E75BD]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    className="mt-1"
                    checked={templateId === template.id}
                    onChange={() => {
                      setTemplateId(template.id);
                      if (!title.trim()) setTitle(template.name);
                    }}
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{template.name}</span>
                      {isDefault ? (
                        <span className="rounded-full bg-[#2E75BD] px-2 py-0.5 text-xs font-semibold text-white">
                          Default
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {typeName} · {template.slug}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </FormCard>

      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary" disabled={submitting || !templateId}>
          {submitting ? "Creating…" : "Create document"}
        </button>
        <Link className="btn border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD]" to="/admin/documents">
          Cancel
        </Link>
      </div>
    </form>
  );
}
