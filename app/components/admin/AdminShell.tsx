import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminBackdrop } from "~/components/admin/AdminBackdrop";
import { AdminHeader } from "~/components/admin/AdminHeader";
import { AdminSidebar } from "~/components/admin/AdminSidebar";
import { PageHeader } from "~/components/admin/PageHeader";
import { SidebarProvider, useSidebar } from "~/components/admin/SidebarContext";
import { useAdminAuth } from "~/hooks/useAdminAuth";
import { isSupabaseConfigured } from "~/lib/supabase";

type AdminShellProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  children: ReactNode;
};

function AdminShellContent({
  title,
  description,
  actionLabel,
  children,
}: AdminShellProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const auth = useAdminAuth();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      navigate("/login", { replace: true });
      return;
    }

    if (!auth.loading && !auth.session) {
      navigate("/login", { replace: true });
    }
  }, [auth.loading, auth.session, navigate]);

  if (auth.loading || !isSupabaseConfigured || !auth.session) {
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
            title={title}
            description={description}
            action={
              actionLabel ? (
                <button className="btn btn-primary" type="button">
                  {actionLabel}
                </button>
              ) : null
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
