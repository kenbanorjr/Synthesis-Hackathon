import type { IntegrationHealth } from "@/lib/integrations/openserv/types";

export interface LocusBudgetSnapshot {
  managedWalletRef: string;
  monthlyBudgetUsd: number;
  spentThisMonthUsd: number;
  remainingBudgetUsd: number;
  maxSpendPerActionUsd: number;
  approvalThresholdUsd: number;
}

export interface LocusPurchaseRequest {
  provider: string;
  endpoint: string;
  purpose: string;
  estimatedCostUsd: number;
  reason: string;
  allowedProviders: string[];
  budgetSnapshot: LocusBudgetSnapshot;
  requestBody: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface LocusPurchaseResult {
  provider: string;
  endpoint: string;
  purpose: string;
  amountUsd: number;
  currency: "USD";
  status: "completed" | "pending_approval" | "rejected" | "failed";
  reason: string;
  externalTxId?: string;
  metadata?: Record<string, unknown>;
}

export interface LocusTransaction {
  id: string;
  provider: string;
  purpose: string;
  amountUsd: number;
  status: string;
  createdAt: string;
}

export interface LocusAdapter {
  health(): Promise<IntegrationHealth>;
  createManagedWalletRef(userId: string): Promise<string>;
  getBudgetSnapshot(input: {
    managedWalletRef: string;
    monthlyBudgetUsd: number;
    spentThisMonthUsd: number;
    maxSpendPerActionUsd: number;
    approvalThresholdUsd: number;
  }): Promise<LocusBudgetSnapshot>;
  purchaseData(request: LocusPurchaseRequest): Promise<LocusPurchaseResult>;
  listTransactions(input: { managedWalletRef: string; receipts?: LocusTransaction[] }): Promise<LocusTransaction[]>;
}
