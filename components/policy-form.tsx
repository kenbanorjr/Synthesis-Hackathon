"use client";

import { startTransition, useState } from "react";
import { ActionType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { defaultAllowedProviders } from "@/lib/constants";
import { actionLabel } from "@/lib/serializers";
import { policySchema, type PolicyInput } from "@/lib/validators/policy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const actionOptions = Object.values(ActionType);
type PolicyFormValues = z.input<typeof policySchema>;

export function PolicyForm({
  policy
}: {
  policy: {
    monthlyBudgetUsd: number;
    maxSpendPerActionUsd: number;
    approvalThresholdUsd: number;
    allowedProviders: string[];
    allowedActions: ActionType[];
    autoExecuteLowRisk: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [providerDraft, setProviderDraft] = useState("");
  const form = useForm<PolicyFormValues, undefined, PolicyInput>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      monthlyBudgetUsd: policy.monthlyBudgetUsd,
      maxSpendPerActionUsd: policy.maxSpendPerActionUsd,
      approvalThresholdUsd: policy.approvalThresholdUsd,
      allowedProviders: policy.allowedProviders,
      allowedActions: policy.allowedActions,
      autoExecuteLowRisk: policy.autoExecuteLowRisk
    }
  });

  const selectedProviders = form.watch("allowedProviders") ?? [];
  const selectedActions = form.watch("allowedActions") ?? [];
  const autoExecuteLowRisk = form.watch("autoExecuteLowRisk");
  const providerOptions = [...new Set([...selectedProviders, ...defaultAllowedProviders])];

  async function onSubmit(values: PolicyInput) {
    setIsPending(true);
    startTransition(async () => {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { error: { message: string } | null };

      if (!response.ok) {
        toast.error(payload.error?.message ?? "Failed to save policy.");
        setIsPending(false);
        return;
      }

      toast.success("Treasury policy updated.");
      router.refresh();
      setIsPending(false);
    });
  }

  function toggleProvider(provider: string) {
    const providers = form.getValues("allowedProviders") ?? [];
    form.setValue(
      "allowedProviders",
      providers.includes(provider) ? providers.filter((value) => value !== provider) : [...providers, provider],
      { shouldDirty: true, shouldValidate: true }
    );
  }

  function toggleAction(action: ActionType) {
    const actions = form.getValues("allowedActions") ?? [];
    form.setValue(
      "allowedActions",
      actions.includes(action) ? actions.filter((value) => value !== action) : [...actions, action],
      { shouldDirty: true, shouldValidate: true }
    );
  }

  function addProvider() {
    const provider = providerDraft.trim().toLowerCase();

    if (!provider) {
      return;
    }

    if (selectedProviders.includes(provider)) {
      toast.error("That provider is already in the policy.");
      return;
    }

    form.setValue("allowedProviders", [...selectedProviders, provider], {
      shouldDirty: true,
      shouldValidate: true
    });
    setProviderDraft("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy settings</CardTitle>
        <CardDescription>Bound the treasury by budget, approval threshold, and a whitelist of providers and actions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="monthlyBudgetUsd">Monthly Budget (USD)</Label>
              <Input id="monthlyBudgetUsd" type="number" step="0.01" {...form.register("monthlyBudgetUsd")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSpendPerActionUsd">Max Spend Per Action</Label>
              <Input id="maxSpendPerActionUsd" type="number" step="0.01" {...form.register("maxSpendPerActionUsd")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvalThresholdUsd">Approval Threshold</Label>
              <Input id="approvalThresholdUsd" type="number" step="0.01" {...form.register("approvalThresholdUsd")} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <Label>Allowed providers</Label>
              <div className="flex flex-wrap gap-3">
                {providerOptions.map((provider) => {
                  const active = selectedProviders.includes(provider);
                  return (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => toggleProvider(provider)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white/70 hover:bg-muted"
                      )}
                    >
                      {provider}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Add custom provider"
                  value={providerDraft}
                  onChange={(event) => setProviderDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addProvider();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addProvider}>
                  Add provider
                </Button>
              </div>
              {form.formState.errors.allowedProviders ? (
                <p className="text-sm text-destructive">{form.formState.errors.allowedProviders.message as string}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Default whitelisted providers are preloaded, and custom providers remain visible after saving.
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label>Allowed actions</Label>
              <div className="flex flex-wrap gap-3">
                {actionOptions.map((action) => {
                  const active = selectedActions.includes(action);
                  return (
                    <button
                      key={action}
                      type="button"
                      onClick={() => toggleAction(action)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white/70 hover:bg-muted"
                      )}
                    >
                      {actionLabel(action)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[1.5rem] border border-border/70 bg-muted/60 px-5 py-4">
            <div>
              <Label htmlFor="autoExecuteLowRisk">Auto-execute low-risk actions</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                When enabled, TreasuryPilot can execute bounded low-risk actions that stay within the approval threshold.
              </p>
            </div>
            <Switch
              id="autoExecuteLowRisk"
              checked={autoExecuteLowRisk}
              onCheckedChange={(checked) =>
                form.setValue("autoExecuteLowRisk", checked, { shouldDirty: true, shouldValidate: true })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save policy"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
