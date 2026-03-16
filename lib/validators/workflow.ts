import { TriggerType } from "@prisma/client";
import { z } from "zod";

export const triggerWorkflowSchema = z.object({
  strategyId: z.string().cuid().optional(),
  triggerType: z.nativeEnum(TriggerType).optional()
});

export const demoSeedSchema = z.object({
  reset: z.boolean().optional().default(true)
});

export type TriggerWorkflowInput = z.infer<typeof triggerWorkflowSchema>;
