import { prisma } from "@/lib/db";
import { serializeStrategy } from "@/lib/serializers";
import { type StrategyInput } from "@/lib/validators/strategy";

export async function listStrategies(userId: string) {
  const strategies = await prisma.monitoredStrategy.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" }
  });

  return strategies.map(serializeStrategy);
}

export async function getStrategyById(userId: string, strategyId: string) {
  const strategy = await prisma.monitoredStrategy.findFirst({
    where: {
      id: strategyId,
      userId
    }
  });

  if (!strategy) {
    throw new Error("Monitored strategy not found.");
  }

  return strategy;
}

export async function upsertStrategy(userId: string, input: StrategyInput) {
  const strategy = input.id
    ? await prisma.monitoredStrategy.update({
        where: { id: input.id },
        data: {
          name: input.name,
          protocol: input.protocol,
          network: input.network,
          assetSymbol: input.assetSymbol.toUpperCase(),
          currentYield: input.currentYield,
          targetYield: input.targetYield,
          riskScore: input.riskScore,
          status: input.status,
          metadata: input.metadata ?? {}
        }
      })
    : await prisma.monitoredStrategy.create({
        data: {
          userId,
          name: input.name,
          protocol: input.protocol,
          network: input.network,
          assetSymbol: input.assetSymbol.toUpperCase(),
          currentYield: input.currentYield,
          targetYield: input.targetYield,
          riskScore: input.riskScore,
          status: input.status,
          metadata: input.metadata ?? {}
        }
      });

  return serializeStrategy(strategy);
}
