import { ActionType, DecisionOutcome, RunStatus } from "@prisma/client";
import { resolveWorkflowOutcome } from "@/lib/services/workflow-service";

describe("resolveWorkflowOutcome", () => {
  it("returns a recommendation when the run is safe but not auto-executable", () => {
    const result = resolveWorkflowOutcome({
      triggerDetected: true,
      purchaseBlocked: false,
      actionAllowed: true,
      requiresApproval: false,
      canAutoExecute: false,
      actionType: ActionType.SWITCH_STRATEGY
    });

    expect(result).toEqual({
      finalDecision: DecisionOutcome.RECOMMENDED,
      runStatus: RunStatus.COMPLETED
    });
  });

  it("requests approval when the policy threshold is crossed", () => {
    const result = resolveWorkflowOutcome({
      triggerDetected: true,
      purchaseBlocked: false,
      actionAllowed: true,
      requiresApproval: true,
      canAutoExecute: false,
      actionType: ActionType.SWITCH_STRATEGY
    });

    expect(result).toEqual({
      finalDecision: DecisionOutcome.AWAITING_APPROVAL,
      runStatus: RunStatus.AWAITING_APPROVAL
    });
  });

  it("blocks the run when policy enforcement fails", () => {
    const result = resolveWorkflowOutcome({
      triggerDetected: true,
      purchaseBlocked: false,
      actionAllowed: false,
      requiresApproval: false,
      canAutoExecute: false,
      actionType: ActionType.HEDGE_POSITION
    });

    expect(result).toEqual({
      finalDecision: DecisionOutcome.BLOCKED,
      runStatus: RunStatus.BLOCKED
    });
  });
});
