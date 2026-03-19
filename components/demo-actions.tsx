"use client";

import { startTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Radar, RefreshCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

    startTransition(async () => {
      try {
        await invoke(input.endpoint, input.successMessage);
        setStatusMessage(input.readyMessage ?? null);
        router.refresh();
      } catch (error) {
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
        <CardDescription>Load the seeded vault scenario, trigger the workflow, and refresh the dashboard for a live demo in under two minutes.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            router.push("/runs");
          }}
        >
          <Radar className="h-4 w-4" />
          Review audit trail
        </Button>
        {statusMessage ? (
          <div
            aria-live="polite"
            className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 md:col-span-2 xl:col-span-4"
          >
            {statusMessage}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
