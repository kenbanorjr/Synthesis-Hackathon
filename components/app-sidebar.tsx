"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Shield, Radar, Bot, Receipt, PlayCircle } from "lucide-react";
import { navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = [LayoutDashboard, Shield, Radar, Bot, Receipt, PlayCircle] as const;

export function AppSidebar({
  organizationName,
  userLabel,
  badgeCounts
}: {
  organizationName: string;
  userLabel: string;
  badgeCounts?: Partial<Record<string, number>>;
}) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <aside className="cockpit-shell hidden w-80 shrink-0 flex-col justify-between border-r border-white/10 p-6 text-slate-100 xl:flex">
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-3">
            <p className="eyebrow text-cyan-300">TreasuryPilot</p>
            <h2 className="text-3xl font-semibold text-white">Agentic treasury desk</h2>
            <p className="max-w-xs text-sm leading-6 text-slate-300">
              OpenServ orchestration, Locus spend rails, and audit-ready receipts in one operational cockpit.
            </p>
          </div>
          <div className="data-rail grid-fog overflow-hidden rounded-[1.55rem] p-5">
            <p className="eyebrow text-slate-400">Workspace</p>
            <p className="mt-4 text-lg font-semibold text-white">{organizationName}</p>
            <p className="mt-1 text-sm text-slate-300">{userLabel}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="status-capsule border-cyan-400/15 bg-cyan-400/10 text-cyan-200">Open rail</span>
              <span className="status-capsule border-amber-300/15 bg-amber-300/10 text-amber-100">Bounded spend</span>
            </div>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = icons[index];
            const active = pathname === item.href;
            const pending = pendingHref === item.href && !active;
            const badgeCount = badgeCounts?.[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setPendingHref(item.href)}
                className={cn(
                  "group flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition",
                  active
                    ? "border-cyan-300/20 bg-cyan-400 text-slate-950 shadow-panel"
                    : pending
                      ? "border-cyan-400/20 bg-white/8 text-white"
                      : "border-white/5 bg-white/[0.03] text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-slate-950" : pending ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-300")} />
                <span>{item.label}</span>
                {typeof badgeCount === "number" ? (
                  <span
                    className={cn(
                      "mono-ui ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      active
                        ? "bg-slate-950/10 text-slate-950"
                        : pending
                          ? "bg-white/10 text-cyan-200"
                          : "bg-white/8 text-slate-300"
                    )}
                  >
                    {badgeCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="data-rail rounded-[1.55rem] p-5">
        <p className="eyebrow text-slate-400">Tracks</p>
        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
          <p>OpenServ powers the multi-agent workflow.</p>
          <p>Locus handles spend controls, wallets, approvals, and receipts.</p>
        </div>
        <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Hackathon mode is open by default. Optional auth can be added back later for per-org access.
        </div>
      </div>
    </aside>
  );
}
