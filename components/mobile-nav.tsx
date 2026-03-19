"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { navItems } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav({ badgeCounts }: { badgeCounts?: Partial<Record<string, number>> }) {
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">TreasuryPilot</p>
            <h2 className="mt-2 text-2xl font-semibold">Control room</h2>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const badgeCount = badgeCounts?.[item.href];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium hover:bg-muted"
                >
                  <span>{item.label}</span>
                  {typeof badgeCount === "number" ? (
                    <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
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
