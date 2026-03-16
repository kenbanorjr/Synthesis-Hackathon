import { MockLocusAdapter } from "@/lib/integrations/locus/mock-locus";
import type {
  LocusAdapter,
  LocusBudgetSnapshot,
  LocusPurchaseRequest,
  LocusPurchaseResult,
  LocusTransaction
} from "@/lib/integrations/locus/types";

export class RealLocusAdapter implements LocusAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly fallback = new MockLocusAdapter()
  ) {}

  async health() {
    if (!this.baseUrl || !this.apiKey) {
      return this.fallback.health();
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        },
        cache: "no-store"
      });

      if (!response.ok) {
        return {
          ok: false,
          mode: "real" as const,
          message: "Locus endpoint is configured but unhealthy."
        };
      }

      return {
        ok: true,
        mode: "real" as const,
        message: "Locus endpoint is reachable."
      };
    } catch {
      return this.fallback.health();
    }
  }

  async createManagedWalletRef(userId: string) {
    if (!this.baseUrl || !this.apiKey) {
      return this.fallback.createManagedWalletRef(userId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        return this.fallback.createManagedWalletRef(userId);
      }

      const payload = (await response.json()) as { walletRef?: string };
      return payload.walletRef ?? this.fallback.createManagedWalletRef(userId);
    } catch {
      return this.fallback.createManagedWalletRef(userId);
    }
  }

  async getBudgetSnapshot(input: {
    managedWalletRef: string;
    monthlyBudgetUsd: number;
    spentThisMonthUsd: number;
    maxSpendPerActionUsd: number;
    approvalThresholdUsd: number;
  }): Promise<LocusBudgetSnapshot> {
    if (!this.baseUrl || !this.apiKey) {
      return this.fallback.getBudgetSnapshot(input);
    }

    try {
      const response = await fetch(`${this.baseUrl}/budgets/snapshot`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        return this.fallback.getBudgetSnapshot(input);
      }

      return (await response.json()) as LocusBudgetSnapshot;
    } catch {
      return this.fallback.getBudgetSnapshot(input);
    }
  }

  async purchaseData(request: LocusPurchaseRequest): Promise<LocusPurchaseResult> {
    if (!this.baseUrl || !this.apiKey) {
      return this.fallback.purchaseData(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/purchases`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        return this.fallback.purchaseData(request);
      }

      return (await response.json()) as LocusPurchaseResult;
    } catch {
      return this.fallback.purchaseData(request);
    }
  }

  async listTransactions(input: { managedWalletRef: string; receipts?: LocusTransaction[] }) {
    if (!this.baseUrl || !this.apiKey) {
      return this.fallback.listTransactions(input);
    }

    try {
      const response = await fetch(`${this.baseUrl}/transactions?walletRef=${input.managedWalletRef}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        },
        cache: "no-store"
      });

      if (!response.ok) {
        return this.fallback.listTransactions(input);
      }

      return (await response.json()) as LocusTransaction[];
    } catch {
      return this.fallback.listTransactions(input);
    }
  }
}
