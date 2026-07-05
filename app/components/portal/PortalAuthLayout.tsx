import type { ReactNode } from "react";
import { Link } from "react-router";
import { getPortalBrandInitials, getPortalWorkspaceLabel } from "~/settings/portalHelpers";
import { usePublicPortalSettings } from "~/settings/usePublicPortalSettings";

type PortalAuthLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function PortalAuthLayout({ title, description, children }: PortalAuthLayoutProps) {
  const portal = usePublicPortalSettings();
  const brandColor = portal.brandColor;
  const portalTitle = getPortalWorkspaceLabel(portal.data);
  const brandInitials = getPortalBrandInitials(portal.companyName);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 md:px-6">
        <header className="mb-10 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 text-gray-800">
            <span
              className="flex size-10 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: brandColor }}
            >
              {brandInitials}
            </span>
            <span className="text-lg font-semibold">{portalTitle}</span>
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: brandColor }}>
              Client portal
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h1>
            {description ? <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p> : null}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

type PortalDashboardLayoutProps = {
  companyName?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PortalDashboardLayout({ companyName, action, children }: PortalDashboardLayoutProps) {
  const portal = usePublicPortalSettings();
  const brandColor = portal.brandColor;
  const brandInitials = getPortalBrandInitials(portal.companyName);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f9fc]">
      <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:gap-4 md:px-6">
          <Link
            to="/portal/dashboard"
            className="inline-flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-brand/40"
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: brandColor }}
            >
              {brandInitials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{portal.companyName}</p>
              <p className="truncate text-xs text-gray-500">{companyName ?? "Client portal"}</p>
            </div>
          </Link>
          {action}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">{children}</div>
    </main>
  );
}

type PortalShellProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function PortalShell({ title, description, action, children }: PortalShellProps) {
  return (
    <PortalDashboardLayout companyName={description} action={action}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description ? <p className="mt-2 text-sm text-gray-500">{description}</p> : null}
      </div>
      {children}
    </PortalDashboardLayout>
  );
}
