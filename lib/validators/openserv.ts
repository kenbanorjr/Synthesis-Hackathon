import { TriggerType } from "@prisma/client";
import { z } from "zod";
import { triggerWorkflowSchema } from "@/lib/validators/workflow";

const openServNumericIdSchema = z.union([z.number().int(), z.string().min(1)]);

export const openServLegacyTriggerSchema = triggerWorkflowSchema.extend({
  organizationId: z.string().cuid(),
  initiatedByUserId: z.string().cuid().optional()
});

export const openServChatActionSchema = z
  .object({
    type: z.literal("respond-chat-message"),
    me: z
      .object({
        id: openServNumericIdSchema,
        name: z.string().optional()
      })
      .passthrough(),
    messages: z.array(
      z
        .object({
          id: openServNumericIdSchema.optional(),
          author: z.string().optional(),
          message: z.string(),
          createdAt: z.string().optional()
        })
        .passthrough()
    ),
    workspace: z
      .object({
        id: openServNumericIdSchema,
        goal: z.string().optional()
      })
      .passthrough()
  })
  .passthrough();

export const openServTaskActionSchema = z
  .object({
    type: z.literal("do-task"),
    me: z
      .object({
        id: openServNumericIdSchema,
        name: z.string().optional()
      })
      .passthrough()
      .optional(),
    task: z
      .object({
        id: openServNumericIdSchema,
        input: z.unknown().optional(),
        body: z.string().optional(),
        description: z.string().optional(),
        title: z.string().optional()
      })
      .passthrough(),
    workspace: z
      .object({
        id: openServNumericIdSchema,
        goal: z.string().optional()
      })
      .passthrough()
  })
  .passthrough();

export const openServAgentActionSchema = z.discriminatedUnion("type", [
  openServChatActionSchema,
  openServTaskActionSchema
]);

export const openServRunRequestSchema = z.object({
  organizationId: z.string().cuid().optional(),
  strategyId: z.string().cuid().optional(),
  triggerType: z.nativeEnum(TriggerType).optional()
});

export type OpenServAgentActionInput = z.infer<typeof openServAgentActionSchema>;
export type OpenServRunRequestInput = z.infer<typeof openServRunRequestSchema>;
