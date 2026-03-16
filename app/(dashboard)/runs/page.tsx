export const dynamic = "force-dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatusChip } from "@/components/status-chip";
import { WorkflowTimeline } from "@/components/workflow-timeline";
import { getAuditLog } from "@/lib/services/dashboard-service";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";
import { formatDateTime } from "@/lib/formatters";

export default async function RunsPage() {
  const workspace = await getDemoUserWithWorkspace();
  const runs = await getAuditLog(workspace.id);

  return (
    <>
      <PageHeader
        title="Agent runs"
        description="Inspect the full monitor → research → risk → execution → explainer trail for every decision the system makes."
      />
      <section className="space-y-6">
        {runs.map((run) => (
          <Card key={run.id}>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>{run.recommendation?.headline ?? run.triggerSummary}</CardTitle>
                  <CardDescription>
                    {run.strategy?.name} • {run.triggerSummary} • {formatDateTime(run.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusChip value={run.status} />
                  <StatusChip value={run.finalDecision} />
                  {run.requiresApproval ? <StatusChip value="PENDING_APPROVAL" /> : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <div className="rounded-[1.5rem] bg-muted/70 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Rationale</p>
                  <p className="mt-3 text-sm text-foreground">{run.recommendation?.rationale ?? run.triggerSummary}</p>
                </div>
                <div className="rounded-[1.5rem] bg-muted/70 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Proposed Action</p>
                  <p className="mt-3 text-sm text-foreground">{run.recommendation?.proposedAction ?? "No action proposed."}</p>
                </div>
                {run.approvalRequest ? (
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
                    <p className="text-sm font-semibold text-amber-900">{run.approvalRequest.title}</p>
                    <p className="mt-2 text-sm text-amber-800">{run.approvalRequest.reason}</p>
                  </div>
                ) : null}
              </div>
              <WorkflowTimeline steps={run.steps as never} />
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
