import { prisma } from "@/lib/db";
import { OpenServClient } from "@/lib/integrations/openserv/client";
import { runAgentWorkflow } from "@/lib/services/workflow-service";
import {
  openServRunRequestSchema,
  type OpenServAgentActionInput,
  type OpenServRunRequestInput
} from "@/lib/validators/openserv";

function parseJsonCandidate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      return null;
    }

    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

function collectRunRequestCandidates(action: OpenServAgentActionInput) {
  if (action.type === "respond-chat-message") {
    const latestMessage = action.messages.at(-1)?.message;
    return [latestMessage, action.workspace.goal];
  }

  return [action.task.input, action.task.body, action.task.description, action.task.title, action.workspace.goal];
}

async function resolveOrganizationId(input: OpenServRunRequestInput) {
  if (input.organizationId) {
    return input.organizationId;
  }

  const organizations = await prisma.organization.findMany({
    select: {
      id: true
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 2
  });

  if (organizations.length === 1) {
    return organizations[0].id;
  }

  throw new Error(
    'OpenServ requests must include `organizationId`. Send JSON like {"organizationId":"<cuid>","triggerType":"YIELD_DROP"}.'
  );
}

async function extractRunRequest(action: OpenServAgentActionInput) {
  for (const candidate of collectRunRequestCandidates(action)) {
    if (!candidate) {
      continue;
    }

    const parsed =
      typeof candidate === "string"
        ? openServRunRequestSchema.safeParse(parseJsonCandidate(candidate))
        : openServRunRequestSchema.safeParse(candidate);

    if (parsed.success) {
      return parsed.data;
    }
  }

  return openServRunRequestSchema.parse({});
}

function formatRunSummary(run: Awaited<ReturnType<typeof runAgentWorkflow>>) {
  const receipt = run.receipts[0];
  const approval = run.approvalRequest;

  return [
    `Treasury workflow completed for ${run.strategy?.name ?? "the selected strategy"}.`,
    `Decision: ${run.finalDecision.replaceAll("_", " ")}.`,
    receipt
      ? `Research spend: ${receipt.provider}/${String((receipt.metadata as Record<string, unknown> | null)?.endpoint ?? "search")} ${receipt.status.replaceAll("_", " ")}.`
      : "No premium research receipt was created.",
    approval ? `Approval status: ${approval.status.replaceAll("_", " ")}.` : "No additional approval is required."
  ].join(" ");
}

function getIntroductionMessage() {
  return [
    "TreasuryPilot can run a treasury workflow, purchase wrapped-API research through Locus, and return a full audit trail.",
    'Send JSON like {"organizationId":"<cuid>","strategyId":"<optional cuid>","triggerType":"YIELD_DROP"} to run a workflow.',
    "If your workspace only maps to one TreasuryPilot organization, organizationId can be omitted."
  ].join(" ");
}

async function runWorkflowFromAction(action: OpenServAgentActionInput) {
  const runRequest = await extractRunRequest(action);
  const organizationId = await resolveOrganizationId(runRequest);

  return runAgentWorkflow({
    organizationId,
    strategyId: runRequest.strategyId,
    triggerType: runRequest.triggerType
  });
}

export async function processOpenServAction(action: OpenServAgentActionInput) {
  const client = new OpenServClient();

  if (action.type === "respond-chat-message") {
    try {
      const latestMessage = action.messages.at(-1)?.message ?? "";
      const looksLikeRunRequest = latestMessage.includes("{") || Boolean(action.workspace.goal?.includes("{"));
      const message = looksLikeRunRequest ? formatRunSummary(await runWorkflowFromAction(action)) : getIntroductionMessage();

      await client.sendChatMessage({
        workspaceId: action.workspace.id,
        agentId: action.me.id,
        message
      });
    } catch (error) {
      await client.sendChatMessage({
        workspaceId: action.workspace.id,
        agentId: action.me.id,
        message: error instanceof Error ? error.message : "TreasuryPilot could not process the request."
      });
    }

    return;
  }

  try {
    const run = await runWorkflowFromAction(action);

    await client.completeTask({
      workspaceId: action.workspace.id,
      taskId: action.task.id,
      output: formatRunSummary(run)
    });
  } catch (error) {
    await client.reportTaskError({
      workspaceId: action.workspace.id,
      taskId: action.task.id,
      error: error instanceof Error ? error.message : "TreasuryPilot failed to process the OpenServ task."
    });
  }
}
