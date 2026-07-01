import type { ReactNode } from "react";
import type { LeadPriority, LeadStage } from "~/data/admin";
import type { RecommendedPackageName } from "~/components/admin/leads/LeadRecommendedPackage";
import type { LeadScoreBreakdownItem } from "~/components/admin/leads/LeadScoreBreakdown";

export type LeadWorkspaceTabId = "overview" | "ai-pitch" | "email" | "audit" | "score" | "technical";

export type LeadIssue = {
  label: string;
  tooltip: string;
};

export type LeadDetail = {
  label: string;
  value: string;
  href?: string;
};

export type LeadAuditSummary = {
  seoScore: number | null;
  performanceScore: number | null;
  accessibilityScore: number | null;
  statusCode: number | null;
  hasSsl: boolean | null;
  hasTitle: boolean | null;
  hasMetaDescription: boolean | null;
  hasRobotsTxt: boolean | null;
  hasSitemap: boolean | null;
  summary: string | null;
  createdAt: string | null;
  rawFields: LeadDetail[];
};

export type LeadWorkspaceData = {
  companyName: string;
  location: string;
  status: LeadStage;
  priority: LeadPriority;
  score: number;
  badges: ReactNode;
  websiteUrl: string | null;
  summary: string;
  opportunityTitle: string;
  recommendedService: string;
  estimatedValue: string;
  nextAction: string;
  salesAngle: string;
  emailSubject: string;
  emailBody: string;
  aiInsightCreatedAt: string | null;
  packageName: RecommendedPackageName;
  packageReason: string;
  confidence: {
    score: number;
    label: string;
  };
  closeProbability: number;
  stars: number;
  scoreBreakdown: LeadScoreBreakdownItem[];
  topIssues: LeadIssue[];
  technicalDetails: LeadDetail[];
  rawDetails: LeadDetail[];
  audit: LeadAuditSummary | null;
  isLoadingAiInsight: boolean;
  isGeneratingAiInsight: boolean;
  aiInsightError: string | null;
  copiedMessage: string | null;
  hasInsight: boolean;
  canGenerate: boolean;
};

export type LeadWorkspaceActions = {
  onCopySubject: () => void;
  onCopyEmail: () => void;
  onGenerate: () => void;
  onRefresh: () => void;
  onAudit: () => void;
  onQualify: () => void;
};
