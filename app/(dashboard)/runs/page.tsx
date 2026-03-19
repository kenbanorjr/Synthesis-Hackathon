export const dynamic = "force-dynamic";

import { AgentRunsList } from "@/components/agent-runs-list";
import { PageHeader } from "@/components/page-header";
import { getAuditLog } from "@/lib/services/dashboard-service";
import { requireCurrentOrganizationContext } from "@/lib/session";

export default async function RunsPage() {
  const workspace = await requireCurrentOrganizationContext();
  const runs = await getAuditLog(workspace.organization.id);

  return (
    <>
      <PageHeader
        title="Agent runs"
        description="Inspect the full monitor → research → risk → execution → explainer trail for every decision the system makes."
      />
      <AgentRunsList runs={runs as never} />
    </>
  );
}
