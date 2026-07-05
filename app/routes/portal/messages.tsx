import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { PortalDashboardLayout } from "~/components/portal/PortalAuthLayout";
import { PortalProjectSwitcher } from "~/components/portal/PortalProjectSwitcher";
import {
  PortalErrorState,
  PortalLoadingState,
  PortalNoProjectState,
} from "~/components/portal/PortalDashboardStates";
import { PortalSection } from "~/components/portal/PortalSection";
import { ProjectConversationsBrowser } from "~/components/conversations/ProjectConversationsBrowser";
import { usePortalAuth } from "~/hooks/usePortalAuth";
import { useUserProfile } from "~/hooks/useUserProfile";
import { getPortalFirstName, pickPrimaryProjectId } from "~/lib/portalDashboardData";
import { getPortalProjects, isPortalApiConfigured } from "~/services/portalApi";
import { isConversationsApiConfigured } from "~/services/conversationsApi";
import type { PortalProjectDto } from "~/types/portal";

export default function PortalMessagesPage() {
  const navigate = useNavigate();
  const { session, loading: authLoading, me } = usePortalAuth();
  const userProfile = useUserProfile(Boolean(session) && isPortalApiConfigured);
  const [projects, setProjects] = useState<PortalProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
    if (!session || !isPortalApiConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void getPortalProjects().then((result) => {
      if (cancelled) return;
      if (result.ok && result.data?.projects) {
        setProjects(result.data.projects);
        setSelectedProjectId((current) => current ?? pickPrimaryProjectId(result.data!.projects));
      } else {
        setError(result.error ?? "Could not load projects.");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const companyName = useMemo(() => me?.client?.company_name ?? undefined, [me?.client?.company_name]);
  const firstName = me ? getPortalFirstName(me) : "there";
  const activeProjectId = selectedProjectId ?? projects[0]?.id ?? null;

  if (!isPortalApiConfigured || !isConversationsApiConfigured) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalErrorState title="Unavailable" description="Messages are not available — API is not configured." />
      </PortalDashboardLayout>
    );
  }

  if (loading || authLoading) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalLoadingState />
      </PortalDashboardLayout>
    );
  }

  if (error) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalErrorState title="Could not load messages" description={error} />
      </PortalDashboardLayout>
    );
  }

  if (!projects.length || !activeProjectId) {
    return (
      <PortalDashboardLayout companyName={companyName}>
        <PortalNoProjectState firstName={firstName} />
      </PortalDashboardLayout>
    );
  }

  return (
    <PortalDashboardLayout
      companyName={companyName}
      action={(
        <Link to="/portal/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Dashboard
        </Link>
      )}
    >
      <PortalSection
        title="Messages"
        description="Communicate with your KWStudio team about this project."
        action={(
          <PortalProjectSwitcher
            projects={projects.map((project) => ({
              id: project.id,
              title: project.title,
              status: project.status.replace(/_/g, " "),
            }))}
            selectedProjectId={activeProjectId}
            onSelect={setSelectedProjectId}
          />
        )}
      >
        <ProjectConversationsBrowser projectId={activeProjectId} mode="portal" />
      </PortalSection>
    </PortalDashboardLayout>
  );
}
