import {
  ApprovalStatus,
  ReceiptStatus,
  RunStatus,
  DecisionOutcome
} from "@prisma/client";
import { prisma } from "@/lib/db";

export async function resolveApprovalRequest(approvalId: string, action: "approve" | "reject", note?: string) {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalId },
    include: {
      agentRun: {
        include: {
          receipts: true
        }
      }
    }
  });

  if (!approval) {
    throw new Error("Approval request not found.");
  }

  const resolvedAt = new Date();
  const status = action === "approve" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

  await prisma.approvalRequest.update({
    where: { id: approvalId },
    data: {
      status,
      reason: note ? `${approval.reason}\n\nOperator note: ${note}` : approval.reason,
      resolvedAt
    }
  });

  if (approval.agentRun.receipts.length > 0) {
    await prisma.paymentReceipt.updateMany({
      where: {
        agentRunId: approval.agentRunId,
        status: ReceiptStatus.PENDING_APPROVAL
      },
      data: {
        status: action === "approve" ? ReceiptStatus.COMPLETED : ReceiptStatus.REJECTED
      }
    });
  }

  const run = await prisma.agentRun.update({
    where: { id: approval.agentRunId },
    data: {
      requiresApproval: false,
      status: RunStatus.COMPLETED,
      finalDecision: action === "approve" ? DecisionOutcome.EXECUTED : DecisionOutcome.REJECTED,
      completedAt: resolvedAt
    },
    include: {
      strategy: true,
      steps: { orderBy: { createdAt: "asc" } },
      receipts: { orderBy: { createdAt: "desc" } },
      recommendation: true,
      approvalRequest: true
    }
  });

  return run;
}
