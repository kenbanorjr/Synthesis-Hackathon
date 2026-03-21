"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Radar, RefreshCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

async function invoke(endpoint: string, successMessage: string) {
  const response = await fetch(endpoint, {
    method: "POST"
  });

  const payload = (await response.json()) as { error: { message: string } | null };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Request failed.");
  }

  toast.success(successMessage, { duration: 2500 });
}

export function DemoActions() {
  const router = useRouter();
  const actionLockRef = useRef(false);
  const [busyAction, setBusyAction] = useState<"seed" | "reset" | "run" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"info" | "success" | "warning">("info");

  useEffect(() => {
    if (typeof router.prefetch === "function") {
      router.prefetch("/runs");
      router.prefetch("/dashboard");
    }
  }, [router]);

  function runAction(input: {
    action: "seed" | "reset" | "run";
    endpoint: string;
    successMessage: string;
    readyMessage?: string | null;
  }) {
    if (actionLockRef.current) {
      return;
    }

    actionLockRef.current = true;
    setBusyAction(input.action);
    setStatusTone("info");
    setStatusMessage(
      input.action === "seed"
        ? "Preparing the baseline treasury briefing."
        : input.action === "reset"
          ? "Resetting the workspace to a clean editorial state."
          : "Running the full monitor to explainer workflow."
    );

    startTransition(async () => {
      try {
        await invoke(input.endpoint, input.successMessage);
        setStatusTone("success");
        setStatusMessage(input.readyMessage ?? null);
        router.refresh();
      } catch (error) {
        setStatusTone("warning");
        setStatusMessage(error instanceof Error ? error.message : "Request failed.");
        toast.error(error instanceof Error ? error.message : "Request failed.");
      } finally {
        actionLockRef.current = false;
        setBusyAction(null);
      }
    });
  }

  const isBusy = busyAction !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo mode</CardTitle>
        <CardDescription>
          Load the seeded vault scenario, trigger the workflow, and refresh the dashboard for a live demo in under two minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="data-rail">
            <p className="eyebrow">Mission</p>
            <p className="mt-3 text-sm text-slate-100">Seed a realistic treasury posture, buy premium research, and surface a recommendation with auditable receipts.</p>
          </div>
          <div className="data-rail">
            <p className="eyebrow">Flow</p>
            <p className="mt-3 text-sm text-slate-100">Monitor, research, risk, execution readiness, and explainer output all resolve through one guided run.</p>
          </div>
          <div className="data-rail">
            <p className="eyebrow">Operator note</p>
            <p className="mt-3 text-sm text-slate-100">Every action below shows inline state immediately so the demo never feels like a dead click.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Button
            disabled={isBusy}
            onClick={() => {
              runAction({
                action: "seed",
                endpoint: "/api/demo/seed",
                successMessage: "Demo workspace seeded.",
                readyMessage: "Demo workspace ready — run the workflow."
              });
            }}
          >
            <RefreshCw className="h-4 w-4" />
            {busyAction === "seed" ? "Seeding..." : "Seed demo workspace"}
          </Button>
          <Button
            variant="outline"
            disabled={isBusy}
            onClick={() => {
              runAction({
                action: "reset",
                endpoint: "/api/demo/reset",
                successMessage: "Demo workspace reset.",
                readyMessage: "Demo workspace ready — run the workflow."
              });
            }}
          >
            <RefreshCcw className="h-4 w-4" />
            {busyAction === "reset" ? "Resetting..." : "Reset to clean state"}
          </Button>
          <Button
            variant="secondary"
            disabled={isBusy}
            onClick={() => {
              runAction({
                action: "run",
                endpoint: "/api/demo/run",
                successMessage: "Agent workflow completed."
              });
            }}
          >
            <Play className="h-4 w-4" />
            {busyAction === "run" ? "Running..." : "Run full workflow"}
          </Button>
          <Button
            variant="outline"
            disabled={isBusy}
            onClick={() => {
              if (actionLockRef.current) {
                return;
              }
              setStatusTone("info");
              setStatusMessage("Opening the audit trail and receipt ledger.");
              router.push("/runs");
            }}
          >
            <Radar className="h-4 w-4" />
            Review audit trail
          </Button>
        </div>

        {statusMessage ? (
          <div
            aria-live="polite"
            className={cn(
              "rounded-[1.35rem] border px-4 py-4 text-sm font-medium md:col-span-2 xl:col-span-4",
              statusTone === "success"
                ? "border-emerald-400/30 bg-emerald-300/10 text-emerald-100"
                : statusTone === "warning"
                  ? "border-amber-400/30 bg-amber-300/10 text-amber-100"
                  : "border-cyan-400/20 bg-cyan-300/10 text-cyan-50"
            )}
          >
            <p className="eyebrow mb-2 text-current/80">Demo status</p>
            <p>{statusMessage}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
