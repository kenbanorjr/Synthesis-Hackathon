import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  subtext
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <Card className="animate-fade-up overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <p className="eyebrow text-slate-500">{label}</p>
          <ArrowUpRight className="h-4 w-4 text-cyan-700" />
        </div>
        <CardTitle className="mt-2 text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="ledger-strip text-sm text-slate-600">{subtext}</div>
      </CardContent>
    </Card>
  );
}
