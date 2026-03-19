import {
  ActionType,
  AgentType,
  DecisionOutcome,
  Prisma,
  RunStatus,
  StepStatus,
  TriggerType
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getOpportunityCatalog } from "@/lib/services/opportunity-catalog";
import { purchaseNeedsApproval, purchasePremiumAnalytics, getMonthlySpentUsd } from "@/lib/services/payment-service";
import { evaluatePolicyGuardrails } from "@/lib/services/policy-service";
import { getStrategyById } from "@/lib/services/strategy-service";
import { runWorkflowEngine } from "@/lib/services/workflow-engine";
import { decimalToNumber, serializeRun } from "@/lib/serializers";

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function createStep(input: {
  agentRunId: string;
  agentType: AgentType;
  title: string;
  input?: Prisma.InputJsonValue;
  output?: Prisma.InputJsonValue;
  status?: StepStatus;
}) {
  return prisma.agentStep.create({
    data: {
      agentRunId: input.agentRunId,
      agentType: input.agentType,
      title: input.title,
      input: input.input ?? Prisma.JsonNull,
      output: input.output ?? Prisma.JsonNull,
      status: input.status ?? StepStatus.SUCCESS
    }
  });
}

export function resolveWorkflowOutcome(input: {
  triggerDetected: boolean;
  purchaseBlocked: boolean;
  actionAllowed: boolean;
  requiresApproval: boolean;
  canAutoExecute: boolean;
  actionType: ActionType;
}) {
  let finalDecision: DecisionOutcome = DecisionOutcome.RECOMMENDED;
  let runStatus: RunStatus = RunStatus.COMPLETED;

  if (!input.triggerDetected) {
    finalDecision = DecisionOutcome.NO_ACTION;
  } else if (input.purchaseBlocked || !input.actionAllowed) {
    finalDecision = DecisionOutcome.BLOCKED;
    runStatus = RunStatus.BLOCKED;
  } else if (input.requiresApproval) {
    finalDecision = DecisionOutcome.AWAITING_APPROVAL;
    runStatus = RunStatus.AWAITING_APPROVAL;
  } else if (input.canAutoExecute && input.actionType !== ActionType.BUY_ANALYTICS) {
    finalDecision = DecisionOutcome.EXECUTED;
  }

  return {
    finalDecision,
    runStatus
  };
}

export async function runAgentWorkflow(input: {
  organizationId: string;
  initiatedByUserId?: string;
  strategyId?: string;
  triggerType?: TriggerType;
}) {
  const [policy, settings, strategy] = await Promise.all([
    prisma.treasuryPolicy.findUnique({
      where: { organizationId: input.organizationId }
    }),
    prisma.integrationSettings.findUnique({
      where: { organizationId: input.organizationId }
    }),
    input.strategyId
      ? getStrategyById(input.organizationId, input.strategyId)
      : prisma.monitoredStrategy.findFirst({
          where: { organizationId: input.organizationId },
          orderBy: { updatedAt: "desc" }
        })
  ]);

  if (!strategy) {
    throw new Error("No monitored strategy found.");
  }

  if (!policy || !settings) {
    throw new Error("Organization is missing treasury policy or integration settings.");
  }

  const opportunities = getOpportunityCatalog(strategy);
  const monthlySpentUsd = await getMonthlySpentUsd(input.organizationId);
  const workflow = await runWorkflowEngine({
    strategy: {
      id: strategy.id,
      name: strategy.name,
      protocol: strategy.protocol,
      network: strategy.network,
      assetSymbol: strategy.assetSymbol,
      currentYield: decimalToNumber(strategy.currentYield),
      targetYield: decimalToNumber(strategy.targetYield),
      riskScore: decimalToNumber(strategy.riskScore)
    },
    policy: {
      allowedProviders: policy.allowedProviders,
      allowedActions: policy.allowedActions,
      autoExecuteLowRisk: policy.autoExecuteLowRisk,
      approvalThresholdUsd: decimalToNumber(policy.approvalThresholdUsd)
    },
    opportunities,
    monthlySpentUsd,
    triggerHint: input.triggerType
  });

  const run = await prisma.agentRun.create({
    data: {
      organizationId: input.organizationId,
      strategyId: strategy.id,
      initiatedByUserId: input.initiatedByUserId,
      triggerType: workflow.monitor.triggerType,
      triggerSummary: workflow.monitor.summary,
      status: RunStatus.RUNNING,
      requiresApproval: false,
      finalDecision: DecisionOutcome.NO_ACTION,
      confidenceScore: new Prisma.Decimal(workflow.execution.confidenceScore)
    }
  });

  await createStep({
    agentRunId: run.id,
    agentType: AgentType.MONITOR,
    title: "Monitor Agent evaluated the treasury strategy.",
    input: {
      currentYield: decimalToNumber(strategy.currentYield),
      targetYield: decimalToNumber(strategy.targetYield),
      riskScore: decimalToNumber(strategy.riskScore)
    },
    output: toJson(workflow.monitor)
  });

  let purchase = null as
    | Awaited<ReturnType<typeof purchasePremiumAnalytics>>
    | null;

  if (workflow.research.premiumDataRequest) {
    purchase = await purchasePremiumAnalytics({
      agentRunId: run.id,
      organizationId: input.organizationId,
      policy,
      settings,
      provider: workflow.research.premiumDataRequest.provider,
      endpoint: workflow.research.premiumDataRequest.endpoint,
      purpose: workflow.research.premiumDataRequest.purpose,
      estimatedCostUsd: workflow.research.premiumDataRequest.estimatedCostUsd,
      reason: workflow.research.premiumDataRequest.reason,
      requestBody: workflow.research.premiumDataRequest.requestBody,
      metadata: {
        ...workflow.research.premiumDataRequest.metadata,
        source: "research-agent",
        selectedOpportunity: workflow.research.selectedOpportunity?.id ?? null
      }
    });
  }

  await createStep({
    agentRunId: run.id,
    agentType: AgentType.RESEARCH,
    title: "Research Agent compared opportunities and optionally bought analytics.",
    input: {
      opportunityCount: opportunities.length,
      allowedProviders: policy.allowedProviders
    },
    output: toJson({
      ...workflow.research,
      purchaseReceipt: purchase?.receipt ?? null
    })
  });

  const guardrails = evaluatePolicyGuardrails({
    policy,
    monthlySpentUsd,
    premiumDataCostUsd: workflow.research.premiumDataRequest?.estimatedCostUsd ?? 0,
    executionCostUsd: workflow.execution.estimatedCostUsd,
    provider: workflow.research.premiumDataRequest?.provider,
    actionType: workflow.execution.actionType,
    lowRisk: workflow.risk.lowRisk
  });

  await createStep({
    agentRunId: run.id,
    agentType: AgentType.RISK,
    title: "Risk Agent validated policy boundaries and execution safety.",
    input: {
      monthlySpentUsd,
      maxSpendPerActionUsd: decimalToNumber(policy.maxSpendPerActionUsd),
      approvalThresholdUsd: decimalToNumber(policy.approvalThresholdUsd)
    },
    output: toJson({
      ...workflow.risk,
      guardrails
    })
  });

  const purchaseApprovalRequired = purchase ? purchaseNeedsApproval(purchase.result) : false;
  const purchaseBlocked = purchase?.result.status === "rejected" || purchase?.result.status === "failed";
  const actionAllowed = guardrails.allowed;
  const requiresApproval = purchaseApprovalRequired || guardrails.requiresApproval;
  const { finalDecision, runStatus } = resolveWorkflowOutcome({
    triggerDetected: workflow.monitor.triggerDetected,
    purchaseBlocked,
    actionAllowed,
    requiresApproval,
    canAutoExecute: guardrails.canAutoExecute,
    actionType: workflow.execution.actionType
  });

  const recommendation = await prisma.recommendation.create({
    data: {
      agentRunId: run.id,
      headline: workflow.explainer.headline,
      rationale: workflow.explainer.summary,
      proposedAction: workflow.execution.summary,
      expectedImpact: workflow.execution.expectedImpact,
      riskAssessment: [
        workflow.risk.summary,
        ...guardrails.violations,
        ...guardrails.approvalReasons
      ].join(" ")
    }
  });

  if (finalDecision === DecisionOutcome.AWAITING_APPROVAL) {
    await prisma.approvalRequest.create({
      data: {
        agentRunId: run.id,
        title: `Approval required for ${workflow.execution.actionType.toLowerCase()}`,
        reason: [...guardrails.approvalReasons, purchase?.result.reason].filter(Boolean).join(" ")
      }
    });
  }

  await createStep({
    agentRunId: run.id,
    agentType: AgentType.EXECUTION,
    title: "Execution Agent finalized the bounded action plan.",
    input: {
      actionType: workflow.execution.actionType,
      targetProtocol: workflow.execution.targetProtocol,
      estimatedCostUsd: workflow.execution.estimatedCostUsd
    },
    output: toJson({
      ...workflow.execution,
      finalDecision,
      purchaseStatus: purchase?.result.status ?? "not_requested"
    }),
    status: finalDecision === DecisionOutcome.BLOCKED ? StepStatus.FAILED : StepStatus.SUCCESS
  });

  await createStep({
    agentRunId: run.id,
    agentType: AgentType.EXPLAINER,
    title: "Explainer Agent prepared the operator-facing narrative.",
    input: {
      decision: finalDecision,
      recommendationId: recommendation.id
    },
    output: toJson(workflow.explainer)
  });

  const completedAt = runStatus === RunStatus.AWAITING_APPROVAL ? null : new Date();

  const finalizedRun = await prisma.agentRun.update({
    where: { id: run.id },
    data: {
      status: runStatus,
      requiresApproval,
      finalDecision,
      completedAt
    },
    include: {
      strategy: true,
      steps: { orderBy: { createdAt: "asc" } },
      receipts: { orderBy: { createdAt: "desc" } },
      recommendation: true,
      approvalRequest: true,
      executionRecords: { orderBy: { createdAt: "desc" } }
    }
  });

  return serializeRun(finalizedRun);
}

export async function listAgentRuns(organizationId: string) {
  const runs = await prisma.agentRun.findMany({
    where: { organizationId },
    include: {
      strategy: true,
      steps: { orderBy: { createdAt: "asc" } },
      receipts: { orderBy: { createdAt: "desc" } },
      recommendation: true,
      approvalRequest: true,
      executionRecords: { orderBy: { createdAt: "desc" } }
    },
    orderBy: { createdAt: "desc" }
  });

  return runs.map(serializeRun);
}

export async function runDemoScenario(organizationId: string, initiatedByUserId?: string) {
  return runAgentWorkflow({
    organizationId,
    initiatedByUserId,
    triggerType: TriggerType.YIELD_DROP
  });
}
