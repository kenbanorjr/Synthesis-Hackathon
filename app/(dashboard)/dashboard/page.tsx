export const dynamic = "force-dynamic";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetUsageCard } from "@/components/budget-usage-card";
import { IntegrationStatusCard } from "@/components/integration-status-card";
import { LatestRecommendationCard } from "@/components/latest-recommendation-card";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { ReceiptsTable } from "@/components/receipts-table";
import { StrategyOverviewCard } from "@/components/strategy-overview-card";
import { WorkflowTimeline } from "@/components/workflow-timeline";
import { getSystemHealth } from "@/lib/services/health-service";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { formatCurrency } from "@/lib/formatters";
import { requireCurrentOrganizationContext } from "@/lib/session";

export default async function DashboardPage() {
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
        title="Treasury control room"
        description="One view for strategy health, budget use, the latest recommendation, and every receipt produced by the agent workflow."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Monthly budget" value={formatCurrency(dashboard.budget.monthlyBudgetUsd)} subtext={`${dashboard.budget.budgetUsedPct.toFixed(0)}% used by analytics and execution receipts`} />
        <MetricCard label="Remaining budget" value={formatCurrency(dashboard.budget.remainingUsd)} subtext="Available for premium data or bounded actions this month" />
        <MetricCard label="Yield spread" value={`${dashboard.overview.strategySpread.toFixed(2)}%`} subtext="Current minus target yield across the primary strategy" />
        <MetricCard label="Average risk score" value={dashboard.overview.avgRiskScore.toFixed(1)} subtext={`${dashboard.overview.alertsOpen} run(s) currently waiting on action`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StrategyOverviewCard strategy={dashboard.primaryStrategy} />
        <div className="space-y-6">
          <BudgetUsageCard budget={dashboard.budget} />
          <IntegrationStatusCard
            health={health}
            settings={dashboard.integrationSettings}
            receipts={dashboard.recentReceipts}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <LatestRecommendationCard latestRun={dashboard.latestRun} />
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Workflow Timeline</TabsTrigger>
            <TabsTrigger value="receipts">Recent Receipts</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline">
            {dashboard.latestRun ? (
              <WorkflowTimeline steps={dashboard.latestRun.steps as never} />
            ) : (
              <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-5 text-sm text-muted-foreground">
                No workflow has been triggered yet.
              </div>
            )}
          </TabsContent>
          <TabsContent value="receipts">
            <ReceiptsTable receipts={dashboard.recentReceipts} />
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
