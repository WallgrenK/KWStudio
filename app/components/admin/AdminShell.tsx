import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AdminBackdrop } from "~/components/admin/AdminBackdrop";
import { AdminHeader } from "~/components/admin/AdminHeader";
import { AdminSidebar } from "~/components/admin/AdminSidebar";
import { PageHeader } from "~/components/admin/PageHeader";
import { SidebarProvider, useSidebar } from "~/components/admin/SidebarContext";
import { useAdminAuth } from "~/hooks/useAdminAuth";
import { useUserProfile } from "~/hooks/useUserProfile";
import { isSupabaseConfigured } from "~/lib/supabase";
import { isPortalApiConfigured } from "~/services/portalApi";

type AdminShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  children: ReactNode;
};

function AdminShellContent({
  eyebrow,
  title,
  description,
  action,
  actionLabel,
  children,
}: AdminShellProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const auth = useAdminAuth();
  const userProfile = useUserProfile(Boolean(auth.session) && isPortalApiConfigured);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate("/login", { replace: true });
      return;
    }

    if (!auth.loading && !auth.session) {
      navigate("/login", { replace: true });
    }
  }, [auth.loading, auth.session, navigate]);

  useEffect(() => {
    if (auth.loading || userProfile.loading || !auth.session) return;

    if (userProfile.profile?.role === "client") {
      navigate("/portal/dashboard", { replace: true });
    }
  }, [auth.loading, navigate, userProfile.loading, userProfile.profile?.role, auth.session]);

  const handleBootstrapAdmin = async () => {
    setIsBootstrapping(true);
    try {
      await userProfile.bootstrapAdmin();
    } finally {
      setIsBootstrapping(false);
    }
  };

  if (auth.loading || userProfile.loading || !isSupabaseConfigured || !auth.session) {
    return (
      <div className="kw-admin-root">
        <div className="admin-auth-page">
          <div className="admin-loading">
            {isSupabaseConfigured ? "Checking admin session..." : "Supabase not configured."}
          </div>
        </div>
      </div>
    );
  }

  if (isPortalApiConfigured && userProfile.profile?.role !== "admin") {
    return (
      <div className="kw-admin-root">
        <div className="admin-auth-page">
          <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2E75BD]">Admin access required</p>
            <h1 className="mt-3 text-xl font-semibold text-gray-900">This area is restricted to KWStudio admins.</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {userProfile.error ?? "Sign in with an admin account or bootstrap the first admin profile for a new workspace."}
            </p>
            {!userProfile.profile ? (
              <button
                className="btn btn-primary mt-6"
                type="button"
                disabled={isBootstrapping}
                onClick={() => void handleBootstrapAdmin()}
              >
                {isBootstrapping ? "Creating admin profile..." : "Bootstrap first admin"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AdminSidebar />
        <AdminBackdrop />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AdminHeader displayName={auth.displayName} email={auth.email} onSignOut={auth.signOut} />

        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <PageHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            action={
              action ??
              (actionLabel ? (
                <button className="btn btn-primary" type="button">
                  {actionLabel}
                </button>
              ) : null)
            }
          />

          {children}
        </div>
      </div>
    </div>
  );
}

export function AdminShell(props: AdminShellProps) {
  return (
    <SidebarProvider>
      <div className="kw-admin-root">
        <AdminShellContent {...props} />
      </div>
    </SidebarProvider>
  );
}
