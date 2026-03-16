import { AlertTriangle, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

export function BudgetUsageCard({
  budget
}: {
  budget: {
    monthlyBudgetUsd: number;
    spentUsd: number;
    remainingUsd: number;
    budgetUsedPct: number;
  };
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget posture</CardTitle>
            <CardDescription>How much of the monthly Locus budget the agents have consumed.</CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="overflow-hidden rounded-full bg-muted">
          <div className="h-4 rounded-full bg-gradient-to-r from-primary via-cyan-500 to-emerald-500" style={{ width: `${budget.budgetUsedPct}%` }} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-muted/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Budget</p>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(budget.monthlyBudgetUsd)}</p>
          </div>
          <div className="rounded-3xl bg-muted/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Spent</p>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(budget.spentUsd)}</p>
          </div>
          <div className="rounded-3xl bg-muted/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Remaining</p>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(budget.remainingUsd)}</p>
          </div>
        </div>
        {budget.budgetUsedPct > 75 ? (
          <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            TreasuryPilot is nearing the top of the monthly spend envelope. Consider tightening analytics purchases or lowering auto-execution exposure.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
