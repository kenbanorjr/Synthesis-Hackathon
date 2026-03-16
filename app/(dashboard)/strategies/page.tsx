export const dynamic = "force-dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatusChip } from "@/components/status-chip";
import { StrategyForm } from "@/components/strategy-form";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";
import { formatPercent } from "@/lib/formatters";

export default async function StrategiesPage() {
  const workspace = await getDemoUserWithWorkspace();
  const dashboard = await getDashboardData(workspace.id);

  return (
    <>
      <PageHeader
        title="Monitored strategies"
        description="Maintain the active treasury positions and tune their live telemetry before you trigger a new multi-agent run."
      />
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <StrategyForm />
        <div className="space-y-4">
          {dashboard.strategies.map((strategy) => (
            <Card key={strategy.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{strategy.name}</CardTitle>
                    <CardDescription>
                      {strategy.protocol} • {strategy.network} • {strategy.assetSymbol}
                    </CardDescription>
                  </div>
                  <StatusChip value={strategy.status} />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-muted/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current</p>
                  <p className="mt-2 text-xl font-semibold">{formatPercent(strategy.currentYield)}</p>
                </div>
                <div className="rounded-3xl bg-muted/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Target</p>
                  <p className="mt-2 text-xl font-semibold">{formatPercent(strategy.targetYield)}</p>
                </div>
                <div className="rounded-3xl bg-muted/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Risk</p>
                  <p className="mt-2 text-xl font-semibold">{strategy.riskScore.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
