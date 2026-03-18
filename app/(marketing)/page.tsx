import Link from "next/link";
import { ArrowRight, Radar, Shield, Wallet } from "lucide-react";
import { SessionButton } from "@/components/session-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOptionalCurrentUser } from "@/lib/session";

const pillars = [
  {
    icon: Radar,
    title: "OpenServ-powered multi-agent ops",
    description: "Monitor, research, risk, execution, and explainer agents collaborate around one treasury trigger."
  },
  {
    icon: Wallet,
    title: "Locus spend controls",
    description: "Every analytics purchase or bounded spend respects budget caps, approval thresholds, and provider whitelists."
  },
  {
    icon: Shield,
    title: "Receipts and auditability",
    description: "Each run captures rationale, receipts, and the exact policy logic used to allow, block, or request approval."
  }
];

export default async function MarketingPage() {
  const user = await getOptionalCurrentUser();

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-panel sm:px-10 sm:py-10">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">TreasuryPilot</p>
                <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
                  Multi-agent treasury operations with bounded automation and full spend receipts.
                </h1>
                <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                  TreasuryPilot watches vault strategies, researches better opportunities, optionally buys premium analytics through Locus, and recommends or executes bounded actions backed by OpenServ workflows.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={user ? "/dashboard" : "/signin"}>
                    {user ? "Open dashboard" : "Open workspace"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {user ? (
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/demo">Run demo mode</Link>
                  </Button>
                ) : (
                  <SessionButton action="signIn" provider="google" callbackUrl="/dashboard" variant="secondary" />
                )}
              </div>
            </div>
          </div>
          <div className="-mt-10 grid gap-5 lg:grid-cols-3">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="w-fit rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{pillar.title}</CardTitle>
                    <CardDescription>{pillar.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{user ? "Your TreasuryPilot workspace" : "Hackathon fit"}</CardTitle>
              <CardDescription>
                {user
                  ? "This workspace is ready for a signed-in demo flow with policy controls, receipts, and approvals."
                  : "TreasuryPilot is intentionally shaped to satisfy both target tracks."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-muted/70 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-primary">OpenServ</p>
                <h3 className="mt-2 text-2xl font-semibold">Meaningful multi-agent orchestration</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  The monitor, research, risk, execution, and explainer agents share a typed workflow contract and leave an auditable run transcript.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-muted/70 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-primary">Locus</p>
                <h3 className="mt-2 text-2xl font-semibold">Wallets, budgets, approvals, receipts</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Premium analytics purchases flow through a Locus adapter that enforces policy, emits receipts, and keeps a treasury spend ledger.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo script</CardTitle>
              <CardDescription>A tight two-minute walkthrough for judges and mentors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Seed the USDC Yield Vault scenario.</p>
              <p>2. Show the budget, strategy posture, and policy limits.</p>
              <p>3. Run the workflow and show the premium analytics receipt.</p>
              <p>4. Walk through the agent timeline and approval outcome.</p>
              <p>5. Close on how OpenServ and Locus each own a critical part of the system.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
