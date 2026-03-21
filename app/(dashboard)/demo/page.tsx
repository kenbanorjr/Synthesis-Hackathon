export const dynamic = "force-dynamic";

import { DemoActions } from "@/components/demo-actions";
import { IntegrationStatusCard } from "@/components/integration-status-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { getSystemHealth } from "@/lib/services/health-service";
import { requireCurrentOrganizationContext } from "@/lib/session";

export default async function DemoPage() {
  const workspace = await requireCurrentOrganizationContext();
  const [dashboard, health] = await Promise.all([
    getDashboardData(workspace.organization.id),
    getSystemHealth({
      openservMode: workspace.integrationSettings.openservMode,
      locusMode: workspace.integrationSettings.locusMode,
      executionSettings: workspace.executionSettings
    })
  ]);

  return (
    <>
      <PageHeader
        title="Demo mode"
        description="Use the seeded USDC Yield Vault scenario to show the end-to-end OpenServ and Locus workflow without any external credentials."
      />
      <DemoActions />
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Seeded scenario</CardTitle>
            <CardDescription>
              The default path is designed to surface one paid research call and one actionable recommendation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="ledger-strip">
              <p className="eyebrow">Strategy</p>
              <p className="mt-2 text-sm text-foreground">USDC Yield Vault</p>
            </div>
            <div className="ledger-strip">
              <p className="eyebrow">Trigger</p>
              <p className="mt-2 text-sm text-foreground">Yield dropped below target</p>
            </div>
            <div className="ledger-strip">
              <p className="eyebrow">Research</p>
              <p className="mt-2 text-sm text-foreground">Buy wrapped-API research through Locus</p>
            </div>
            <div className="ledger-strip">
              <p className="eyebrow">Risk</p>
              <p className="mt-2 text-sm text-foreground">Validate provider whitelist, action whitelist, budget, and approval threshold</p>
            </div>
            <div className="ledger-strip">
              <p className="eyebrow">Outcome</p>
              <p className="mt-2 text-sm text-foreground">Recommend or gate a switch to a better whitelisted opportunity</p>
            </div>
          </CardContent>
        </Card>
        <IntegrationStatusCard
          health={health}
          settings={dashboard.integrationSettings}
          receipts={dashboard.recentReceipts}
        />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Current demo workspace</CardTitle>
          <CardDescription>Quick facts you can point to before running the workflow live.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div className="ledger-strip">
            <p className="eyebrow">Monitored</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{dashboard.strategies.length}</p>
          </div>
          <div className="ledger-strip">
            <p className="eyebrow">Receipts</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{dashboard.recentReceipts.length}</p>
          </div>
          <div className="ledger-strip">
            <p className="eyebrow">Runs</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{dashboard.recentRuns.length}</p>
          </div>
          <div className="ledger-strip">
            <p className="eyebrow">OpenServ</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{dashboard.integrationSettings.openservMode}</p>
          </div>
          <div className="ledger-strip">
            <p className="eyebrow">Locus</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{dashboard.integrationSettings.locusMode}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
