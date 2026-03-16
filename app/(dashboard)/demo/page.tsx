export const dynamic = "force-dynamic";

import { DemoActions } from "@/components/demo-actions";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";

export default async function DemoPage() {
  const workspace = await getDemoUserWithWorkspace();
  const dashboard = await getDashboardData(workspace.id);

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
            <CardDescription>The default path is designed to surface one premium analytics purchase and one actionable recommendation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Strategy: USDC Yield Vault</p>
            <p>Trigger: yield dropped below target</p>
            <p>Research: buy premium analytics through Locus</p>
            <p>Risk: validate provider whitelist, action whitelist, budget, and approval threshold</p>
            <p>Outcome: recommend or gate a switch to a better whitelisted opportunity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current demo workspace</CardTitle>
            <CardDescription>Quick facts you can point to before running the workflow live.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Monitored strategies: {dashboard.strategies.length}</p>
            <p>Recent receipts: {dashboard.recentReceipts.length}</p>
            <p>Recent agent runs: {dashboard.recentRuns.length}</p>
            <p>OpenServ mode: {dashboard.integrationSettings.openservMode}</p>
            <p>Locus mode: {dashboard.integrationSettings.locusMode}</p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
