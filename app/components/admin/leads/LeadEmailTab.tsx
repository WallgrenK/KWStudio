import { LeadEmailCard } from "~/components/admin/leads/LeadEmailCard";
import type { LeadWorkspaceActions, LeadWorkspaceData } from "~/components/admin/leads/LeadWorkspaceTypes";

export function LeadEmailTab({
  data,
  actions,
}: {
  data: LeadWorkspaceData;
  actions: LeadWorkspaceActions;
}) {
  return (
    <LeadEmailCard
      subject={data.emailSubject}
      body={data.emailBody}
      hasInsight={data.hasInsight}
      isBusy={data.isLoadingAiInsight || data.isGeneratingAiInsight}
      canRegenerate={data.canGenerate}
      onCopySubject={actions.onCopySubject}
      onCopyEmail={actions.onCopyEmail}
      onRegenerate={actions.onGenerate}
    />
  );
}
