import { ActionType } from "@prisma/client";
import { z } from "zod";
import { defaultAllowedActions, defaultAllowedProviders } from "@/lib/constants";

export const policySchema = z.object({
  monthlyBudgetUsd: z.coerce.number().positive(),
  maxSpendPerActionUsd: z.coerce.number().positive(),
  approvalThresholdUsd: z.coerce.number().positive(),
  allowedProviders: z.array(z.string().min(2)).min(1).default([...defaultAllowedProviders]),
  allowedActions: z.array(z.nativeEnum(ActionType)).min(1).default([...defaultAllowedActions]),
  autoExecuteLowRisk: z.boolean().default(false)
}).refine((value) => value.approvalThresholdUsd <= value.maxSpendPerActionUsd, {
  path: ["approvalThresholdUsd"],
  message: "Approval threshold cannot exceed the per-action spend limit."
});

export type PolicyInput = z.infer<typeof policySchema>;
