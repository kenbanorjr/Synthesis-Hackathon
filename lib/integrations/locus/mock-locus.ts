import crypto from "node:crypto";
import type {
  LocusAdapter,
  LocusBudgetSnapshot,
  LocusPurchaseRequest,
  LocusPurchaseResult,
  LocusTransaction
} from "@/lib/integrations/locus/types";

export class MockLocusAdapter implements LocusAdapter {
  async health() {
    return {
      ok: true,
      mode: "mock" as const,
      message: "Mock Locus budget and receipt engine is active."
    };
  }

  async createManagedWalletRef(userId: string) {
    return `locus-demo-${userId.slice(0, 8)}`;
  }

  async getBudgetSnapshot(input: {
    managedWalletRef: string;
    monthlyBudgetUsd: number;
    spentThisMonthUsd: number;
    maxSpendPerActionUsd: number;
    approvalThresholdUsd: number;
  }): Promise<LocusBudgetSnapshot> {
    return {
      managedWalletRef: input.managedWalletRef,
      monthlyBudgetUsd: input.monthlyBudgetUsd,
      spentThisMonthUsd: input.spentThisMonthUsd,
      remainingBudgetUsd: Math.max(input.monthlyBudgetUsd - input.spentThisMonthUsd, 0),
      maxSpendPerActionUsd: input.maxSpendPerActionUsd,
      approvalThresholdUsd: input.approvalThresholdUsd
    };
  }

  async purchaseData(request: LocusPurchaseRequest): Promise<LocusPurchaseResult> {
    if (!request.allowedProviders.includes(request.provider)) {
      return {
        provider: request.provider,
        purpose: request.purpose,
        amountUsd: request.amountUsd,
        currency: "USD",
        status: "rejected",
        reason: "Provider is not on the approved whitelist.",
        metadata: request.metadata
      };
    }

    if (request.amountUsd > request.budgetSnapshot.maxSpendPerActionUsd) {
      return {
        provider: request.provider,
        purpose: request.purpose,
        amountUsd: request.amountUsd,
        currency: "USD",
        status: "rejected",
        reason: "Requested spend exceeds the max spend per action.",
        metadata: request.metadata
      };
    }

    if (request.amountUsd > request.budgetSnapshot.remainingBudgetUsd) {
      return {
        provider: request.provider,
        purpose: request.purpose,
        amountUsd: request.amountUsd,
        currency: "USD",
        status: "rejected",
        reason: "Requested spend exceeds the remaining monthly budget.",
        metadata: request.metadata
      };
    }

    if (request.amountUsd > request.budgetSnapshot.approvalThresholdUsd) {
      return {
        provider: request.provider,
        purpose: request.purpose,
        amountUsd: request.amountUsd,
        currency: "USD",
        status: "pending_approval",
        reason: "Purchase is within budget but requires approval.",
        externalTxId: `locus-pending-${crypto.randomUUID()}`,
        metadata: {
          ...request.metadata,
          managedWalletRef: request.budgetSnapshot.managedWalletRef
        }
      };
    }

    return {
      provider: request.provider,
      purpose: request.purpose,
      amountUsd: request.amountUsd,
      currency: "USD",
      status: "completed",
      reason: request.reason,
      externalTxId: `locus-tx-${crypto.randomUUID()}`,
      metadata: {
        ...request.metadata,
        managedWalletRef: request.budgetSnapshot.managedWalletRef
      }
    };
  }

  async listTransactions(input: { managedWalletRef: string; receipts?: LocusTransaction[] }) {
    return input.receipts ?? [];
  }
}
