import { useEffect } from "react";
import { LeadAiPitchTab } from "~/components/admin/leads/LeadAiPitchTab";
import { LeadAuditTab } from "~/components/admin/leads/LeadAuditTab";
import { LeadEmailTab } from "~/components/admin/leads/LeadEmailTab";
import { LeadOverviewTab } from "~/components/admin/leads/LeadOverviewTab";
import { LeadScoreTab } from "~/components/admin/leads/LeadScoreTab";
import { LeadTechnicalTab } from "~/components/admin/leads/LeadTechnicalTab";
import { LeadWorkspaceTabs } from "~/components/admin/leads/LeadWorkspaceTabs";
import type { LeadWorkspaceActions, LeadWorkspaceData, LeadWorkspaceTabId } from "~/components/admin/leads/LeadWorkspaceTypes";

export function LeadWorkspaceModal({
  isOpen,
  activeTab,
  data,
  actions,
  onTabChange,
  onClose,
}: {
  isOpen: boolean;
  activeTab: LeadWorkspaceTabId;
  data: LeadWorkspaceData;
  actions: LeadWorkspaceActions;
  onTabChange: (tab: LeadWorkspaceTabId) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/50 p-3 backdrop-blur-sm md:p-6" role="presentation">
      <section
        aria-modal="true"
        aria-labelledby="lead-workspace-title"
        className="flex h-[90vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-3xl bg-gray-50 shadow-2xl"
        role="dialog"
      >
        <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
          <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between md:px-6">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E75BD]">Lead Workspace</p>
              <h2 id="lead-workspace-title" className="mt-1 truncate text-2xl font-semibold text-gray-900">{data.companyName}</h2>
              <p className="mt-1 truncate text-sm text-gray-500">{data.location}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {data.copiedMessage ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2E75BD]">{data.copiedMessage}</span>
              ) : null}
              {data.hasInsight ? (
                <button className="btn btn-outline" type="button" onClick={actions.onCopyEmail}>
                  Copy Email
                </button>
              ) : null}
              <button className="btn btn-outline" type="button" onClick={actions.onRefresh} disabled={data.isLoadingAiInsight}>
                Refresh
              </button>
              <button className="btn btn-primary" type="button" onClick={actions.onGenerate} disabled={!data.canGenerate || data.isGeneratingAiInsight}>
                {data.hasInsight ? "Regenerate" : "Generate AI Pitch"}
              </button>
              <button
                aria-label="Close lead workspace"
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-[#2E75BD] hover:text-[#2E75BD]"
                type="button"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
          <LeadWorkspaceTabs activeTab={activeTab} onChange={onTabChange} />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">
          {activeTab === "overview" ? <LeadOverviewTab data={data} /> : null}
          {activeTab === "ai-pitch" ? <LeadAiPitchTab data={data} actions={actions} /> : null}
          {activeTab === "email" ? <LeadEmailTab data={data} actions={actions} /> : null}
          {activeTab === "audit" ? <LeadAuditTab data={data} actions={actions} /> : null}
          {activeTab === "score" ? <LeadScoreTab data={data} /> : null}
          {activeTab === "technical" ? <LeadTechnicalTab data={data} /> : null}
        </div>
      </section>
    </div>
  );
}
