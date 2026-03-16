"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, RefreshCw, Radar } from "lucide-react";
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

  toast.success(successMessage);
}

export function DemoActions() {
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo mode</CardTitle>
        <CardDescription>Load the seeded vault scenario, trigger the workflow, and refresh the dashboard for a live demo in under two minutes.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <Button
          disabled={isSeeding}
          onClick={() => {
            setIsSeeding(true);
            startTransition(async () => {
              try {
                await invoke("/api/demo/seed", "Demo data reseeded.");
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to seed demo.");
              } finally {
                setIsSeeding(false);
              }
            });
          }}
        >
          <RefreshCw className="h-4 w-4" />
          {isSeeding ? "Seeding..." : "Seed demo workspace"}
        </Button>
        <Button
          variant="secondary"
          disabled={isRunning}
          onClick={() => {
            setIsRunning(true);
            startTransition(async () => {
              try {
                await invoke("/api/demo/run", "Agent workflow completed.");
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to run demo.");
              } finally {
                setIsRunning(false);
              }
            });
          }}
        >
          <Play className="h-4 w-4" />
          {isRunning ? "Running..." : "Run full workflow"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            router.push("/runs");
          }}
        >
          <Radar className="h-4 w-4" />
          Review audit trail
        </Button>
      </CardContent>
    </Card>
  );
}
