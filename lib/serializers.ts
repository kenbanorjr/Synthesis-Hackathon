import {
  ActionType,
  ApprovalStatus,
  DecisionOutcome,
  ExecutionMode,
  ExecutionStatus,
  Prisma,
  ReceiptStatus,
  RunStatus,
  StrategyStatus,
  TriggerType,
  type AgentRun,
  type AgentStep,
  type ApprovalRequest,
  type ExecutionRecord,
  type IntegrationSettings,
  type MonitoredStrategy,
  type PaymentReceipt,
  type Recommendation,
  type TreasuryPolicy
} from "@prisma/client";

export function decimalToNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number.parseFloat(value);
  }

  return value.toNumber();
}

export function serializePolicy(policy: TreasuryPolicy) {
  return {
    id: policy.id,
    monthlyBudgetUsd: decimalToNumber(policy.monthlyBudgetUsd),
    maxSpendPerActionUsd: decimalToNumber(policy.maxSpendPerActionUsd),
    approvalThresholdUsd: decimalToNumber(policy.approvalThresholdUsd),
    allowedProviders: policy.allowedProviders,
    allowedActions: policy.allowedActions,
    autoExecuteLowRisk: policy.autoExecuteLowRisk,
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString()
  };
}

export function serializeStrategy(strategy: MonitoredStrategy) {
  return {
    id: strategy.id,
    name: strategy.name,
    protocol: strategy.protocol,
    network: strategy.network,
    assetSymbol: strategy.assetSymbol,
    currentYield: decimalToNumber(strategy.currentYield),
    targetYield: decimalToNumber(strategy.targetYield),
    riskScore: decimalToNumber(strategy.riskScore),
    status: strategy.status as StrategyStatus,
    metadata: strategy.metadata,
    createdAt: strategy.createdAt.toISOString(),
    updatedAt: strategy.updatedAt.toISOString()
  };
}

export function serializeStep(step: AgentStep) {
  return {
    id: step.id,
    agentType: step.agentType,
    title: step.title,
    status: step.status,
    input: step.input,
    output: step.output,
    createdAt: step.createdAt.toISOString()
  };
}

export function serializeReceipt(receipt: PaymentReceipt) {
  return {
    id: receipt.id,
    provider: receipt.provider,
    purpose: receipt.purpose,
    amountUsd: decimalToNumber(receipt.amountUsd),
    currency: receipt.currency,
    status: receipt.status as ReceiptStatus,
    externalTxId: receipt.externalTxId,
    reason: receipt.reason,
    metadata: receipt.metadata,
    createdAt: receipt.createdAt.toISOString()
  };
}

export function serializeRecommendation(recommendation: Recommendation | null) {
  if (!recommendation) {
    return null;
  }

  return {
    id: recommendation.id,
    headline: recommendation.headline,
    rationale: recommendation.rationale,
    proposedAction: recommendation.proposedAction,
    expectedImpact: recommendation.expectedImpact,
    riskAssessment: recommendation.riskAssessment,
    createdAt: recommendation.createdAt.toISOString()
  };
}

export function serializeApproval(approval: ApprovalRequest | null) {
  if (!approval) {
    return null;
  }

  return {
    id: approval.id,
    title: approval.title,
    reason: approval.reason,
    status: approval.status as ApprovalStatus,
    requestedAt: approval.requestedAt.toISOString(),
    resolvedAt: approval.resolvedAt?.toISOString() ?? null
  };
}

export function serializeExecutionRecord(record: ExecutionRecord) {
  return {
    id: record.id,
    actionType: record.actionType as ActionType,
    provider: record.provider,
    chain: record.chain,
    assetSymbol: record.assetSymbol,
    destination: record.destination,
    amountUsd: decimalToNumber(record.amountUsd),
    mode: record.mode as ExecutionMode,
    status: record.status as ExecutionStatus,
    dryRun: record.dryRun,
    idempotencyKey: record.idempotencyKey,
    externalTxId: record.externalTxId,
    rationale: record.rationale,
    metadata: record.metadata,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function serializeRun(
  run: AgentRun & {
    steps?: AgentStep[];
    receipts?: PaymentReceipt[];
    recommendation?: Recommendation | null;
    approvalRequest?: ApprovalRequest | null;
    strategy?: MonitoredStrategy;
    executionRecords?: ExecutionRecord[];
  }
) {
  return {
    id: run.id,
    strategyId: run.strategyId,
    triggerType: run.triggerType as TriggerType,
    triggerSummary: run.triggerSummary,
    status: run.status as RunStatus,
    requiresApproval: run.requiresApproval,
    finalDecision: run.finalDecision as DecisionOutcome,
    confidenceScore: decimalToNumber(run.confidenceScore),
    createdAt: run.createdAt.toISOString(),
    completedAt: run.completedAt?.toISOString() ?? null,
    strategy: run.strategy ? serializeStrategy(run.strategy) : null,
    steps: run.steps?.map(serializeStep) ?? [],
    receipts: run.receipts?.map(serializeReceipt) ?? [],
    recommendation: serializeRecommendation(run.recommendation ?? null),
    approvalRequest: serializeApproval(run.approvalRequest ?? null),
    executionRecords: run.executionRecords?.map(serializeExecutionRecord) ?? []
  };
}

export function serializeIntegrationSettings(settings: IntegrationSettings) {
  return {
    id: settings.id,
    openservMode: settings.openservMode,
    locusMode: settings.locusMode,
    demoMode: settings.demoMode,
    managedWalletRef: settings.managedWalletRef,
    openservAgentId: settings.openservAgentId,
    openservEndpoint: settings.openservEndpoint,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString()
  };
}

export function actionLabel(action: ActionType) {
  return action
    .split("_")
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(" ");
}
