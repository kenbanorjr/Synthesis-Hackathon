import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";

const variants: Record<string, ComponentProps<typeof Badge>["variant"]> = {
  COMPLETED: "success",
  EXECUTED: "success",
  RECOMMENDED: "info",
  AWAITING_APPROVAL: "warning",
  PENDING: "warning",
  PENDING_APPROVAL: "warning",
  BLOCKED: "destructive",
  REJECTED: "destructive",
  FAILED: "destructive",
  ACTIVE: "default",
  REAL: "info",
  MOCK: "muted",
  AT_RISK: "warning",
  PAUSED: "muted"
};

export function StatusChip({ value }: { value: string }) {
  return <Badge variant={variants[value] ?? "default"}>{value.replaceAll("_", " ")}</Badge>;
}
