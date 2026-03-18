import {
  ExecutionMode,
  ExecutionStatus,
  AgentType,
  ApprovalStatus,
  StepStatus,
  ReceiptStatus,
  RunStatus,
  DecisionOutcome
} from "@prisma/client";
import { prisma } from "@/lib/db";

export async function resolveApprovalRequest(
  approvalId: string,
  organizationId: string,
  action: "approve" | "reject",
  note?: string
) {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalId },
    include: {
      agentRun: {
        include: {
          receipts: true,
          recommendation: true,
          executionRecords: true
        }
      }
    }
  });

  if (!approval || approval.agentRun.organizationId !== organizationId) {
    throw new Error("Approval request not found.");
  }

  if (approval.status !== ApprovalStatus.PENDING) {
    throw new Error("Approval request has already been resolved.");
  }

  const resolvedAt = new Date();
  const status = action === "approve" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
  const pendingReceiptCount = approval.agentRun.receipts.filter(
    (receipt) => receipt.status === ReceiptStatus.PENDING_APPROVAL
  ).length;
  const finalDecision =
    action === "approve"
      ? approval.agentRun.recommendation
        ? DecisionOutcome.RECOMMENDED
        : DecisionOutcome.NO_ACTION
      : DecisionOutcome.REJECTED;

  return prisma.$transaction(async (tx) => {
    await tx.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status,
        reason: note ? `${approval.reason}\n\nOperator note: ${note}` : approval.reason,
        resolvedAt
      }
    });

    if (approval.agentRun.receipts.length > 0) {
      await tx.paymentReceipt.updateMany({
        where: {
          agentRunId: approval.agentRunId,
          status: ReceiptStatus.PENDING_APPROVAL
        },
        data: {
          status: action === "approve" ? ReceiptStatus.COMPLETED : ReceiptStatus.REJECTED
        }
      });
    }

    await tx.agentStep.create({
      data: {
        agentRunId: approval.agentRunId,
        agentType: AgentType.EXECUTION,
        title:
          action === "approve"
            ? "Execution Agent recorded operator approval for the gated spend."
            : "Execution Agent recorded operator rejection for the gated spend.",
        input: {
          approvalId,
          previousDecision: approval.agentRun.finalDecision,
          pendingReceiptCount,
          note: note ?? null
        },
        output: {
          approvalStatus: status,
          finalDecision,
          receiptStatus:
            pendingReceiptCount > 0
              ? action === "approve"
                ? ReceiptStatus.COMPLETED
                : ReceiptStatus.REJECTED
              : "unchanged",
          summary:
            action === "approve"
              ? "The gated Locus spend was approved and the recommendation remains available for bounded operator execution."
              : "The operator rejected the gated spend, so the payment and downstream action path were stopped."
        },
        status: action === "approve" ? StepStatus.SUCCESS : StepStatus.SKIPPED
      }
    });

    if (action === "approve") {
      const existingExecution = approval.agentRun.executionRecords[0];

      if (existingExecution) {
        await tx.executionRecord.update({
          where: { id: existingExecution.id },
          data: {
            status: ExecutionStatus.APPROVED,
            mode: ExecutionMode.DRY_RUN,
            dryRun: true,
            rationale:
              note
                ? `${existingExecution.rationale}\n\nOperator note: ${note}`
                : existingExecution.rationale
          }
        });
      } else if (approval.agentRun.recommendation) {
        await tx.executionRecord.create({
          data: {
            organizationId,
            agentRunId: approval.agentRunId,
            actionType: "SWITCH_STRATEGY",
            provider: "treasury-pilot",
            chain: "base",
            assetSymbol: "USDC",
            amountUsd: 240,
            mode: ExecutionMode.DRY_RUN,
            status: ExecutionStatus.APPROVED,
            dryRun: true,
            idempotencyKey: `approval-${approvalId}`,
            rationale:
              "Operator approved the gated analytics spend. TreasuryPilot recorded the downstream action as an approved dry run pending live execution enablement.",
            metadata: {
              source: "approval-resolution"
            }
          }
        });
      }
    }

    const run = await tx.agentRun.update({
      where: { id: approval.agentRunId },
      data: {
        requiresApproval: false,
        status: RunStatus.COMPLETED,
        finalDecision,
        completedAt: resolvedAt
      },
      include: {
        strategy: true,
        steps: { orderBy: { createdAt: "asc" } },
        receipts: { orderBy: { createdAt: "desc" } },
        recommendation: true,
        approvalRequest: true,
        executionRecords: { orderBy: { createdAt: "desc" } }
      }
    });

    return run;
  });
}
