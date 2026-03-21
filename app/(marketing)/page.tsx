import Link from "next/link";
import { ArrowRight, Radar, Shield, Wallet, Sparkles, ReceiptText, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <main className="min-h-screen pb-16">
      <section className="relative overflow-hidden px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[92rem]">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="ink-panel grid-fog relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              <div className="max-w-4xl space-y-7">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="eyebrow text-cyan-300">TreasuryPilot</p>
                  <span className="status-capsule border-white/10 bg-white/5 text-slate-200">Hackathon build</span>
                </div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.94] text-white sm:text-6xl lg:text-7xl">
                  Multi-agent treasury operations with receipts, guardrails, and a real spend rail.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  TreasuryPilot watches vault strategies, researches better opportunities, buys premium analytics through
                  Locus when policy allows it, and records every decision in an audit-ready agent dossier.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Open dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/demo">Run demo mode</Link>
                  </Button>
                </div>
                <div className="grid gap-3 pt-4 sm:grid-cols-3">
                  <div className="data-rail">
                    <p className="eyebrow text-slate-400">Ops rail</p>
                    <p className="mt-3 text-lg font-semibold text-white">5 agents</p>
                    <p className="mt-2 text-sm text-slate-300">Monitor, research, risk, execution, and explainer.</p>
                  </div>
                  <div className="data-rail">
                    <p className="eyebrow text-slate-400">Spend rail</p>
                    <p className="mt-3 text-lg font-semibold text-white">Locus</p>
                    <p className="mt-2 text-sm text-slate-300">Premium research calls with approvals and receipts.</p>
                  </div>
                  <div className="data-rail">
                    <p className="eyebrow text-slate-400">Trust rail</p>
                    <p className="mt-3 text-lg font-semibold text-white">OpenServ</p>
                    <p className="mt-2 text-sm text-slate-300">External custom-agent ingress for real orchestration.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <Card className="animate-fade-up bg-[#f7f0e3]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow text-slate-500">Morning brief</p>
                      <CardTitle className="mt-3">Why it feels different</CardTitle>
                      <CardDescription>
                        This is not a generic “AI dashboard.” It reads like an operator desk with spend traces and
                        policy context wired into every action.
                      </CardDescription>
                    </div>
                    <div className="rounded-full bg-slate-950 p-3 text-cyan-300">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="ledger-strip flex items-start gap-3">
                    <Orbit className="mt-1 h-4 w-4 text-cyan-700" />
                    <p className="text-sm">Operator-first control room instead of consumer SaaS chrome.</p>
                  </div>
                  <div className="ledger-strip flex items-start gap-3">
                    <ReceiptText className="mt-1 h-4 w-4 text-amber-700" />
                    <p className="text-sm">Receipts, approvals, and execution rails are surfaced as first-class artifacts.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="animate-fade-up ink-panel text-slate-100" style={{ animationDelay: "120ms" }}>
                <CardHeader>
                  <CardTitle className="text-white">Judge-ready path</CardTitle>
                  <CardDescription className="text-slate-300">
                    Open the dashboard, seed the workspace, run the workflow, then inspect the run dossier and ledger.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-200">
                  <p className="data-rail border-white/10 text-slate-200">1. Open the control room.</p>
                  <p className="data-rail border-white/10 text-slate-200">2. Seed the USDC Yield Vault scenario.</p>
                  <p className="data-rail border-white/10 text-slate-200">3. Trigger the workflow and inspect receipts.</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="relative z-0 mt-6 grid gap-5 lg:grid-cols-3">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} className="animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-fit rounded-[1.1rem] bg-slate-950 p-3 text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="status-capsule border-slate-300/20 bg-slate-900/5 text-slate-600">
                        pillar {index + 1}
                      </span>
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
        <div className="mx-auto grid max-w-[92rem] gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Hackathon fit</CardTitle>
              <CardDescription>
                TreasuryPilot is intentionally shaped to satisfy both target tracks without requiring sign-in first.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="ledger-strip p-5">
                <p className="eyebrow text-cyan-700">OpenServ</p>
                <h3 className="mt-3 text-2xl font-semibold">Meaningful multi-agent orchestration</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  The monitor, research, risk, execution, and explainer agents share a typed workflow contract and leave an auditable run transcript.
                </p>
              </div>
              <div className="ledger-strip p-5">
                <p className="eyebrow text-amber-700">Locus</p>
                <h3 className="mt-3 text-2xl font-semibold">Wallets, budgets, approvals, receipts</h3>
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
              <p className="ledger-strip">1. Seed the USDC Yield Vault scenario.</p>
              <p className="ledger-strip">2. Show the budget, strategy posture, and policy limits.</p>
              <p className="ledger-strip">3. Run the workflow and show the premium analytics receipt.</p>
              <p className="ledger-strip">4. Walk through the agent timeline and approval outcome.</p>
              <p className="ledger-strip">5. Close on how OpenServ and Locus each own a critical part of the system.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
