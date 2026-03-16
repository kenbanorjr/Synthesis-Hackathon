import { Bot, Search, Shield, Rocket, ScrollText } from "lucide-react";
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
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950/95 p-4 text-xs text-slate-50">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
