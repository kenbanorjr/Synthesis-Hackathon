import { fireEvent, render, screen } from "@testing-library/react";
import { AgentRunsList } from "@/components/agent-runs-list";

const runs = [
  {
    id: "run_1",
    triggerSummary: "Yield dropped below target",
    status: "COMPLETED",
    requiresApproval: false,
    finalDecision: "RECOMMENDED",
    createdAt: "2026-03-19T09:00:00.000Z",
    recommendation: {
      headline: "Switch to Morpho Prime USDC",
      rationale: "Higher yield with similar risk.",
      proposedAction: "Move 25% of idle reserves."
    },
    strategy: { name: "USDC Yield Vault" },
    receipts: [],
    approvalRequest: null,
    executionRecords: [],
    steps: []
  },
  {
    id: "run_2",
    triggerSummary: "Premium analytics pending approval",
    status: "AWAITING_APPROVAL",
    requiresApproval: true,
    finalDecision: "AWAITING_APPROVAL",
    createdAt: "2026-03-18T09:00:00.000Z",
    recommendation: {
      headline: "Request premium analytics",
      rationale: "Need more research before migrating.",
      proposedAction: "Pause until approval."
    },
    strategy: { name: "Treasury Ladder" },
    receipts: [],
    approvalRequest: {
      id: "approval_1",
      title: "Approval required",
      reason: "Premium analytics exceeds threshold.",
      status: "PENDING",
      requestedAt: "2026-03-18T09:05:00.000Z",
      resolvedAt: null
    },
    executionRecords: [],
    steps: []
  }
];

describe("AgentRunsList", () => {
  it("starts with the latest run expanded and older runs collapsed", () => {
    render(<AgentRunsList runs={runs as never} />);

    expect(screen.getByText("Move 25% of idle reserves.")).toBeInTheDocument();
    expect(screen.queryByText("Pause until approval.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Request premium analytics/i }));

    expect(screen.getByText("Pause until approval.")).toBeInTheDocument();
    expect(screen.getAllByText(/AWAITING APPROVAL/i)).toHaveLength(1);
    expect(screen.getAllByText("PENDING").length).toBeGreaterThanOrEqual(1);
  });
});
