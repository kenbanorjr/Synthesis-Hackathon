import { z } from "zod";
import { triggerWorkflowSchema } from "@/lib/validators/workflow";

export const openServIngressSchema = triggerWorkflowSchema.extend({
  organizationId: z.string().cuid(),
  initiatedByUserId: z.string().cuid().optional()
});
