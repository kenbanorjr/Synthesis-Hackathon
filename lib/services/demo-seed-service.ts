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
import { appConfig } from "@/lib/config";
import { defaultAllowedActions, defaultAllowedProviders } from "@/lib/constants";

export async function seedDemoWorkspace(client: PrismaClient) {
  const user = await client.user.upsert({
    where: { email: appConfig.demoUserEmail },
    update: {
      name: "TreasuryPilot Demo Operator",
      walletAddress: "0xDemoTreasuryOperator"
    },
    create: {
      name: "TreasuryPilot Demo Operator",
      email: appConfig.demoUserEmail,
      walletAddress: "0xDemoTreasuryOperator"
    }
  });

  await client.paymentReceipt.deleteMany({
    where: {
      agentRun: {
        userId: user.id
      }
    }
  });
  await client.recommendation.deleteMany({
    where: {
      agentRun: {
        userId: user.id
      }
    }
  });
  await client.approvalRequest.deleteMany({
    where: {
      agentRun: {
        userId: user.id
      }
    }
  });
  await client.agentStep.deleteMany({
    where: {
      agentRun: {
        userId: user.id
      }
    }
  });
  await client.agentRun.deleteMany({
    where: { userId: user.id }
  });
  await client.monitoredStrategy.deleteMany({
    where: { userId: user.id }
  });

  await client.treasuryPolicy.upsert({
    where: { userId: user.id },
    update: {
      monthlyBudgetUsd: new Prisma.Decimal(1500),
      maxSpendPerActionUsd: new Prisma.Decimal(500),
      approvalThresholdUsd: new Prisma.Decimal(180),
      allowedProviders: [...defaultAllowedProviders],
      allowedActions: [...defaultAllowedActions],
      autoExecuteLowRisk: false
    },
    create: {
      userId: user.id,
      monthlyBudgetUsd: new Prisma.Decimal(1500),
      maxSpendPerActionUsd: new Prisma.Decimal(500),
      approvalThresholdUsd: new Prisma.Decimal(180),
      allowedProviders: [...defaultAllowedProviders],
      allowedActions: [...defaultAllowedActions],
      autoExecuteLowRisk: false
    }
  });

  await client.integrationSettings.upsert({
    where: { userId: user.id },
    update: {
      openservMode: IntegrationMode.MOCK,
      locusMode: IntegrationMode.MOCK,
      demoMode: true,
      managedWalletRef: "locus-demo-wallet"
    },
    create: {
      userId: user.id,
      openservMode: IntegrationMode.MOCK,
      locusMode: IntegrationMode.MOCK,
      demoMode: true,
      managedWalletRef: "locus-demo-wallet"
    }
  });

  const strategy = await client.monitoredStrategy.create({
    data: {
      userId: user.id,
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
      userId: user.id,
      strategyId: strategy.id,
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
      userId: user.id,
      strategyId: strategy.id,
      triggerType: TriggerType.MANUAL_REVIEW,
      triggerSummary: "Premium analytics for a strategy migration is pending approval.",
      status: RunStatus.AWAITING_APPROVAL,
      requiresApproval: true,
      finalDecision: DecisionOutcome.AWAITING_APPROVAL,
      confidenceScore: new Prisma.Decimal(0.82)
    }
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

  return user;
}
