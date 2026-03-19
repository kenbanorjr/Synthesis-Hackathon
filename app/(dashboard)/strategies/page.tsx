export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/page-header";
import { StrategiesManager } from "@/components/strategies-manager";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { requireCurrentOrganizationContext } from "@/lib/session";

export default async function StrategiesPage() {
  const workspace = await requireCurrentOrganizationContext();
  const dashboard = await getDashboardData(workspace.organization.id);

  return (
    <>
      <PageHeader
        title="Monitored strategies"
        description="Maintain the active treasury positions and tune their live telemetry before you trigger a new multi-agent run."
      />
      <StrategiesManager strategies={dashboard.strategies as never} />
    </>
  );
}
