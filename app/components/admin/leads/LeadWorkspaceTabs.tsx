import type { LeadWorkspaceTabId } from "~/components/admin/leads/LeadWorkspaceTypes";

const tabs: Array<{ id: LeadWorkspaceTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "ai-pitch", label: "AI Pitch" },
  { id: "email", label: "Email" },
  { id: "audit", label: "Audit" },
  { id: "score", label: "Score" },
  { id: "technical", label: "Technical" },
];

export function LeadWorkspaceTabs({
  activeTab,
  onChange,
}: {
  activeTab: LeadWorkspaceTabId;
  onChange: (tab: LeadWorkspaceTabId) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-5 py-3 md:px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === tab.id
              ? "bg-kw-brand text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
