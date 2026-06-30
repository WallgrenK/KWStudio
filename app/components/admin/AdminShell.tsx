import type { ReactNode } from "react";
import { AdminBackdrop } from "~/components/admin/AdminBackdrop";
import { AdminHeader } from "~/components/admin/AdminHeader";
import { AdminSidebar } from "~/components/admin/AdminSidebar";
import { PageHeader } from "~/components/admin/PageHeader";
import { SidebarProvider, useSidebar } from "~/components/admin/SidebarContext";

type AdminShellProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  children: ReactNode;
};

function AdminShellContent({ title, description, actionLabel, children }: AdminShellProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

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
        <AdminHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <PageHeader
            title={title}
            description={description}
            action={actionLabel ? <button className="btn btn-primary" type="button">{actionLabel}</button> : null}
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
