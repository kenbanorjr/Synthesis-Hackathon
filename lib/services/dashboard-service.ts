import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getMonthlySpentUsd, listReceiptsForUser } from "@/lib/services/payment-service";
import { decimalToNumber, serializeIntegrationSettings, serializePolicy, serializeRun, serializeStrategy } from "@/lib/serializers";

export async function getDashboardData(userId: string) {
  const [policy, settings, strategies, latestRun, recentRuns, receipts, monthlySpentUsd] = await Promise.all([
    prisma.treasuryPolicy.findUnique({ where: { userId } }),
    prisma.integrationSettings.findUnique({ where: { userId } }),
    prisma.monitoredStrategy.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.agentRun.findFirst({
      where: { userId },
      include: {
        strategy: true,
        steps: { orderBy: { createdAt: "asc" } },
        receipts: { orderBy: { createdAt: "desc" } },
        recommendation: true,
        approvalRequest: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.agentRun.findMany({
      where: { userId },
      include: {
        strategy: true,
        recommendation: true,
        approvalRequest: true,
        receipts: true,
        steps: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    listReceiptsForUser(userId, 5),
    getMonthlySpentUsd(userId)
  ]);

  if (!policy || !settings) {
    throw new Error("Demo workspace is not initialized.");
  }

  const primaryStrategy = strategies[0] ?? null;
  const monthlyBudgetUsd = decimalToNumber(policy.monthlyBudgetUsd);
  const budgetUsedPct = monthlyBudgetUsd > 0 ? Math.min((monthlySpentUsd / monthlyBudgetUsd) * 100, 100) : 0;
  const strategySpread =
    primaryStrategy ? decimalToNumber(primaryStrategy.currentYield) - decimalToNumber(primaryStrategy.targetYield) : 0;

  return {
    policy: serializePolicy(policy),
    integrationSettings: serializeIntegrationSettings(settings),
    strategies: strategies.map(serializeStrategy),
    primaryStrategy: primaryStrategy ? serializeStrategy(primaryStrategy) : null,
    latestRun: latestRun ? serializeRun(latestRun) : null,
    recentRuns: recentRuns.map(serializeRun),
    recentReceipts: receipts,
    budget: {
      monthlyBudgetUsd,
      spentUsd: monthlySpentUsd,
      remainingUsd: Math.max(monthlyBudgetUsd - monthlySpentUsd, 0),
      budgetUsedPct
    },
    overview: {
      alertsOpen: recentRuns.filter((run) => run.status !== "COMPLETED").length,
      strategySpread,
      avgRiskScore:
        strategies.length > 0
          ? Number(
              (
                strategies.reduce((sum, strategy) => sum + decimalToNumber(strategy.riskScore), 0) / strategies.length
              ).toFixed(1)
            )
          : 0
    }
  };
}

export async function getAuditLog(userId: string) {
  const runs = await prisma.agentRun.findMany({
    where: { userId },
    include: {
      strategy: true,
      steps: { orderBy: { createdAt: "asc" } },
      receipts: { orderBy: { createdAt: "desc" } },
      recommendation: true,
      approvalRequest: true
    },
    orderBy: { createdAt: "desc" }
  });

  return runs.map(serializeRun);
}
