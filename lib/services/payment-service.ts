import { Prisma, ReceiptStatus, type IntegrationSettings, type TreasuryPolicy } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getLocusAdapter } from "@/lib/integrations/locus";
import type { LocusPurchaseResult } from "@/lib/integrations/locus/types";
import { decimalToNumber, serializeReceipt } from "@/lib/serializers";

function startOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0));
}

export async function getMonthlySpentUsd(organizationId: string) {
  const aggregate = await prisma.paymentReceipt.aggregate({
    where: {
      agentRun: { organizationId },
      status: ReceiptStatus.COMPLETED,
      createdAt: { gte: startOfMonth() }
    },
    _sum: {
      amountUsd: true
    }
  });

  return aggregate._sum.amountUsd ? aggregate._sum.amountUsd.toNumber() : 0;
}

export async function getBudgetSnapshot(policy: TreasuryPolicy, settings: IntegrationSettings, organizationId: string) {
  const adapter = getLocusAdapter(settings.locusMode);
  const managedWalletRef = settings.managedWalletRef ?? (await adapter.createManagedWalletRef(organizationId));
  const spentThisMonthUsd = await getMonthlySpentUsd(organizationId);

  const snapshot = await adapter.getBudgetSnapshot({
    managedWalletRef,
    monthlyBudgetUsd: decimalToNumber(policy.monthlyBudgetUsd),
    spentThisMonthUsd,
    maxSpendPerActionUsd: decimalToNumber(policy.maxSpendPerActionUsd),
    approvalThresholdUsd: decimalToNumber(policy.approvalThresholdUsd)
  });

  if (settings.managedWalletRef !== managedWalletRef) {
    await prisma.integrationSettings.update({
      where: { id: settings.id },
      data: { managedWalletRef }
    });
  }

  return snapshot;
}

export async function purchasePremiumAnalytics(input: {
  agentRunId: string;
  organizationId: string;
  policy: TreasuryPolicy;
  settings: IntegrationSettings;
  provider: string;
  purpose: string;
  amountUsd: number;
  reason: string;
  metadata?: Record<string, unknown>;
}) {
  const adapter = getLocusAdapter(input.settings.locusMode);
  const budgetSnapshot = await getBudgetSnapshot(input.policy, input.settings, input.organizationId);
  const result = await adapter.purchaseData({
    provider: input.provider,
    purpose: input.purpose,
    amountUsd: input.amountUsd,
    reason: input.reason,
    allowedProviders: input.policy.allowedProviders,
    budgetSnapshot,
    metadata: input.metadata
  });

  const receipt = await prisma.paymentReceipt.create({
    data: {
      agentRunId: input.agentRunId,
      provider: result.provider,
      purpose: result.purpose,
      amountUsd: result.amountUsd,
      currency: result.currency,
      status:
        result.status === "completed"
          ? ReceiptStatus.COMPLETED
          : result.status === "pending_approval"
            ? ReceiptStatus.PENDING_APPROVAL
            : result.status === "rejected"
              ? ReceiptStatus.REJECTED
              : ReceiptStatus.FAILED,
      externalTxId: result.externalTxId,
      reason: result.reason,
      metadata: (result.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull
    }
  });

  return {
    result,
    receipt: serializeReceipt(receipt),
    budgetSnapshot
  };
}

export async function listReceiptsForOrganization(organizationId: string, limit = 20) {
  const receipts = await prisma.paymentReceipt.findMany({
    where: {
      agentRun: {
        organizationId
      }
    },
    include: {
      agentRun: {
        include: {
          strategy: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return receipts.map((receipt) => ({
    ...serializeReceipt(receipt),
    run: {
      id: receipt.agentRun.id,
      triggerSummary: receipt.agentRun.triggerSummary,
      finalDecision: receipt.agentRun.finalDecision,
      strategyName: receipt.agentRun.strategy.name
    }
  }));
}

export function purchaseNeedsApproval(result: LocusPurchaseResult) {
  return result.status === "pending_approval";
}
