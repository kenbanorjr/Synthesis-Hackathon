"use client";

import { startTransition, useState } from "react";
import { StrategyStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { strategySchema, type StrategyInput } from "@/lib/validators/strategy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function StrategyForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<StrategyInput>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      name: "USDC Yield Vault",
      protocol: "Spark",
      network: "Base",
      assetSymbol: "USDC",
      currentYield: 4.1,
      targetYield: 6.2,
      riskScore: 37,
      status: StrategyStatus.ACTIVE,
      metadata: {
        positionUsd: 250000
      }
    }
  });

  async function onSubmit(values: StrategyInput) {
    setIsPending(true);
    startTransition(async () => {
      const response = await fetch("/api/strategies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { error: { message: string } | null };

      if (!response.ok) {
        toast.error(payload.error?.message ?? "Failed to save strategy.");
        setIsPending(false);
        return;
      }

      toast.success("Strategy saved.");
      router.refresh();
      setIsPending(false);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add or tune a monitored strategy</CardTitle>
        <CardDescription>Keep the demo realistic by adjusting live strategy telemetry before you trigger an agent run.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Strategy name</Label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Input id="protocol" {...form.register("protocol")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Input id="network" {...form.register("network")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetSymbol">Asset symbol</Label>
              <Input id="assetSymbol" {...form.register("assetSymbol")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentYield">Current yield</Label>
              <Input id="currentYield" type="number" step="0.01" {...form.register("currentYield")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetYield">Target yield</Label>
              <Input id="targetYield" type="number" step="0.01" {...form.register("targetYield")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="riskScore">Risk score</Label>
              <Input id="riskScore" type="number" step="0.01" {...form.register("riskScore")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                defaultValue={form.getValues("status")}
                onValueChange={(value) => form.setValue("status", value as StrategyStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(StrategyStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata JSON</Label>
            <Textarea
              id="metadata"
              defaultValue={JSON.stringify(form.getValues("metadata"), null, 2)}
              onChange={(event) => {
                try {
                  form.setValue("metadata", JSON.parse(event.target.value) as Record<string, unknown>);
                } catch {
                  form.setError("metadata", {
                    type: "manual",
                    message: "Metadata must be valid JSON."
                  });
                }
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save strategy"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
