import { ActionType, type MonitoredStrategy, type Prisma } from "@prisma/client";

export interface OpportunitySnapshot {
  id: string;
  label: string;
  protocol: string;
  network: string;
  assetSymbol: string;
  estimatedYield: number;
  riskScore: number;
  provider: string;
  actionType: ActionType;
  summary: string;
  premiumProviderCostUsd: number;
}

const defaultCatalog: OpportunitySnapshot[] = [
  {
    id: "morpho-prime",
    label: "Morpho Prime USDC",
    protocol: "Morpho",
    network: "Base",
    assetSymbol: "USDC",
    estimatedYield: 7.9,
    riskScore: 31,
    provider: "exa",
    actionType: ActionType.SWITCH_STRATEGY,
    summary: "A whitelisted vault with a stronger risk-adjusted USDC yield.",
    premiumProviderCostUsd: 0.12
  },
  {
    id: "aave-reserve",
    label: "Aave Reserve Rebalance",
    protocol: "Aave",
    network: "Base",
    assetSymbol: "USDC",
    estimatedYield: 6.4,
    riskScore: 28,
    provider: "exa",
    actionType: ActionType.REBALANCE,
    summary: "A lower-volatility option that stabilizes treasury cash management.",
    premiumProviderCostUsd: 0.09
  },
  {
    id: "delta-hedge",
    label: "Perp Hedge Overlay",
    protocol: "Drift",
    network: "Base",
    assetSymbol: "USDC",
    estimatedYield: 5.9,
    riskScore: 44,
    provider: "exa",
    actionType: ActionType.HEDGE_POSITION,
    summary: "Protects downside with a bounded hedge if volatility is expanding.",
    premiumProviderCostUsd: 0.14
  }
];

export function getOpportunityCatalog(strategy: MonitoredStrategy) {
  const metadata = strategy.metadata as Prisma.JsonObject | null;
  const watchlist = metadata?.watchlist;
  if (Array.isArray(watchlist)) {
    return watchlist
      .map((entry) => entry as Record<string, unknown>)
      .filter((entry) => typeof entry.id === "string" && typeof entry.label === "string")
      .map((entry) => ({
        id: String(entry.id),
        label: String(entry.label),
        protocol: String(entry.protocol ?? strategy.protocol),
        network: String(entry.network ?? strategy.network),
        assetSymbol: String(entry.assetSymbol ?? strategy.assetSymbol),
        estimatedYield: Number(entry.estimatedYield ?? strategy.targetYield),
        riskScore: Number(entry.riskScore ?? strategy.riskScore),
        provider: String(entry.provider ?? "exa"),
        actionType: (entry.actionType as ActionType) ?? ActionType.SWITCH_STRATEGY,
        summary: String(entry.summary ?? "Imported opportunity candidate."),
        premiumProviderCostUsd: Number(entry.premiumProviderCostUsd ?? 0.12)
      }));
  }

  return defaultCatalog.filter((entry) => entry.assetSymbol === strategy.assetSymbol);
}
