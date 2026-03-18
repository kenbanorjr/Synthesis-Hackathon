import { Bot, Search, Shield, Rocket, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusChip } from "@/components/status-chip";
import { formatDateTime } from "@/lib/formatters";

const icons = {
  MONITOR: Bot,
  RESEARCH: Search,
  RISK: Shield,
  EXECUTION: Rocket,
  EXPLAINER: ScrollText
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getSummary(output: unknown) {
  if (!isRecord(output)) {
    return null;
  }

  if (typeof output.summary === "string") {
    return output.summary;
  }

  if (typeof output.headline === "string") {
    return output.headline;
  }

  return null;
}

function getHighlights(output: unknown) {
  if (!isRecord(output)) {
    return [];
  }

  const highlights: Array<{ label: string; value: string; variant: "default" | "info" | "warning" | "success" }> = [];

  if (typeof output.triggerType === "string") {
    highlights.push({ label: "Trigger", value: output.triggerType.replaceAll("_", " "), variant: "info" });
  }

  if (typeof output.severity === "string") {
    highlights.push({ label: "Severity", value: output.severity, variant: output.severity === "high" ? "warning" : "info" });
  }

  if (typeof output.provider === "string") {
    highlights.push({ label: "Provider", value: output.provider, variant: "default" });
  }

  if (typeof output.actionType === "string") {
    highlights.push({ label: "Action", value: output.actionType.replaceAll("_", " "), variant: "default" });
  }

  if (typeof output.purchaseStatus === "string" && output.purchaseStatus !== "not_requested") {
    highlights.push({
      label: "Spend",
      value: output.purchaseStatus.replaceAll("_", " "),
      variant: output.purchaseStatus === "completed" ? "success" : "warning"
    });
  }

  if (typeof output.finalDecision === "string") {
    highlights.push({
      label: "Decision",
      value: output.finalDecision.replaceAll("_", " "),
      variant: output.finalDecision === "BLOCKED" ? "warning" : "success"
    });
  }

  if (typeof output.lowRisk === "boolean") {
    highlights.push({
      label: "Risk",
      value: output.lowRisk ? "Low risk" : "Review required",
      variant: output.lowRisk ? "success" : "warning"
    });
  }

  if (isRecord(output.selectedOpportunity) && typeof output.selectedOpportunity.label === "string") {
    highlights.push({
      label: "Opportunity",
      value: output.selectedOpportunity.label,
      variant: "info"
    });
  }

  return highlights.slice(0, 4);
}

export function WorkflowTimeline({
  steps
}: {
  steps: Array<{
    id: string;
    agentType: keyof typeof icons;
    title: string;
    status: string;
    output: unknown;
    createdAt: string;
  }>;
}) {
  return (
    <ScrollArea className="h-[24rem] pr-4">
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = icons[step.agentType];
          const summary = getSummary(step.output);
          const highlights = getHighlights(step.output);

          return (
            <div key={step.id} className="rounded-3xl border border-border/70 bg-white/70 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {step.agentType} • {formatDateTime(step.createdAt)}
                    </p>
                  </div>
                </div>
                <StatusChip value={step.status} />
              </div>
              {summary ? <p className="mt-4 text-sm text-foreground">{summary}</p> : null}
              {highlights.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {highlights.map((highlight) => (
                    <Badge key={`${step.id}-${highlight.label}`} variant={highlight.variant}>
                      {highlight.label}: {highlight.value}
                    </Badge>
                  ))}
                </div>
              ) : null}
              <details className="mt-4">
                <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Raw structured output
                </summary>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-950/95 p-4 text-xs text-slate-50">
                  {JSON.stringify(step.output ?? null, null, 2)}
                </pre>
              </details>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
