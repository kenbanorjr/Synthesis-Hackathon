import { ActionType, type TreasuryPolicy } from "@prisma/client";
import { prisma } from "@/lib/db";
import { decimalToNumber, serializePolicy } from "@/lib/serializers";
import { type PolicyInput } from "@/lib/validators/policy";

export interface PolicyGuardrailInput {
  policy: TreasuryPolicy;
  monthlySpentUsd: number;
  premiumDataCostUsd: number;
  executionCostUsd: number;
  provider?: string;
  actionType: ActionType;
  lowRisk: boolean;
}

export interface PolicyGuardrailResult {
  allowed: boolean;
  requiresApproval: boolean;
  canAutoExecute: boolean;
  violations: string[];
  approvalReasons: string[];
  remainingBudgetUsd: number;
}

export async function getPolicyForUser(userId: string) {
  const policy = await prisma.treasuryPolicy.findUnique({
    where: { userId }
  });

  if (!policy) {
    throw new Error("Treasury policy not found.");
  }

  return policy;
}

export async function upsertPolicy(userId: string, input: PolicyInput) {
  const policy = await prisma.treasuryPolicy.upsert({
    where: { userId },
    update: {
      monthlyBudgetUsd: input.monthlyBudgetUsd,
      maxSpendPerActionUsd: input.maxSpendPerActionUsd,
      approvalThresholdUsd: input.approvalThresholdUsd,
      allowedProviders: input.allowedProviders,
      allowedActions: input.allowedActions,
      autoExecuteLowRisk: input.autoExecuteLowRisk
    },
    create: {
      userId,
      monthlyBudgetUsd: input.monthlyBudgetUsd,
      maxSpendPerActionUsd: input.maxSpendPerActionUsd,
      approvalThresholdUsd: input.approvalThresholdUsd,
      allowedProviders: input.allowedProviders,
      allowedActions: input.allowedActions,
      autoExecuteLowRisk: input.autoExecuteLowRisk
    }
  });

  return serializePolicy(policy);
}

export function evaluatePolicyGuardrails(input: PolicyGuardrailInput): PolicyGuardrailResult {
  const policy = input.policy;
  const remainingBudgetUsd = Math.max(decimalToNumber(policy.monthlyBudgetUsd) - input.monthlySpentUsd, 0);
  const maxSpendPerActionUsd = decimalToNumber(policy.maxSpendPerActionUsd);
  const approvalThresholdUsd = decimalToNumber(policy.approvalThresholdUsd);
  const violations: string[] = [];
  const approvalReasons: string[] = [];

  if (input.provider && !policy.allowedProviders.includes(input.provider)) {
    violations.push(`Provider ${input.provider} is not approved by treasury policy.`);
  }

  if (!policy.allowedActions.includes(input.actionType)) {
    violations.push(`Action ${input.actionType} is not whitelisted.`);
  }

  if (input.premiumDataCostUsd > maxSpendPerActionUsd) {
    violations.push("Premium data purchase exceeds the max spend per action.");
  }

  if (input.executionCostUsd > maxSpendPerActionUsd) {
    violations.push("Suggested execution exceeds the max spend per action.");
  }

  if (input.monthlySpentUsd + input.premiumDataCostUsd > decimalToNumber(policy.monthlyBudgetUsd)) {
    violations.push("Premium data purchase would exceed the monthly budget.");
  }

  if (input.premiumDataCostUsd > approvalThresholdUsd) {
    approvalReasons.push("Premium data purchase exceeds the approval threshold.");
  }

  if (input.executionCostUsd > approvalThresholdUsd) {
    approvalReasons.push("Suggested execution exceeds the approval threshold.");
  }

  if (!input.lowRisk) {
    approvalReasons.push("Risk agent marked the action as non-low-risk.");
  }

  const allowed = violations.length === 0;
  const requiresApproval = approvalReasons.length > 0;
  const canAutoExecute = allowed && !requiresApproval && policy.autoExecuteLowRisk && input.lowRisk;

  return {
    allowed,
    requiresApproval,
    canAutoExecute,
    violations,
    approvalReasons,
    remainingBudgetUsd
  };
}
