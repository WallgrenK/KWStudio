import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { MaintenancePage } from "~/components/maintenance-page";
import { useI18n } from "~/i18n";
import { supabase } from "~/utils/supabase";

type MaintenanceState = "checking" | "enabled" | "disabled";

function isMaintenanceEnabled(value: unknown) {
  if (value === true) return true;
  if (typeof value !== "string") return false;

  return ["true", "1", "enabled"].includes(value.trim().toLowerCase());
}

function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { t } = useI18n();
  const [state, setState] = useState<MaintenanceState>("checking");

  useEffect(() => {
    let isMounted = true;

    async function loadMaintenanceMode() {
      if (isAdminPath(location.pathname)) {
        setState("disabled");
        return;
      }

      setState("checking");

      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setState("disabled");
        return;
      }

      setState(isMaintenanceEnabled(data?.value) ? "enabled" : "disabled");
    }

    loadMaintenanceMode();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isAdminPath(location.pathname)) {
    return children;
  }

  if (state === "checking") {
    return (
      <main className="maintenance-loading" aria-live="polite">
        <span>{t("maintenance.loading")}</span>
      </main>
    );
  }

  if (state === "enabled") {
    return <MaintenancePage />;
  }

  return children;
}
