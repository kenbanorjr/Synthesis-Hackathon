import { z } from "zod";

export const approvalResolutionSchema = z.object({
  note: z.string().max(240).optional()
});

export type ApprovalResolutionInput = z.infer<typeof approvalResolutionSchema>;
