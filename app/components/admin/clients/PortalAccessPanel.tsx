import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { EmptyState } from "~/components/admin/EmptyState";
import { FormCard } from "~/components/admin/FormCard";
import { StatusBadge } from "~/components/admin/StatusBadge";
import {
  bootstrapAdminProfile,
  createPortalClient,
  createPortalContact,
  createPortalInvite,
  isPortalApiConfigured,
  listPortalClients,
} from "~/services/portalApi";
import type { InviteStatus, PortalClientDto, PortalContactDto } from "~/types/portal";

const INVITE_STATUS_LABEL: Record<InviteStatus, string> = {
  not_invited: "Not invited",
  invited: "Invited",
  accepted: "Accepted",
  expired: "Expired",
};

function inviteStatusTone(status: InviteStatus): string {
  switch (status) {
    case "accepted":
      return "Active";
    case "invited":
      return "Pending";
    case "expired":
      return "Overdue";
    default:
      return "Draft";
  }
}

type InviteLinkState = {
  contactId: string;
  inviteUrl: string;
  expiresAt: string;
};

export function PortalAccessPanel() {
  const [clients, setClients] = useState<PortalClientDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteLinks, setInviteLinks] = useState<Record<string, InviteLinkState>>({});
  const [creatingInviteFor, setCreatingInviteFor] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [contactClientId, setContactClientId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");

  const flatContacts = useMemo(
    () => clients.flatMap((client) => client.contacts.map((contact) => ({ client, contact }))),
    [clients],
  );

  const loadClients = useCallback(async () => {
    if (!isPortalApiConfigured) {
      setError("Portal API not configured. Set VITE_KWSTUDIO_API_URL.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await listPortalClients();
    if (result.ok && result.data?.clients) {
      setClients(result.data.clients);
      if (!contactClientId && result.data.clients[0]?.id) {
        setContactClientId(result.data.clients[0].id);
      }
    } else if (result.status === 403) {
      const bootstrap = await bootstrapAdminProfile();
      if (bootstrap.ok) {
        const retry = await listPortalClients();
        if (retry.ok && retry.data?.clients) {
          setClients(retry.data.clients);
          if (!contactClientId && retry.data.clients[0]?.id) {
            setContactClientId(retry.data.clients[0].id);
          }
        } else {
          setError(retry.error ?? "Could not load portal clients.");
        }
      } else {
        setError(
          bootstrap.error
            ?? result.error
            ?? `Admin profile required (bootstrap failed${bootstrap.status ? `, HTTP ${bootstrap.status}` : ""}).`,
        );
      }
    } else if (result.status === 404) {
      setError(
        "Portal API route not found. Deploy the latest KWStudio API Worker to Render and verify VITE_KWSTUDIO_API_URL.",
      );
    } else {
      setError(result.error ?? "Could not load portal clients.");
    }

    setLoading(false);
  }, [contactClientId]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  async function handleCreateClient(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const result = await createPortalClient({ companyName });
    if (result.ok) {
      setCompanyName("");
      setMessage("Client created.");
      await loadClients();
      return;
    }
    setError(result.error ?? "Could not create client.");
  }

  async function handleCreateContact(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!contactClientId) {
      setError("Select a client first.");
      return;
    }

    const result = await createPortalContact(contactClientId, {
      email: contactEmail,
      firstName: contactFirstName,
      lastName: contactLastName,
    });

    if (result.ok) {
      setContactEmail("");
      setContactFirstName("");
      setContactLastName("");
      setMessage("Contact created.");
      await loadClients();
      return;
    }
    setError(result.error ?? "Could not create contact.");
  }

  async function handleCreateInvite(contact: PortalContactDto) {
    setCreatingInviteFor(contact.id);
    setMessage(null);
    setError(null);

    const result = await createPortalInvite(contact.id);
    if (result.ok && result.data?.invite) {
      setInviteLinks((current) => ({
        ...current,
        [contact.id]: {
          contactId: contact.id,
          inviteUrl: result.data!.invite.inviteUrl,
          expiresAt: result.data!.invite.expiresAt,
        },
      }));
      setMessage(`Invite created for ${contact.email}.`);
      await loadClients();
    } else {
      setError(result.error ?? "Could not create invite.");
    }

    setCreatingInviteFor(null);
  }

  async function handleCopyInvite(contactId: string) {
    const link = inviteLinks[contactId]?.inviteUrl;
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setMessage("Invite link copied.");
  }

  if (!isPortalApiConfigured) {
    return (
      <FormCard title="Portal access" description="Live client portal invites and contact management.">
        <EmptyState
          title="Portal API not configured"
          description="Set VITE_KWSTUDIO_API_URL to enable portal invite management."
        />
      </FormCard>
    );
  }

  return (
    <FormCard
      title="Portal access"
      description="Create clients and contacts, generate invite links, and track portal activation status."
    >
      <div className="space-y-6">
        {error ? <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <form className="space-y-3 rounded-xl border border-gray-100 p-4" onSubmit={(event) => void handleCreateClient(event)}>
            <h3 className="text-sm font-semibold text-gray-800">Create client</h3>
            <input
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm"
              placeholder="Company name"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit">Create client</button>
          </form>

          <form className="space-y-3 rounded-xl border border-gray-100 p-4" onSubmit={(event) => void handleCreateContact(event)}>
            <h3 className="text-sm font-semibold text-gray-800">Create contact</h3>
            <select
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm"
              value={contactClientId}
              onChange={(event) => setContactClientId(event.target.value)}
              required
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
            <input
              className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm"
              type="email"
              placeholder="Email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              required
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm"
                placeholder="First name"
                value={contactFirstName}
                onChange={(event) => setContactFirstName(event.target.value)}
              />
              <input
                className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm"
                placeholder="Last name"
                value={contactLastName}
                onChange={(event) => setContactLastName(event.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit">Create contact</button>
          </form>
        </div>

        {clients.length > 0 ? (
          <div className="rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-800">Client projects</h3>
            <p className="mt-1 text-sm text-gray-500">Start a delivery workflow for an existing client.</p>
            <ul className="mt-3 space-y-2">
              {clients.map((client) => (
                <li key={client.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-gray-700">{client.company_name}</span>
                  <Link
                    className="text-sm font-medium text-kw-brand hover:underline"
                    to={`/admin/projects/new?clientId=${client.id}`}
                  >
                    New project
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-800">Portal contacts</h3>
            <button className="btn btn-outline" type="button" disabled={loading} onClick={() => void loadClients()}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {flatContacts.length === 0 ? (
            <EmptyState
              title="No portal contacts yet"
              description="Create a client and contact above, or use the seeded demo contact after running migration 014."
            />
          ) : (
            <div className="space-y-3">
              {flatContacts.map(({ client, contact }) => {
                const inviteLink = inviteLinks[contact.id];
                return (
                  <div key={contact.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-800">
                          {[contact.first_name, contact.last_name].filter(Boolean).join(" ") || contact.email}
                        </p>
                        <p className="text-sm text-gray-500">{client.company_name} · {contact.email}</p>
                      </div>
                      <StatusBadge status={inviteStatusTone(contact.invite_status)} label={INVITE_STATUS_LABEL[contact.invite_status]} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={contact.invite_status === "accepted" || creatingInviteFor === contact.id}
                        onClick={() => void handleCreateInvite(contact)}
                      >
                        {creatingInviteFor === contact.id ? "Creating…" : "Create invite link"}
                      </button>
                      <button className="btn btn-outline opacity-60" type="button" disabled>
                        Send email (coming soon)
                      </button>
                    </div>

                    {inviteLink ? (
                      <div className="mt-4 space-y-2">
                        <label className="text-xs font-medium text-gray-500">Invite link (dev)</label>
                        <div className="flex flex-wrap gap-2">
                          <input
                            className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-700"
                            readOnly
                            value={inviteLink.inviteUrl}
                          />
                          <button className="btn btn-outline" type="button" onClick={() => void handleCopyInvite(contact.id)}>
                            Copy link
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">Expires {new Date(inviteLink.expiresAt).toLocaleString()}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FormCard>
  );
}
