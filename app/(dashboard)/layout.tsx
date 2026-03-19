import Link from "next/link";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { SessionButton } from "@/components/session-button";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { requireCurrentOrganizationContext } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const workspace = await requireCurrentOrganizationContext();
  const runCount = await prisma.agentRun.count({
    where: { organizationId: workspace.organization.id }
  });
  const badgeCounts = {
    "/runs": runCount
  };

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar
        organizationName={workspace.organization.name}
        userLabel={workspace.user.email ?? workspace.user.name ?? "Operator"}
        badgeCounts={badgeCounts}
      />
      <div className="flex-1">
        <header className="sticky top-0 z-40 border-b border-white/70 bg-background/75 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <MobileNav badgeCounts={badgeCounts} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">OpenServ + Locus</p>
                <p className="text-sm text-muted-foreground">Policy-guarded treasury operations with receipts on every spend.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" variant="outline">
                <Link href="/">Back to landing</Link>
              </Button>
              <SessionButton action="signOut" variant="outline" />
            </div>
          </div>
        </header>
        <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
