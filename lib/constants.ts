import { ActionType } from "@prisma/client";

export const defaultAllowedProviders = [
  "exa",
  "firecrawl"
] as const;

export const defaultAllowedActions = [
  ActionType.BUY_ANALYTICS,
  ActionType.REBALANCE,
  ActionType.SWITCH_STRATEGY,
  ActionType.HEDGE_POSITION
] as const;

export const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/policies", label: "Policy" },
  { href: "/strategies", label: "Strategies" },
  { href: "/runs", label: "Agent Runs" },
  { href: "/receipts", label: "Receipts" },
  { href: "/demo", label: "Demo" }
] as const;

export const demoTriggers = [
  "Yield dropped below target",
  "Risk score increased",
  "Better whitelisted opportunity detected"
] as const;
