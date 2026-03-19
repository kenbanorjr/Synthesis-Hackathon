"use client";

import { startTransition, useEffect, useState } from "react";
import { StrategyStatus } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { strategySchema, type StrategyInput } from "@/lib/validators/strategy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type StrategyFormValues = z.input<typeof strategySchema>;
type EditableStrategy = {
  id: string;
  name: string;
  protocol: string;
  network: string;
  assetSymbol: string;
  currentYield: number;
  targetYield: number;
  riskScore: number;
  status: StrategyStatus;
  metadata?: Record<string, unknown> | null;
};

function getEmptyStrategyValues(): StrategyFormValues {
  return {
    name: "",
    protocol: "",
    network: "",
    assetSymbol: "",
    currentYield: 0,
    targetYield: 0,
    riskScore: 0,
    status: StrategyStatus.ACTIVE,
    metadata: {}
  };
}

function getFormValues(strategy?: EditableStrategy | null): StrategyFormValues {
  if (!strategy) {
    return getEmptyStrategyValues();
  }

  return {
    id: strategy.id,
    name: strategy.name,
    protocol: strategy.protocol,
    network: strategy.network,
    assetSymbol: strategy.assetSymbol,
    currentYield: strategy.currentYield,
    targetYield: strategy.targetYield,
    riskScore: strategy.riskScore,
    status: strategy.status,
    metadata:
      strategy.metadata && typeof strategy.metadata === "object" && !Array.isArray(strategy.metadata)
        ? strategy.metadata
        : {}
  };
}

export function StrategyForm({
  strategy = null,
  mode = "create",
  onCreateNew,
  onSaved,
  resetToken = 0
}: {
  strategy?: EditableStrategy | null;
  mode?: "create" | "edit";
  onCreateNew?: () => void;
  onSaved?: (strategy: EditableStrategy) => void;
  resetToken?: number;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const isEditing = mode === "edit" && Boolean(strategy?.id);
  const form = useForm<StrategyFormValues, undefined, StrategyInput>({
    resolver: zodResolver(strategySchema),
    defaultValues: getFormValues(strategy)
  });
  const [metadataText, setMetadataText] = useState(() => JSON.stringify(form.getValues("metadata") ?? {}, null, 2));

  useEffect(() => {
    const nextValues = getFormValues(strategy);
    form.reset(nextValues);
    setMetadataText(JSON.stringify(nextValues.metadata ?? {}, null, 2));
  }, [form, mode, resetToken, strategy?.id]);

  function parseMetadata(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    const parsed = JSON.parse(trimmed) as unknown;

    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new Error("Metadata must be a JSON object.");
    }

    return parsed as Record<string, unknown>;
  }

  async function onSubmit(values: StrategyInput) {
    let metadata: StrategyInput["metadata"];

    try {
      metadata = parseMetadata(metadataText);
      form.clearErrors("metadata");
    } catch (error) {
      form.setError("metadata", {
        type: "manual",
        message: error instanceof Error ? error.message : "Metadata must be valid JSON."
      });
      return;
    }

    setIsPending(true);
    startTransition(async () => {
      const response = await fetch("/api/strategies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          metadata
        })
      });

      const payload = (await response.json()) as {
        data: EditableStrategy | null;
        error: { message: string } | null;
      };

      if (!response.ok) {
        toast.error(payload.error?.message ?? "Failed to save strategy.");
        setIsPending(false);
        return;
      }

      if (payload.data) {
        onSaved?.(payload.data);
      }

      toast.success(isEditing ? "Strategy updated." : "Strategy saved.", { duration: 2500 });
      router.refresh();
      setIsPending(false);
    });
  }

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <CardTitle>{isEditing ? "Edit monitored strategy" : "Create a monitored strategy"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Update an existing strategy before triggering a new agent run."
              : "Add a new strategy with live telemetry and demo-ready metadata."}
          </CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={onCreateNew}>
          <Plus className="h-4 w-4" />
          Add strategy
        </Button>
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
                value={form.watch("status")}
                onValueChange={(value) =>
                  form.setValue("status", value as StrategyStatus, { shouldDirty: true, shouldValidate: true })
                }
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
              value={metadataText}
              onChange={(event) => {
                const value = event.target.value;
                setMetadataText(value);

                try {
                  const metadata = parseMetadata(value);
                  form.clearErrors("metadata");
                  form.setValue("metadata", metadata, { shouldDirty: true });
                } catch (error) {
                  form.setError("metadata", {
                    type: "manual",
                    message: error instanceof Error ? error.message : "Metadata must be valid JSON."
                  });
                }
              }}
            />
            {form.formState.errors.metadata ? (
              <p className="text-sm text-destructive">{form.formState.errors.metadata.message as string}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Use a JSON object for strategy telemetry, vault addresses, or demo context.
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : isEditing ? "Save changes" : "Create strategy"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
