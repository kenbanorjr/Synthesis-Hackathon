import { ActionType, TriggerType } from "@prisma/client";
import type {
  OpenServWorkflowInput,
  OpenServWorkflowOutput,
  ResearchPremiumDataRequest
} from "@/lib/integrations/openserv/types";

function pickTrigger(input: OpenServWorkflowInput) {
  if (input.triggerHint) {
    return input.triggerHint;
  }

  if (input.strategy.currentYield < input.strategy.targetYield) {
    return TriggerType.YIELD_DROP;
  }

  if (input.strategy.riskScore > 60) {
    return TriggerType.RISK_INCREASE;
  }

  return TriggerType.BETTER_OPPORTUNITY;
}

function buildPremiumDataRequest(input: OpenServWorkflowInput): ResearchPremiumDataRequest | undefined {
  const selectedOpportunity = [...input.opportunities].sort((left, right) => {
    const leftScore = left.estimatedYield - left.riskScore / 20;
    const rightScore = right.estimatedYield - right.riskScore / 20;
    return rightScore - leftScore;
  })[0] ?? null;

  if (!selectedOpportunity) {
    return undefined;
  }

  return {
    provider: "exa",
    endpoint: "search",
    purpose: `Premium treasury research for ${selectedOpportunity.label}`,
    reason: "Validate current yield, liquidity, and risk posture before acting.",
    estimatedCostUsd: selectedOpportunity.premiumProviderCostUsd,
    requestBody: {
      query: [
        selectedOpportunity.label,
        selectedOpportunity.protocol,
        selectedOpportunity.network,
        selectedOpportunity.assetSymbol,
        "yield liquidity risk"
      ].join(" "),
      numResults: 3
    },
    metadata: {
      selectedOpportunityId: selectedOpportunity.id,
      selectedOpportunityLabel: selectedOpportunity.label,
      currentStrategyId: input.strategy.id,
      currentStrategyName: input.strategy.name
    }
  };
}

export async function runWorkflowEngine(input: OpenServWorkflowInput): Promise<OpenServWorkflowOutput> {
  const triggerType = pickTrigger(input);
  const selectedOpportunity = [...input.opportunities].sort((left, right) => {
    const leftScore = left.estimatedYield - left.riskScore / 20;
    const rightScore = right.estimatedYield - right.riskScore / 20;
    return rightScore - leftScore;
  })[0] ?? null;

  const yieldGap = Number((input.strategy.targetYield - input.strategy.currentYield).toFixed(2));
  const severity =
    triggerType === TriggerType.RISK_INCREASE || yieldGap > 1 ? "high" : yieldGap > 0.4 ? "medium" : "low";

  const premiumDataRequest = buildPremiumDataRequest(input);
  const suggestedAction = selectedOpportunity?.actionType ?? ActionType.REBALANCE;
  const estimatedCostUsd =
    suggestedAction === ActionType.SWITCH_STRATEGY ? 240 : suggestedAction === ActionType.HEDGE_POSITION ? 320 : 140;
  const lowRisk = (selectedOpportunity?.riskScore ?? input.strategy.riskScore) <= 42;

  return {
    monitor: {
      triggerDetected: true,
      triggerType,
      summary:
        triggerType === TriggerType.YIELD_DROP
          ? `${input.strategy.name} slipped ${yieldGap.toFixed(2)}% below its target yield.`
          : triggerType === TriggerType.RISK_INCREASE
            ? `${input.strategy.name} risk score moved above its comfort band.`
            : "A whitelisted higher-quality opportunity is available.",
      severity
    },
    research: {
      summary: selectedOpportunity
        ? `Compared ${input.opportunities.length} whitelisted options and identified ${selectedOpportunity.label} as the best next move.`
        : "No stronger opportunity was found, so the strategy should be monitored more closely.",
      premiumDataRequest,
      comparedOptions: input.opportunities,
      selectedOpportunity
    },
    risk: {
      summary: lowRisk
        ? "Risk profile stays within the low-risk envelope for bounded automation."
        : "The move is strategically sound but should not auto-execute without review.",
      lowRisk,
      riskScore: selectedOpportunity?.riskScore ?? input.strategy.riskScore,
      watchouts: lowRisk
        ? ["Monitor slippage after migration.", "Keep provider spend below policy limits."]
        : ["Human review recommended before committing capital.", "Watch market liquidity conditions."]
    },
    execution: {
      summary: selectedOpportunity
        ? `Propose ${suggestedAction.toLowerCase()} toward ${selectedOpportunity.label} with bounded execution size.`
        : "Hold position and keep monitoring until a better candidate appears.",
      actionType: suggestedAction,
      targetProtocol: selectedOpportunity?.protocol ?? input.strategy.protocol,
      estimatedCostUsd,
      expectedImpact: selectedOpportunity
        ? `Expected blended yield improvement of ${(selectedOpportunity.estimatedYield - input.strategy.currentYield).toFixed(2)}%.`
        : "Expected impact is limited because no switch is advised.",
      confidenceScore: selectedOpportunity ? 0.84 : 0.54
    },
    explainer: {
      headline: selectedOpportunity
        ? `Rotate capital toward ${selectedOpportunity.label}`
        : "Maintain the current strategy with tighter monitoring",
      summary: selectedOpportunity
        ? "TreasuryPilot found a better whitelisted opportunity, checked policy fit, and prepared a bounded action with paid research receipts."
        : "TreasuryPilot found no superior alternative, so it recommends observation instead of action.",
      bullets: [
        `Trigger: ${triggerType.toLowerCase()}.`,
        premiumDataRequest ? `Research provider: ${premiumDataRequest.provider}/${premiumDataRequest.endpoint}.` : "No premium research requested.",
        lowRisk ? "Risk posture is low enough for bounded automation." : "Risk posture requires a human checkpoint."
      ]
    }
  };
}
