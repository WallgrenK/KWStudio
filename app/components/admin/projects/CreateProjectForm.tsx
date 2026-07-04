import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { EmptyState } from "~/components/admin/EmptyState";
import { FormCard } from "~/components/admin/FormCard";
import {
  bootstrapAdminProfile,
  createPortalProject,
  isPortalApiConfigured,
  listPortalClients,
  listPortalServices,
} from "~/services/portalApi";
import type { PortalClientDto } from "~/types/portal";
import type { PortalServiceDto } from "~/types/workflow";

function findDefaultServiceId(services: PortalServiceDto[]): string {
  const website = services.find((service) => service.slug === "website");
  return website?.id ?? services[0]?.id ?? "";
}

type CreateProjectFormProps = {
  initialClientId?: string;
};

export function CreateProjectForm({ initialClientId }: CreateProjectFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdFromUrl = searchParams.get("clientId") ?? undefined;
  const [clients, setClients] = useState<PortalClientDto[]>([]);
  const [services, setServices] = useState<PortalServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [serviceId, setServiceId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId) ?? null,
    [serviceId, services],
  );

  useEffect(() => {
    if (!isPortalApiConfigured) {
      setLoadError("Portal API not configured. Set VITE_KWSTUDIO_API_URL.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setLoadError(null);

      let clientsError: string | null = null;
      let servicesError: string | null = null;

      const [clientsResult, servicesResult] = await Promise.all([
        listPortalClients(),
        listPortalServices(),
      ]);

      if (!clientsResult.ok && clientsResult.status === 403) {
        const bootstrap = await bootstrapAdminProfile();
        if (bootstrap.ok) {
          const retryClients = await listPortalClients();
          if (retryClients.ok && retryClients.data?.clients) {
            setClients(retryClients.data.clients);
          } else {
            clientsError = retryClients.error ?? "Could not load clients.";
          }
        } else {
          clientsError = bootstrap.error ?? clientsResult.error ?? "Admin access required.";
        }
      } else if (clientsResult.ok && clientsResult.data?.clients) {
        setClients(clientsResult.data.clients);
      } else {
        clientsError = clientsResult.error ?? "Could not load clients.";
      }

      if (servicesResult.ok && servicesResult.data?.services) {
        const activeServices = servicesResult.data.services.filter((service) => service.is_active);
        setServices(activeServices);
        setServiceId((current) => current || findDefaultServiceId(activeServices));
        if (activeServices.length === 0) {
          servicesError = "No active services are configured.";
        }
      } else {
        servicesError = servicesResult.error ?? "Could not load services.";
      }

      setLoadError(clientsError ?? servicesError);
      setLoading(false);
    }

    void load();
  }, []);

  useEffect(() => {
    const preferredClientId = initialClientId ?? clientIdFromUrl;
    if (preferredClientId) {
      setClientId(preferredClientId);
      return;
    }
    if (!clientId && clients[0]?.id) {
      setClientId(clients[0].id);
    }
  }, [clientId, clientIdFromUrl, clients, initialClientId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const trimmedTitle = title.trim();
    if (!clientId) {
      setSubmitError("Please select a client.");
      return;
    }
    if (!serviceId) {
      setSubmitError("Please select a service.");
      return;
    }
    if (!trimmedTitle) {
      setSubmitError("Project title is required.");
      return;
    }

    setSubmitting(true);
    const result = await createPortalProject(clientId, {
      title: trimmedTitle,
      serviceId,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(startDate ? { startDate } : {}),
      ...(dueDate ? { dueDate } : {}),
    });

    if (result.ok && result.data?.project?.id) {
      navigate(`/admin/projects/${result.data.project.id}`, { replace: true });
      return;
    }

    setSubmitError(result.error ?? "Could not create project.");
    setSubmitting(false);
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading form…</p>;
  }

  if (loadError) {
    return <EmptyState title="Could not load project form" description={loadError} />;
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        title="No clients yet"
        description="Create a client first before starting a project."
        action={(
          <Link className="btn btn-primary" to="/admin/clients">
            Go to clients
          </Link>
        )}
      />
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="No services available"
        description="Active services could not be loaded. Check the API connection and migration seeds."
      />
    );
  }

  return (
    <FormCard
      title="New project"
      description="Select a client and service. The workflow will initialize automatically from the service default template."
    >
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Client</span>
          <select
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm"
            required
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          >
            <option value="" disabled>
              Select client
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Service</span>
          <select
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm"
            required
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            <option value="" disabled>
              Select service
            </option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          {selectedService?.description ? (
            <p className="text-sm text-gray-500">{selectedService.description}</p>
          ) : null}
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Project title</span>
          <input
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Website redesign"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-gray-700">Description (optional)</span>
          <textarea
            className="min-h-[88px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Brief project summary"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Start date (optional)</span>
            <input
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">Due date (optional)</span>
            <input
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>

        {submitError ? (
          <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating project…" : "Create project"}
          </button>
          <Link className="btn border border-gray-200 bg-white text-gray-700 hover:border-[#2E75BD]" to="/admin/projects">
            Cancel
          </Link>
        </div>
      </form>
    </FormCard>
  );
}
