import {
  ActionType,
  ApprovalStatus,
  DecisionOutcome,
  IntegrationMode,
  Prisma,
  ReceiptStatus,
  RunStatus,
  StepStatus,
  StrategyStatus,
  TriggerType,
  type PrismaClient
} from "@prisma/client";
import { defaultAllowedActions, defaultAllowedProviders } from "@/lib/constants";

export async function seedDemoWorkspace(
  client: PrismaClient,
  input: {
    organizationId: string;
    userId: string;
  }
) {
  await client.organization.update({
    where: { id: input.organizationId },
    data: {
      name: "TreasuryPilot Demo Workspace",
      walletAddress: "0xDemoTreasuryVault"
    }
  });

  await client.executionRecord.deleteMany({
    where: { organizationId: input.organizationId }
  });

  await client.paymentReceipt.deleteMany({
    where: {
      agentRun: {
        organizationId: input.organizationId
      }
    }
  });
  await client.recommendation.deleteMany({
    where: {
      agentRun: {
        organizationId: input.organizationId
      }
    }
  });
  await client.approvalRequest.deleteMany({
    where: {
      agentRun: {
        organizationId: input.organizationId
      }
    }
  });
  await client.agentStep.deleteMany({
    where: {
      agentRun: {
        organizationId: input.organizationId
      }
    }
  });
  await client.agentRun.deleteMany({
    where: { organizationId: input.organizationId }
  });
  await client.monitoredStrategy.deleteMany({
    where: { organizationId: input.organizationId }
  });

  await client.treasuryPolicy.upsert({
    where: { organizationId: input.organizationId },
    update: {
      monthlyBudgetUsd: new Prisma.Decimal(1500),
      maxSpendPerActionUsd: new Prisma.Decimal(500),
      approvalThresholdUsd: new Prisma.Decimal(180),
      allowedProviders: [...defaultAllowedProviders],
      allowedActions: [...defaultAllowedActions],
      autoExecuteLowRisk: false
    },
    create: {
      organizationId: input.organizationId,
      monthlyBudgetUsd: new Prisma.Decimal(1500),
      maxSpendPerActionUsd: new Prisma.Decimal(500),
      approvalThresholdUsd: new Prisma.Decimal(180),
      allowedProviders: [...defaultAllowedProviders],
      allowedActions: [...defaultAllowedActions],
      autoExecuteLowRisk: false
    }
  });

  await client.integrationSettings.upsert({
    where: { organizationId: input.organizationId },
    update: {
      openservMode: IntegrationMode.MOCK,
      locusMode: IntegrationMode.MOCK,
      demoMode: true,
      managedWalletRef: "locus-demo-wallet",
      openservEndpoint: null
    },
    create: {
      organizationId: input.organizationId,
      openservMode: IntegrationMode.MOCK,
      locusMode: IntegrationMode.MOCK,
      demoMode: true,
      managedWalletRef: "locus-demo-wallet",
      openservEndpoint: null
    }
  });

  await client.executionSettings.upsert({
    where: { organizationId: input.organizationId },
    update: {
      liveExecutionEnabled: false,
      dryRunByDefault: true,
      emergencyStop: false,
      allowedChains: ["base"],
      allowedDestinations: [],
      allowedExecutionProviders: ["locus-transfer", "base-usdc"],
      maxExecutionSizeUsd: new Prisma.Decimal(1000)
    },
    create: {
      organizationId: input.organizationId,
      liveExecutionEnabled: false,
      dryRunByDefault: true,
      emergencyStop: false,
      allowedChains: ["base"],
      allowedDestinations: [],
      allowedExecutionProviders: ["locus-transfer", "base-usdc"],
      maxExecutionSizeUsd: new Prisma.Decimal(1000)
    }
  });

  const strategy = await client.monitoredStrategy.create({
    data: {
      organizationId: input.organizationId,
      name: "USDC Yield Vault",
      protocol: "Spark",
      network: "Base",
      assetSymbol: "USDC",
      currentYield: new Prisma.Decimal(4.1),
      targetYield: new Prisma.Decimal(6.2),
      riskScore: new Prisma.Decimal(37),
      status: StrategyStatus.ACTIVE,
      metadata: {
        positionUsd: 250000,
        vaultAddress: "0xVaultDemoAddress",
        watchlist: [
          {
            id: "morpho-prime",
            label: "Morpho Prime USDC",
            protocol: "Morpho",
            network: "Base",
            assetSymbol: "USDC",
            estimatedYield: 7.9,
            riskScore: 31,
            provider: "locus-analytics",
            actionType: ActionType.SWITCH_STRATEGY,
            summary: "A whitelisted vault with stronger risk-adjusted yield.",
            premiumProviderCostUsd: 84
          },
          {
            id: "aave-reserve",
            label: "Aave Reserve Rebalance",
            protocol: "Aave",
            network: "Base",
            assetSymbol: "USDC",
            estimatedYield: 6.4,
            riskScore: 28,
            provider: "gauntlet",
            actionType: ActionType.REBALANCE,
            summary: "Lower-volatility treasury reserve posture.",
            premiumProviderCostUsd: 59
          }
        ]
      }
    }
  });

  const historicalRun = await client.agentRun.create({
    data: {
      organizationId: input.organizationId,
      strategyId: strategy.id,
      initiatedByUserId: input.userId,
      triggerType: TriggerType.BETTER_OPPORTUNITY,
      triggerSummary: "A whitelisted reserve rebalance improved projected yield without increasing risk.",
      status: RunStatus.COMPLETED,
      requiresApproval: false,
      finalDecision: DecisionOutcome.RECOMMENDED,
      confidenceScore: new Prisma.Decimal(0.78),
      completedAt: new Date()
    }
  });

  await client.agentStep.createMany({
    data: [
      {
        agentRunId: historicalRun.id,
        agentType: "MONITOR",
        title: "Monitor Agent found a stronger whitelisted reserve posture.",
        input: { currentYield: 4.8, targetYield: 5.3 },
        output: { triggerType: "BETTER_OPPORTUNITY" },
        status: StepStatus.SUCCESS
      },
      {
        agentRunId: historicalRun.id,
        agentType: "RESEARCH",
        title: "Research Agent compared alternative yield venues.",
        input: { providers: [...defaultAllowedProviders] },
        output: { bestOption: "Aave Reserve Rebalance" },
        status: StepStatus.SUCCESS
      },
      {
        agentRunId: historicalRun.id,
        agentType: "RISK",
        title: "Risk Agent verified policy fit and low-risk profile.",
        input: { approvalThresholdUsd: 180 },
        output: { lowRisk: true },
        status: StepStatus.SUCCESS
      },
      {
        agentRunId: historicalRun.id,
        agentType: "EXECUTION",
        title: "Execution Agent prepared a rebalance recommendation.",
        input: { actionType: ActionType.REBALANCE },
        output: { outcome: "recommended" },
        status: StepStatus.SUCCESS
      },
      {
        agentRunId: historicalRun.id,
        agentType: "EXPLAINER",
        title: "Explainer Agent summarized the run for operators.",
        input: { audience: "operator" },
        output: { summary: "Rebalance into a safer reserve configuration." },
        status: StepStatus.SUCCESS
      }
    ]
  });

  await client.paymentReceipt.create({
    data: {
      agentRunId: historicalRun.id,
      provider: "gauntlet",
      purpose: "Reserve analytics snapshot",
      amountUsd: new Prisma.Decimal(45),
      currency: "USD",
      status: ReceiptStatus.COMPLETED,
      externalTxId: "locus-historical-001",
      reason: "Treasury analytics spend stayed under the policy threshold.",
      metadata: { managedWalletRef: "locus-demo-wallet" }
    }
  });

  await client.recommendation.create({
    data: {
      agentRunId: historicalRun.id,
      headline: "Rebalance idle reserves into Aave Reserve",
      rationale: "This move improves projected yield while keeping the treasury in a low-risk posture.",
      proposedAction: "Rebalance 25% of idle USDC into the Aave Reserve lane.",
      expectedImpact: "Projected blended yield rises by 0.6% without breaching risk limits.",
      riskAssessment: "Low risk, no approval required."
    }
  });

  const pendingRun = await client.agentRun.create({
    data: {
      organizationId: input.organizationId,
      strategyId: strategy.id,
      initiatedByUserId: input.userId,
      triggerType: TriggerType.MANUAL_REVIEW,
      triggerSummary: "Premium analytics for a strategy migration is pending approval.",
      status: RunStatus.AWAITING_APPROVAL,
      requiresApproval: true,
      finalDecision: DecisionOutcome.AWAITING_APPROVAL,
      confidenceScore: new Prisma.Decimal(0.82)
    }
  });

  await client.agentStep.createMany({
    data: [
      {
        agentRunId: pendingRun.id,
        agentType: "MONITOR",
        title: "Monitor Agent confirmed the yield vault is still trailing its target.",
        input: { currentYield: 4.1, targetYield: 6.2 },
        output: {
          triggerType: "YIELD_DROP",
          summary: "USDC Yield Vault is more than 2% below its target yield."
        },
        status: StepStatus.SUCCESS
      },
      {
        agentRunId: pendingRun.id,
        agentType: "RESEARCH",
        title: "Research Agent selected a stronger whitelisted venue and requested premium analytics.",
        input: { providers: [...defaultAllowedProviders] },
        output: {
          selectedOpportunity: "Morpho Prime USDC",
          provider: "locus-analytics",
          summary: "Premium analytics are needed to validate the migration before moving treasury capital."
        },
        status: StepStatus.SUCCESS
      },
      {
        agentRunId: pendingRun.id,
        agentType: "RISK",
        title: "Risk Agent enforced the approval threshold for the analytics purchase.",
        input: { approvalThresholdUsd: 180, premiumDataCostUsd: 220 },
        output: {
          lowRisk: true,
          requiresApproval: true,
          summary: "The strategy switch is low risk, but the analytics spend crosses the operator threshold."
        },
        status: StepStatus.SUCCESS
      },
      {
        agentRunId: pendingRun.id,
        agentType: "EXECUTION",
        title: "Execution Agent paused the bounded action until the paid data request is approved.",
        input: { actionType: ActionType.SWITCH_STRATEGY, estimatedCostUsd: 240 },
        output: {
          purchaseStatus: "pending_approval",
          finalDecision: DecisionOutcome.AWAITING_APPROVAL,
          summary: "TreasuryPilot is ready to switch vaults once the operator clears the premium analytics packet."
        },
        status: StepStatus.PENDING
      },
      {
        agentRunId: pendingRun.id,
        agentType: "EXPLAINER",
        title: "Explainer Agent summarized the approval checkpoint for operators.",
        input: { audience: "operator" },
        output: {
          headline: "Approve premium analytics before migrating the yield vault",
          summary: "The treasury path is whitelisted and low risk, but the paid research packet is gated by policy."
        },
        status: StepStatus.SUCCESS
      }
    ]
  });

  await client.paymentReceipt.create({
    data: {
      agentRunId: pendingRun.id,
      provider: "locus-analytics",
      purpose: "Forward-looking vault analytics",
      amountUsd: new Prisma.Decimal(220),
      currency: "USD",
      status: ReceiptStatus.PENDING_APPROVAL,
      externalTxId: "locus-pending-002",
      reason: "Premium analytics spend requires a manual approval checkpoint.",
      metadata: { managedWalletRef: "locus-demo-wallet" }
    }
  });

  await client.approvalRequest.create({
    data: {
      agentRunId: pendingRun.id,
      title: "Approve premium analytics purchase",
      reason: "The Research Agent wants to buy a deeper analytics packet before switching vaults.",
      status: ApprovalStatus.PENDING
    }
  });

  await client.recommendation.create({
    data: {
      agentRunId: pendingRun.id,
      headline: "Switch USDC reserves toward Morpho Prime after paid validation",
      rationale: "The Research Agent found a higher-yield whitelisted venue, but the premium analytics packet needs operator approval first.",
      proposedAction: "Approve the analytics packet, then switch a bounded slice of USDC from Spark into Morpho Prime.",
      expectedImpact: "Projected yield improves by roughly 3.8% while staying within the low-risk band.",
      riskAssessment: "Low risk strategy migration, manual approval required for the analytics spend."
    }
  });

  await client.executionRecord.create({
    data: {
      organizationId: input.organizationId,
      agentRunId: pendingRun.id,
      actionType: ActionType.SWITCH_STRATEGY,
      provider: "treasury-pilot",
      chain: "base",
      assetSymbol: "USDC",
      amountUsd: new Prisma.Decimal(240),
      mode: "DRY_RUN",
      status: "PENDING_APPROVAL",
      dryRun: true,
      idempotencyKey: `seeded-${pendingRun.id}`,
      rationale: "Execution is prepared as a dry run and awaits operator approval of the analytics spend.",
      metadata: {
        source: "demo-seed"
      }
    }
  });

  return strategy;
}
