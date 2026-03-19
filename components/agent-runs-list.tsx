"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ApprovalActions } from "@/components/approval-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/status-chip";
import { WorkflowTimeline } from "@/components/workflow-timeline";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type RunRecord = {
  id: string;
  triggerSummary: string;
  status: string;
  requiresApproval: boolean;
  finalDecision: string;
  createdAt: string;
  recommendation: {
    headline: string;
    rationale: string;
    proposedAction: string;
  } | null;
  strategy: {
    name: string;
  } | null;
  receipts: Array<{
    id: string;
    provider: string;
    purpose: string;
    amountUsd: number;
    status: string;
    externalTxId?: string | null;
    reason: string;
    metadata?: unknown;
    createdAt: string;
  }>;
  approvalRequest: {
    id: string;
    title: string;
    reason: string;
    status: string;
    requestedAt: string;
    resolvedAt?: string | null;
  } | null;
  executionRecords: Array<{
    id: string;
    provider: string;
    chain: string;
    amountUsd: number;
    mode: string;
    status: string;
    rationale: string;
    idempotencyKey: string;
  }>;
  steps: Array<{
    id: string;
    agentType: string;
    title: string;
    status: string;
    input: unknown;
    output: unknown;
    createdAt: string;
  }>;
};

function getRunBadges(run: RunRecord) {
  const badges = [run.status];

  if (run.finalDecision !== run.status) {
    badges.push(run.finalDecision);
  }

  if (
    run.approvalRequest &&
    run.approvalRequest.status !== run.status &&
    run.approvalRequest.status !== run.finalDecision
  ) {
    badges.push(run.approvalRequest.status);
  }

  return badges;
}

export function AgentRunsList({ runs }: { runs: RunRecord[] }) {
  const [expandedRunIds, setExpandedRunIds] = useState<string[]>(runs[0] ? [runs[0].id] : []);

  function toggleRun(runId: string) {
    setExpandedRunIds((current) => (current.includes(runId) ? current.filter((id) => id !== runId) : [...current, runId]));
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          No runs yet. Seed the workspace or trigger the demo flow to inspect the multi-agent timeline.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      {runs.map((run) => {
        const isExpanded = expandedRunIds.includes(run.id);
        const badges = getRunBadges(run);

        return (
          <Card key={run.id} className={cn(isExpanded ? "border-primary/40" : "")}>
            <button type="button" className="w-full text-left" onClick={() => toggleRun(run.id)}>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>{run.recommendation?.headline ?? run.triggerSummary}</CardTitle>
                    <CardDescription>
                      {run.strategy?.name} • {run.triggerSummary} • {formatDateTime(run.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {badges.map((badge) => (
                      <StatusChip key={`${run.id}-${badge}`} value={badge} />
                    ))}
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded ? "rotate-180" : "")} />
                  </div>
                </div>
              </CardHeader>
            </button>
            {isExpanded ? (
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
                  {run.receipts.length > 0 ? (
                    <div className="rounded-[1.5rem] bg-muted/70 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Receipt Trail</p>
                        <p className="text-xs text-muted-foreground">Locus-backed payment and policy audit</p>
                      </div>
                      <div className="mt-4 space-y-3">
                        {run.receipts.map((receipt) => (
                          <div key={receipt.id} className="rounded-[1.15rem] border border-border/70 bg-white/80 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-medium text-foreground">
                                  {receipt.provider}
                                  {receipt.metadata &&
                                  typeof receipt.metadata === "object" &&
                                  typeof (receipt.metadata as Record<string, unknown>).endpoint === "string"
                                    ? `/${String((receipt.metadata as Record<string, unknown>).endpoint)}`
                                    : ""}
                                </p>
                                <p className="mt-1 text-sm text-foreground">{receipt.purpose}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{receipt.reason}</p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  {formatDateTime(receipt.createdAt)}
                                  {receipt.externalTxId ? ` • ${receipt.externalTxId}` : ""}
                                </p>
                                {receipt.metadata &&
                                typeof receipt.metadata === "object" &&
                                typeof (receipt.metadata as Record<string, unknown>).approvalUrl === "string" ? (
                                  <a
                                    href={String((receipt.metadata as Record<string, unknown>).approvalUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
                                  >
                                    Open approval in Locus
                                  </a>
                                ) : null}
                              </div>
                              <div className="flex flex-col items-start gap-2 sm:items-end">
                                <p className="text-sm font-semibold text-foreground">{formatCurrency(receipt.amountUsd)}</p>
                                <StatusChip value={receipt.status} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {run.approvalRequest ? (
                    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-amber-900">{run.approvalRequest.title}</p>
                        <StatusChip value={run.approvalRequest.status} />
                      </div>
                      <p className="mt-2 text-sm text-amber-800">{run.approvalRequest.reason}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-700/80">
                        Requested {formatDateTime(run.approvalRequest.requestedAt)}
                      </p>
                      {run.approvalRequest.status === "PENDING" ? (
                        <ApprovalActions approvalId={run.approvalRequest.id} />
                      ) : run.approvalRequest.resolvedAt ? (
                        <p className="mt-4 text-sm text-amber-900">
                          Resolved {formatDateTime(run.approvalRequest.resolvedAt)}.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {run.executionRecords.length > 0 ? (
                    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-emerald-900">Execution readiness</p>
                        <StatusChip value={run.executionRecords[0].status} />
                      </div>
                      <p className="mt-3 text-sm text-emerald-900">
                        {run.executionRecords[0].mode.replaceAll("_", " ")} via {run.executionRecords[0].provider} on{" "}
                        {run.executionRecords[0].chain} for {formatCurrency(run.executionRecords[0].amountUsd)}.
                      </p>
                      <p className="mt-2 text-sm text-emerald-800">{run.executionRecords[0].rationale}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-emerald-700/80">
                        Idempotency key {run.executionRecords[0].idempotencyKey}
                      </p>
                    </div>
                  ) : null}
                </div>
                <WorkflowTimeline steps={run.steps as never} />
              </CardContent>
            ) : null}
          </Card>
        );
      })}
    </section>
  );
}
