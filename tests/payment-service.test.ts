import { MockLocusAdapter } from "@/lib/integrations/locus/mock-locus";

describe("MockLocusAdapter", () => {
  it("rejects purchases that exceed the remaining budget", async () => {
    const adapter = new MockLocusAdapter();
    const result = await adapter.purchaseData({
      provider: "locus-analytics",
      purpose: "Premium analytics",
      amountUsd: 200,
      reason: "Need deeper data.",
      allowedProviders: ["locus-analytics"],
      budgetSnapshot: {
        managedWalletRef: "wallet_1",
        monthlyBudgetUsd: 150,
        spentThisMonthUsd: 25,
        remainingBudgetUsd: 125,
        maxSpendPerActionUsd: 500,
        approvalThresholdUsd: 180
      }
    });

    expect(result.status).toBe("rejected");
    expect(result.reason).toMatch(/remaining monthly budget/);
  });

  it("creates a completed purchase result with a transaction id when within limits", async () => {
    const adapter = new MockLocusAdapter();
    const result = await adapter.purchaseData({
      provider: "locus-analytics",
      purpose: "Premium analytics",
      amountUsd: 80,
      reason: "Need deeper data.",
      allowedProviders: ["locus-analytics"],
      budgetSnapshot: {
        managedWalletRef: "wallet_1",
        monthlyBudgetUsd: 500,
        spentThisMonthUsd: 25,
        remainingBudgetUsd: 475,
        maxSpendPerActionUsd: 500,
        approvalThresholdUsd: 180
      }
    });

    expect(result.status).toBe("completed");
    expect(result.externalTxId).toContain("locus-tx-");
  });
});
