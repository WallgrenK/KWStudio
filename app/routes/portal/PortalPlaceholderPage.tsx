import { Link } from "react-router";
import { PortalCard } from "~/components/portal/PortalSection";
import { PortalDashboardLayout } from "~/components/portal/PortalAuthLayout";

type PortalPlaceholderPageProps = {
  title: string;
  description: string;
};

export function PortalPlaceholderPage({ title, description }: PortalPlaceholderPageProps) {
  return (
    <PortalDashboardLayout>
      <PortalCard padding="lg" className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-kw-brand">Coming soon</p>
        <h1 className="mt-3 text-xl font-semibold text-gray-900 sm:text-2xl">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-gray-600">{description}</p>
        <Link
          className="btn btn-primary mt-6 inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-brand/40 focus-visible:ring-offset-2"
          to="/portal/dashboard"
        >
          Back to dashboard
        </Link>
      </PortalCard>
    </PortalDashboardLayout>
  );
}
