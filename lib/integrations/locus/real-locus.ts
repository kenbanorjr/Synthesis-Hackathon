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
      return {
        ok: false,
        mode: "real" as const,
        message: "Locus is in real mode but the API key or base URL is missing."
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/wrapped`, {
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
        message: "Locus wrapped API catalog is reachable."
      };
    } catch {
      return {
        ok: false,
        mode: "real" as const,
        message: "Locus wrapped API catalog could not be reached."
      };
    }
  }

  async createManagedWalletRef(userId: string) {
    return `locus-agent-${userId.slice(0, 8)}`;
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
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("Locus is in real mode but is missing API configuration.");
    }

    try {
      const catalogResponse = await fetch(`${this.baseUrl}/wrapped`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        },
        cache: "no-store"
      });

      if (!catalogResponse.ok) {
        throw new Error(`Failed to load Locus provider catalog (${catalogResponse.status}).`);
      }

      const catalogPayload = (await catalogResponse.json()) as {
        data?: {
          endpoints?: string[];
        };
      };
      const requestedPath = `${request.provider}/${request.endpoint}`;
      const availableEndpoints = catalogPayload.data?.endpoints ?? [];

      if (!availableEndpoints.includes(requestedPath)) {
        return {
          provider: request.provider,
          endpoint: request.endpoint,
          purpose: request.purpose,
          amountUsd: request.estimatedCostUsd,
          currency: "USD",
          status: "rejected",
          reason: `${requestedPath} is not enabled for this Locus agent.`,
          metadata: {
            ...request.metadata,
            endpoint: request.endpoint,
            transport: "locus-wrapped-api"
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/wrapped/${requestedPath}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request.requestBody)
      });

      let payload: Record<string, unknown> | null = null;

      try {
        payload = (await response.json()) as Record<string, unknown>;
      } catch {
        payload = null;
      }

      const responseData =
        payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
          ? (payload.data as Record<string, unknown>)
          : null;
      const metadata = {
        ...request.metadata,
        endpoint: request.endpoint,
        managedWalletRef: request.budgetSnapshot.managedWalletRef,
        requestBody: request.requestBody,
        responseData,
        transport: "locus-wrapped-api"
      };

      if (response.status === 202) {
        return {
          provider: request.provider,
          endpoint: request.endpoint,
          purpose: request.purpose,
          amountUsd: Number(responseData?.estimated_cost_usdc ?? request.estimatedCostUsd),
          currency: "USD",
          status: "pending_approval",
          reason:
            typeof responseData?.message === "string"
              ? responseData.message
              : "The wrapped API call is waiting for Locus approval.",
          externalTxId:
            typeof responseData?.pending_approval_id === "string" ? responseData.pending_approval_id : undefined,
          metadata: {
            ...metadata,
            approvalUrl: typeof responseData?.approval_url === "string" ? responseData.approval_url : undefined,
            pendingApprovalId:
              typeof responseData?.pending_approval_id === "string" ? responseData.pending_approval_id : undefined
          }
        };
      }

      if (response.status === 403) {
        return {
          provider: request.provider,
          endpoint: request.endpoint,
          purpose: request.purpose,
          amountUsd: request.estimatedCostUsd,
          currency: "USD",
          status: "rejected",
          reason:
            typeof payload?.message === "string"
              ? payload.message
              : typeof payload?.error === "string"
                ? payload.error
                : "The wrapped API call was blocked by Locus policy guardrails.",
          metadata
        };
      }

      if (response.status === 402) {
        return {
          provider: request.provider,
          endpoint: request.endpoint,
          purpose: request.purpose,
          amountUsd: request.estimatedCostUsd,
          currency: "USD",
          status: "failed",
          reason:
            typeof payload?.message === "string"
              ? payload.message
              : "The Locus wallet does not have enough balance for this request.",
          metadata
        };
      }

      if (!response.ok) {
        return {
          provider: request.provider,
          endpoint: request.endpoint,
          purpose: request.purpose,
          amountUsd: request.estimatedCostUsd,
          currency: "USD",
          status: "failed",
          reason:
            typeof payload?.message === "string"
              ? payload.message
              : typeof payload?.error === "string"
                ? payload.error
                : `Locus wrapped API call failed with status ${response.status}.`,
          metadata
        };
      }

      return {
        provider: request.provider,
        endpoint: request.endpoint,
        purpose: request.purpose,
        amountUsd: request.estimatedCostUsd,
        currency: "USD",
        status: "completed",
        reason: request.reason,
        externalTxId:
          typeof responseData?.request_id === "string"
            ? responseData.request_id
            : typeof responseData?.id === "string"
              ? responseData.id
              : undefined,
        metadata
      };
    } catch {
      return {
        provider: request.provider,
        endpoint: request.endpoint,
        purpose: request.purpose,
        amountUsd: request.estimatedCostUsd,
        currency: "USD",
        status: "failed",
        reason: "Failed to reach the Locus wrapped API.",
        metadata: {
          ...request.metadata,
          endpoint: request.endpoint,
          requestBody: request.requestBody,
          transport: "locus-wrapped-api"
        }
      };
    }
  }

  async listTransactions(input: { managedWalletRef: string; receipts?: LocusTransaction[] }) {
    return input.receipts ?? [];
  }
}
