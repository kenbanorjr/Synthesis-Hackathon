import { ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/status-chip";
import { formatPercent } from "@/lib/formatters";

export function StrategyOverviewCard({
  strategy
}: {
  strategy: {
    name: string;
    protocol: string;
    network: string;
    assetSymbol: string;
    currentYield: number;
    targetYield: number;
    riskScore: number;
    status: string;
    metadata?: Record<string, unknown> | null;
  } | null;
}) {
  if (!strategy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No strategy seeded yet</CardTitle>
          <CardDescription>Use Demo Mode to load the USDC Yield Vault scenario.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const spread = strategy.currentYield - strategy.targetYield;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{strategy.name}</CardTitle>
            <CardDescription>
              {strategy.protocol} on {strategy.network} tracking {strategy.assetSymbol}
            </CardDescription>
          </div>
          <StatusChip value={strategy.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-muted/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current Yield</p>
          <div className="mt-3 flex items-center gap-3">
            {spread >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
            <p className="text-2xl font-semibold">{formatPercent(strategy.currentYield)}</p>
          </div>
        </div>
        <div className="rounded-3xl bg-muted/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Target Yield</p>
          <p className="mt-3 text-2xl font-semibold">{formatPercent(strategy.targetYield)}</p>
        </div>
        <div className="rounded-3xl bg-muted/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Risk Score</p>
          <div className="mt-3 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold">{strategy.riskScore.toFixed(1)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
