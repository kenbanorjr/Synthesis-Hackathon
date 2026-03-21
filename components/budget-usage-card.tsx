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
          <div className="rounded-full bg-slate-950 p-3 text-cyan-300">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="overflow-hidden rounded-full border border-slate-300/20 bg-slate-950/10">
          <div className="h-4 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-300" style={{ width: `${budget.budgetUsedPct}%` }} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="ledger-strip p-4">
            <p className="eyebrow text-slate-500">Budget</p>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(budget.monthlyBudgetUsd)}</p>
          </div>
          <div className="ledger-strip p-4">
            <p className="eyebrow text-slate-500">Spent</p>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(budget.spentUsd)}</p>
          </div>
          <div className="ledger-strip p-4">
            <p className="eyebrow text-slate-500">Remaining</p>
            <p className="mt-2 text-xl font-semibold">{formatCurrency(budget.remainingUsd)}</p>
          </div>
        </div>
        {budget.budgetUsedPct > 75 ? (
          <div className="flex items-start gap-3 rounded-[1.35rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            TreasuryPilot is nearing the top of the monthly spend envelope. Consider tightening analytics purchases or lowering auto-execution exposure.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
