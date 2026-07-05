import { Link } from "react-router";
import { ArrowUpRight, FileText, FolderOpen, LifeBuoy, MessageSquare, ReceiptText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PortalQuickAccessItem } from "~/data/portalDashboard";
import { PortalCard, PortalEmptyState } from "./PortalSection";

const ICONS: Record<string, LucideIcon> = {
  documents: FileText,
  invoices: ReceiptText,
  messages: MessageSquare,
  files: FolderOpen,
  support: LifeBuoy,
};

type PortalQuickAccessProps = {
  items: PortalQuickAccessItem[];
};

export function PortalQuickAccess({ items }: PortalQuickAccessProps) {
  if (items.length === 0) {
    return (
      <PortalCard>
        <PortalEmptyState
          title="No shortcuts yet"
          description="Quick links to documents, files, and support will appear here."
        />
      </PortalCard>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = ICONS[item.id] ?? FileText;
        return (
          <Link
            key={item.id}
            to={item.href}
            className="group block min-h-[44px] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kw-brand/40 focus-visible:ring-offset-2"
          >
            <PortalCard className="h-full transition-transform duration-200 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#eff6ff] text-kw-brand transition-colors duration-200 group-hover:bg-kw-brand group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-gray-300 transition-colors duration-200 group-hover:text-kw-brand" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-gray-500">{item.description}</p>
            </PortalCard>
          </Link>
        );
      })}
    </div>
  );
}
