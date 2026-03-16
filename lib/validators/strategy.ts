import { StrategyStatus } from "@prisma/client";
import { z } from "zod";

export const strategySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().min(3),
  protocol: z.string().min(2),
  network: z.string().min(2),
  assetSymbol: z.string().min(2).max(10),
  currentYield: z.coerce.number().min(0).max(100),
  targetYield: z.coerce.number().min(0).max(100),
  riskScore: z.coerce.number().min(0).max(100),
  status: z.nativeEnum(StrategyStatus).default(StrategyStatus.ACTIVE),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type StrategyInput = z.infer<typeof strategySchema>;
