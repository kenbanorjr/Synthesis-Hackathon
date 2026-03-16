"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, Radar, Bot, Receipt, PlayCircle } from "lucide-react";
import { navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = [LayoutDashboard, Shield, Radar, Bot, Receipt, PlayCircle] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col justify-between border-r border-white/70 bg-white/70 p-6 backdrop-blur xl:flex">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">TreasuryPilot</p>
          <h2 className="text-2xl font-semibold">Agentic treasury ops</h2>
          <p className="text-sm text-muted-foreground">OpenServ research, Locus spend controls, and full receipts in one cockpit.</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = icons[index];
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active ? "bg-primary text-primary-foreground shadow-panel" : "hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-slate-50">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Tracks</p>
        <div className="mt-3 space-y-2 text-sm">
          <p>OpenServ powers the multi-agent workflow.</p>
          <p>Locus handles spend controls, wallets, approvals, and receipts.</p>
        </div>
      </div>
    </aside>
  );
}
