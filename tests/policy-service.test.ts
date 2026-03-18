import { ActionType, type TreasuryPolicy } from "@prisma/client";
import { evaluatePolicyGuardrails } from "@/lib/services/policy-service";
import { policySchema } from "@/lib/validators/policy";

function buildPolicy(overrides: Partial<TreasuryPolicy> = {}): TreasuryPolicy {
  const now = new Date();
  return {
    id: "policy_1",
    organizationId: "org_1",
    monthlyBudgetUsd: 1500 as never,
    maxSpendPerActionUsd: 500 as never,
    approvalThresholdUsd: 180 as never,
    allowedProviders: ["locus-analytics", "gauntlet"],
    allowedActions: [ActionType.BUY_ANALYTICS, ActionType.SWITCH_STRATEGY],
    autoExecuteLowRisk: false,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

describe("policySchema", () => {
  it("rejects an approval threshold above the max action spend", () => {
    expect(() =>
      policySchema.parse({
        monthlyBudgetUsd: 1000,
        maxSpendPerActionUsd: 100,
        approvalThresholdUsd: 150,
        allowedProviders: ["locus-analytics"],
        allowedActions: [ActionType.BUY_ANALYTICS],
        autoExecuteLowRisk: false
      })
    ).toThrow(/Approval threshold/);
  });
});

describe("evaluatePolicyGuardrails", () => {
  it("blocks unapproved providers and overspend", () => {
    const result = evaluatePolicyGuardrails({
      policy: buildPolicy(),
      monthlySpentUsd: 1490,
      premiumDataCostUsd: 25,
      executionCostUsd: 50,
      provider: "defillama-pro",
      actionType: ActionType.SWITCH_STRATEGY,
      lowRisk: true
    });

    expect(result.allowed).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("not approved"),
        expect.stringContaining("exceed the monthly budget")
      ])
    );
  });

  it("marks higher-cost actions as approval-gated", () => {
    const result = evaluatePolicyGuardrails({
      policy: buildPolicy({ autoExecuteLowRisk: true }),
      monthlySpentUsd: 50,
      premiumDataCostUsd: 84,
      executionCostUsd: 220,
      provider: "locus-analytics",
      actionType: ActionType.SWITCH_STRATEGY,
      lowRisk: true
    });

    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(true);
    expect(result.canAutoExecute).toBe(false);
  });
});
