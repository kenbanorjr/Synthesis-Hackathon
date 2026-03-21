"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { navItems } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MobileNav({ badgeCounts }: { badgeCounts?: Partial<Record<string, number>> }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="xl:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="space-y-6">
          <div>
            <p className="eyebrow text-cyan-300">TreasuryPilot</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Control room</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Navigate the treasury desk, review the latest dossiers, and trigger the live demo path.
            </p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const pending = pendingHref === item.href && !active;
              const badgeCount = badgeCounts?.[item.href];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setPendingHref(item.href)}
                  className={cn(
                    "flex items-center gap-3 rounded-[1.15rem] border px-4 py-3 text-sm font-medium transition",
                    active
                      ? "border-cyan-300/20 bg-cyan-400 text-slate-950"
                      : pending
                        ? "border-cyan-400/20 bg-white/10 text-white"
                        : "border-white/5 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
                  )}
                >
                  <span>{item.label}</span>
                  {typeof badgeCount === "number" ? (
                    <span className="mono-ui ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
                      {badgeCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
