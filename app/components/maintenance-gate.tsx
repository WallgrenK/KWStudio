import { useLocation } from "react-router";
import type { ReactNode } from "react";
import { MaintenancePage } from "~/components/maintenance-page";
import { usePublicWebsiteSettings } from "~/settings/usePublicWebsiteSettings";

function isMaintenanceBypassPath(pathname: string) {
  return (
    pathname === "/admin"
    || pathname.startsWith("/admin/")
    || pathname === "/auth"
    || pathname.startsWith("/auth/")
  );
}

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const website = usePublicWebsiteSettings();

  if (isMaintenanceBypassPath(location.pathname)) {
    return children;
  }

  if (website.isLoading) {
    return children;
  }

  if (website.maintenanceMode) {
    return <MaintenancePage />;
  }

  return children;
}
