import Link from "next/link";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
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
      <div className="min-h-screen flex-1">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur">
          <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <MobileNav badgeCounts={badgeCounts} />
              <div className="space-y-1">
                <p className="eyebrow text-cyan-300">OpenServ + Locus</p>
                <p className="text-sm text-slate-300">Policy-guarded treasury operations with receipts on every spend.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" variant="outline">
                <Link href="/">Back to landing</Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto flex max-w-[92rem] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
