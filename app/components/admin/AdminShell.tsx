import type { ReactNode } from "react";
<<<<<<< HEAD
=======
import { useEffect } from "react";
import { useNavigate } from "react-router";
>>>>>>> 437883a (SCB API update)
import { AdminBackdrop } from "~/components/admin/AdminBackdrop";
import { AdminHeader } from "~/components/admin/AdminHeader";
import { AdminSidebar } from "~/components/admin/AdminSidebar";
import { PageHeader } from "~/components/admin/PageHeader";
import { SidebarProvider, useSidebar } from "~/components/admin/SidebarContext";
<<<<<<< HEAD
=======
import { useAdminAuth } from "~/hooks/useAdminAuth";
import { isSupabaseConfigured } from "~/lib/supabase";
>>>>>>> 437883a (SCB API update)

type AdminShellProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  children: ReactNode;
};

<<<<<<< HEAD
function AdminShellContent({ title, description, actionLabel, children }: AdminShellProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
=======
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
>>>>>>> 437883a (SCB API update)

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AdminSidebar />
        <AdminBackdrop />
      </div>
<<<<<<< HEAD
=======

>>>>>>> 437883a (SCB API update)
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
<<<<<<< HEAD
        <AdminHeader />
=======
        <AdminHeader displayName={auth.displayName} email={auth.email} onSignOut={auth.signOut} />

>>>>>>> 437883a (SCB API update)
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <PageHeader
            title={title}
            description={description}
<<<<<<< HEAD
            action={actionLabel ? <button className="btn btn-primary" type="button">{actionLabel}</button> : null}
          />
=======
            action={
              actionLabel ? (
                <button className="btn btn-primary" type="button">
                  {actionLabel}
                </button>
              ) : null
            }
          />

>>>>>>> 437883a (SCB API update)
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
