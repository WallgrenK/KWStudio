import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { StatusBadge } from "~/components/admin/StatusBadge";
import { PortalDashboardLayout } from "~/components/portal/PortalAuthLayout";
import { PortalEmptyState, PortalCard } from "~/components/portal/PortalSection";
import {
  PortalAccessDeniedState,
  PortalErrorState,
  PortalLoadingState,
} from "~/components/portal/PortalDashboardStates";
import { usePortalAuth } from "~/hooks/usePortalAuth";
import { useUserProfile } from "~/hooks/useUserProfile";
import { isDocumentsApiConfigured, listPortalDocuments } from "~/services/documentsApi";
import type { PortalDocumentSummaryDto } from "~/types/documents";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PortalDocumentsPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, me } = usePortalAuth();
  const userProfile = useUserProfile(Boolean(session) && isDocumentsApiConfigured);
  const [documents, setDocuments] = useState<PortalDocumentSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userProfile.profile?.role === "admin";

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, navigate, session]);

  useEffect(() => {
    if (userProfile.loading || !userProfile.profile) return;
    if (isAdmin) navigate("/admin", { replace: true });
  }, [isAdmin, navigate, userProfile.loading, userProfile.profile]);

  useEffect(() => {
    if (!session || !isDocumentsApiConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void listPortalDocuments().then((result) => {
      if (cancelled) return;
      if (result.ok && result.data?.documents) {
        setDocuments(result.data.documents);
      } else {
        setDocuments([]);
        setError(result.error ?? "Could not load documents.");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const companyName = useMemo(() => me?.client?.company_name ?? undefined, [me?.client?.company_name]);

  if (!isDocumentsApiConfigured) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalErrorState title="Unavailable" description="Documents are not available — API is not configured." />
      </PortalDashboardLayout>
    );
  }

  if (authLoading || loading) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalLoadingState message="Loading documents…" />
      </PortalDashboardLayout>
    );
  }

  if (isAdmin) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalAccessDeniedState description="Admin accounts should use the admin console." />
      </PortalDashboardLayout>
    );
  }

  return (
    <PortalDashboardLayout
      companyName={companyName}
      action={(
        <Link
          to="/portal/dashboard"
          className="text-sm font-medium text-[#2E75BD] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:rounded"
        >
          Dashboard
        </Link>
      )}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
        <p className="mt-2 text-sm text-gray-500">Review proposals and contracts shared with your company.</p>
      </div>

      {error ? <PortalErrorState title="Could not load documents" description={error} /> : null}

      {!error && !documents.length ? (
        <PortalEmptyState
          title="No documents yet"
          description="When your team publishes a proposal or contract, it will appear here."
        />
      ) : null}

      {documents.length ? (
        <div className="space-y-3" role="list" aria-label="Your documents">
          {documents.map((document) => (
            <PortalCard key={document.id} padding="md" className={`transition-colors ${document.isHighlighted ? "border-[#2E75BD]/40 bg-[#f8fbff]" : "hover:border-[#2E75BD]/30"}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={document.status} />
                    {document.pendingSignature ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        Signature required
                      </span>
                    ) : null}
                    {document.pendingApproval ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        Pending approval
                      </span>
                    ) : null}
                    {document.isHighlighted ? (
                      <span className="inline-flex items-center rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#2E75BD]">
                        New
                      </span>
                    ) : null}
                    <span className="text-xs text-gray-500">{document.documentType.name}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900">
                    <Link
                      to={`/portal/documents/${document.id}`}
                      className="rounded hover:text-[#2E75BD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40"
                    >
                      {document.title}
                    </Link>
                  </h2>
                  {document.referenceNumber ? (
                    <p className="mt-1 text-sm text-gray-500">Ref {document.referenceNumber}</p>
                  ) : null}
                  <dl className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Sent</dt>
                      <dd>{document.sentAt ? formatDate(document.sentAt) : "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Viewed</dt>
                      <dd>{document.viewedAt ? formatDate(document.viewedAt) : "Not yet"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Version</dt>
                      <dd>{document.currentVersionNumber ? `v${document.currentVersionNumber}` : "—"}</dd>
                    </div>
                  </dl>
                </div>
                <Link
                  to={`/portal/documents/${document.id}`}
                  className="btn btn-primary inline-flex shrink-0 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75BD]/40 focus-visible:ring-offset-2"
                  aria-label={`Preview ${document.title}`}
                >
                  Preview
                </Link>
              </div>
            </PortalCard>
          ))}
        </div>
      ) : null}
    </PortalDashboardLayout>
  );
}
