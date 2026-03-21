import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("section-rule flex flex-col gap-6 pb-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow text-cyan-300">TreasuryPilot</p>
          <span className="status-capsule border-white/10 bg-white/5 text-slate-300">Editorial cockpit</span>
        </div>
        <div className="max-w-4xl">
          <h1 className="text-4xl font-semibold text-slate-50 md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
