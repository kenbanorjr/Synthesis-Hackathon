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
    <Card className="animate-fade-up">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">{subtext}</CardContent>
    </Card>
  );
}
