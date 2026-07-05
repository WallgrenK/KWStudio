import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { NotificationBell } from "~/components/notifications/NotificationBell";
import { PortalActivity } from "~/components/portal/PortalActivity";
import { PortalDashboardLayout } from "~/components/portal/PortalAuthLayout";
import { PortalChecklist } from "~/components/portal/PortalChecklist";
import { PortalContactCard, PortalProjectInfoCard } from "~/components/portal/PortalContactCard";
import {
  PortalAccessDeniedState,
  PortalErrorState,
  PortalInlineAlert,
  PortalLoadingState,
  PortalNoProjectState,
  PortalToast,
} from "~/components/portal/PortalDashboardStates";
import { PortalHero } from "~/components/portal/PortalHero";
import { PortalProjectSwitcher } from "~/components/portal/PortalProjectSwitcher";
import { PortalQuickAccess } from "~/components/portal/PortalQuickAccess";
import { PortalSection } from "~/components/portal/PortalSection";
import { PortalTimeline } from "~/components/portal/PortalTimeline";
import { PORTAL_QUICK_ACCESS, type PortalProjectSummary } from "~/data/portalDashboard";
import { buildFallbackPortalContact, filterPortalQuickAccess } from "~/settings/portalHelpers";
import { usePublicPortalSettings } from "~/settings/usePublicPortalSettings";
import { usePortalAuth } from "~/hooks/usePortalAuth";
import { useUserProfile } from "~/hooks/useUserProfile";
import {
  getPortalFirstName,
  mapDashboardApiToViewModel,
  pickPrimaryProjectId,
} from "~/lib/portalDashboardData";
import {
  completePortalClientAction,
  getPortalProjectDashboard,
  getPortalProjects,
  isPortalApiConfigured,
} from "~/services/portalApi";
import type { PortalProjectDto } from "~/types/portal";
import type { PortalProjectDashboardDto } from "~/types/workflow";

function mapProjectsToSummaries(projects: PortalProjectDto[]): PortalProjectSummary[] {
  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    status: project.status.replace(/_/g, " "),
  }));
}

export default function PortalDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portalSettings = usePublicPortalSettings();
  const companyName = portalSettings.companyName;
  const quickAccessItems = useMemo(
    () => filterPortalQuickAccess(PORTAL_QUICK_ACCESS, portalSettings.allowedPortalFeatures),
    [portalSettings.allowedPortalFeatures],
  );
  const contactSectionTitle = `Your contact at ${companyName}`;
  const activitySectionDescription = `Recent updates from ${companyName}`;
  const { session, loading, me, error, signOut } = usePortalAuth();
  const userProfile = useUserProfile(Boolean(session) && isPortalApiConfigured);
  const [projects, setProjects] = useState<PortalProjectDto[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<PortalProjectDashboardDto | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [completingActionId, setCompletingActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [failedActionId, setFailedActionId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isAdmin = userProfile.profile?.role === "admin";

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login", { replace: true });
    }
  }, [loading, navigate, session]);

  useEffect(() => {
    if (userProfile.loading || !userProfile.profile) return;
    if (isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, navigate, userProfile.loading, userProfile.profile]);

  useEffect(() => {
    if (!session || !isPortalApiConfigured) {
      setProjectsLoading(false);
      return;
    }

    let cancelled = false;
    setProjectsLoading(true);
    setProjectsError(null);

    void getPortalProjects().then((result) => {
      if (cancelled) return;

      if (result.ok && result.data?.projects) {
        setProjects(result.data.projects);
        const fromQuery = searchParams.get("projectId");
        setSelectedProjectId((current) =>
          fromQuery ?? current ?? pickPrimaryProjectId(result.data!.projects),
        );
      } else {
        setProjects([]);
        setProjectsError(result.error ?? "Could not load your projects.");
      }

      setProjectsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [session, searchParams]);

  useEffect(() => {
    const fromQuery = searchParams.get("projectId");
    if (fromQuery) setSelectedProjectId(fromQuery);
  }, [searchParams]);

  const loadDashboard = useCallback(async (projectId: string, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setDashboardLoading(true);
    }
    setDashboardError(null);

    const result = await getPortalProjectDashboard(projectId);
    if (result.ok && result.data) {
      setDashboard(result.data);
    } else {
      setDashboard(null);
      setDashboardError(result.error ?? "Could not load project dashboard.");
    }

    if (!options?.silent) {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || !selectedProjectId || !isPortalApiConfigured) return;
    void loadDashboard(selectedProjectId);
  }, [loadDashboard, selectedProjectId, session]);

  const projectSummaries = useMemo(() => mapProjectsToSummaries(projects), [projects]);
  const viewModel = useMemo(
    () => (dashboard ? mapDashboardApiToViewModel(dashboard, { companyName }) : null),
    [companyName, dashboard],
  );

  const signOutButton = (
    <button
      className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-brand/40 focus-visible:ring-offset-2"
      type="button"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );

  const headerActions = (
    <div className="flex shrink-0 items-center gap-2">
      <NotificationBell audience="client" enabled={Boolean(session)} />
      {signOutButton}
    </div>
  );

  async function handleCompleteAction(actionId: string) {
    if (!selectedProjectId) return;
    setCompletingActionId(actionId);
    setActionError(null);
    setFailedActionId(null);

    const result = await completePortalClientAction(selectedProjectId, actionId);
    if (result.ok) {
      setSuccessToast("Great! Your progress has been updated.");
      window.setTimeout(() => setSuccessToast(null), 5000);
      await loadDashboard(selectedProjectId, { silent: true });
    } else if (result.status === 403) {
      setFailedActionId(actionId);
      setActionError("You don't have permission to complete this action.");
    } else if (result.status === 409) {
      setFailedActionId(actionId);
      setActionError(result.error ?? "This action cannot be completed right now.");
    } else {
      setFailedActionId(actionId);
      setActionError(result.error ?? "Could not complete action. Please try again.");
    }

    setCompletingActionId(null);
  }

  if (loading || userProfile.loading) {
    return (
      <PortalDashboardLayout companyName="Loading…">
        <PortalLoadingState message="Preparing your project overview…" />
      </PortalDashboardLayout>
    );
  }

  if (!session) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalAccessDeniedState description="Sign in to access your client portal dashboard." />
      </PortalDashboardLayout>
    );
  }

  if (isAdmin) {
    return (
      <PortalDashboardLayout companyName={companyName} action={signOutButton}>
        <PortalErrorState
          title="Admin accounts use the admin area"
          description="This dashboard is for client accounts. You are being redirected to the admin panel."
          action={(
            <Link className="btn btn-primary" to="/admin">
              Go to admin
            </Link>
          )}
        />
      </PortalDashboardLayout>
    );
  }

  if (error || !me) {
    return (
      <PortalDashboardLayout companyName={companyName} action={signOutButton}>
        <PortalErrorState
          title="Portal access required"
          description={error ?? "Your account is not linked to a client portal profile."}
          action={(
            <button className="btn btn-primary" type="button" onClick={() => void signOut()}>
              Sign out
            </button>
          )}
        />
      </PortalDashboardLayout>
    );
  }

  const firstName = getPortalFirstName(me);
  const activeProjectId = selectedProjectId ?? projects[0]?.id ?? null;
  const hasProjects = projects.length > 0;
  const dashboardData = viewModel?.data;
  const checklistMeta = viewModel?.checklistMeta ?? { state: "empty" as const, pendingCount: 0, totalCount: 0 };
  const hasWorkflow = viewModel?.hasWorkflow ?? false;

  return (
    <PortalDashboardLayout
      companyName={me.client?.company_name ?? "Client portal"}
      action={headerActions}
    >
      <div className="space-y-6 md:space-y-8">
        {projectsError ? (
          <PortalInlineAlert tone="warning" message={`Project list could not be loaded. ${projectsError}`} />
        ) : null}

        {dashboardError ? (
          <PortalInlineAlert tone="error" message={dashboardError} />
        ) : null}

        {!hasProjects ? (
          projectsLoading ? (
            <PortalLoadingState message="Loading your projects…" />
          ) : (
            <>
              <PortalNoProjectState firstName={firstName} />
              <div className="grid gap-6 md:gap-8 xl:grid-cols-[1.4fr_0.9fr]">
                <PortalSection title="Quick access" description="Shortcuts to portal resources.">
                  <PortalQuickAccess items={quickAccessItems} />
                </PortalSection>
                <PortalSection title={contactSectionTitle}>
                  <PortalContactCard contact={dashboardData?.contact ?? buildFallbackPortalContact(portalSettings.data)} />
                </PortalSection>
              </div>
            </>
          )
        ) : (
          <>
            {activeProjectId && projectSummaries.length > 1 ? (
              <PortalProjectSwitcher
                projects={projectSummaries}
                selectedProjectId={activeProjectId}
                onSelect={setSelectedProjectId}
              />
            ) : null}

            {dashboardLoading || projectsLoading ? (
              <PortalLoadingState message="Loading your project dashboard…" />
            ) : !hasWorkflow && dashboard ? (
              <>
                <PortalNoProjectState firstName={firstName} />
                {dashboard.emptyState.hints.map((hint) => (
                  <PortalInlineAlert key={hint} message={hint} />
                ))}
              </>
            ) : dashboardData ? (
              <>
                <PortalHero firstName={firstName} project={dashboardData.project} />

                <PortalSection title="Project progress" description="Where your project stands today.">
                  <PortalTimeline phases={dashboardData.phases} />
                </PortalSection>

                <div className="grid gap-6 md:gap-8 xl:grid-cols-[1.4fr_0.9fr]">
                  <div className="min-w-0 space-y-6 md:space-y-8">
                    <PortalSection title="Next steps" description="What we need from you to keep momentum.">
                      <PortalChecklist
                        items={dashboardData.nextSteps}
                        meta={checklistMeta}
                        onComplete={handleCompleteAction}
                        completingId={completingActionId}
                        actionError={actionError}
                        failedActionId={failedActionId}
                      />
                    </PortalSection>

                    <PortalSection title="Latest activity" description={activitySectionDescription}>
                      <PortalActivity items={dashboardData.activity} />
                    </PortalSection>

                    <PortalSection title="Quick access" description="Shortcuts to project resources.">
                      <PortalQuickAccess items={quickAccessItems} />
                    </PortalSection>
                  </div>

                  <aside className="min-w-0 space-y-6 md:space-y-8">
                    <PortalSection title="Project information">
                      <PortalProjectInfoCard project={dashboardData.project} />
                    </PortalSection>

                    <PortalSection title={contactSectionTitle}>
                      <PortalContactCard contact={dashboardData.contact ?? buildFallbackPortalContact(portalSettings.data)} />
                    </PortalSection>
                  </aside>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
      {successToast ? (
        <PortalToast message={successToast} onDismiss={() => setSuccessToast(null)} />
      ) : null}
    </PortalDashboardLayout>
  );
}
