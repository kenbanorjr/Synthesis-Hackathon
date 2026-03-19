import { ActionType, TriggerType } from "@prisma/client";
import type { OpportunitySnapshot } from "@/lib/services/opportunity-catalog";

export interface OpenServWorkflowInput {
  strategy: {
    id: string;
    name: string;
    protocol: string;
    network: string;
    assetSymbol: string;
    currentYield: number;
    targetYield: number;
    riskScore: number;
  };
  policy: {
    allowedProviders: string[];
    allowedActions: ActionType[];
    autoExecuteLowRisk: boolean;
    approvalThresholdUsd: number;
  };
  opportunities: OpportunitySnapshot[];
  monthlySpentUsd: number;
  triggerHint?: TriggerType;
}

export interface MonitorAgentOutput {
  triggerDetected: boolean;
  triggerType: TriggerType;
  summary: string;
  severity: "low" | "medium" | "high";
}

export interface ResearchPremiumDataRequest {
  provider: string;
  endpoint: string;
  purpose: string;
  reason: string;
  estimatedCostUsd: number;
  requestBody: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ResearchAgentOutput {
  summary: string;
  premiumDataRequest?: ResearchPremiumDataRequest;
  comparedOptions: OpportunitySnapshot[];
  selectedOpportunity: OpportunitySnapshot | null;
}

export interface RiskAgentOutput {
  summary: string;
  lowRisk: boolean;
  riskScore: number;
  watchouts: string[];
}

export interface ExecutionAgentOutput {
  summary: string;
  actionType: ActionType;
  targetProtocol: string;
  estimatedCostUsd: number;
  expectedImpact: string;
  confidenceScore: number;
}

export interface ExplainerAgentOutput {
  headline: string;
  summary: string;
  bullets: string[];
}

export interface OpenServWorkflowOutput {
  monitor: MonitorAgentOutput;
  research: ResearchAgentOutput;
  risk: RiskAgentOutput;
  execution: ExecutionAgentOutput;
  explainer: ExplainerAgentOutput;
}

export interface IntegrationHealth {
  ok: boolean;
  mode: "mock" | "real";
  message: string;
}

export interface OpenServAdapter {
  health(): Promise<IntegrationHealth>;
  runWorkflow(input: OpenServWorkflowInput): Promise<OpenServWorkflowOutput>;
}
