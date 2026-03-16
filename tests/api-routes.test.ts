import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/services/workflow-service", () => ({
  runAgentWorkflow: vi.fn().mockResolvedValue({ id: "run_1" })
}));

vi.mock("@/lib/services/approval-service", () => ({
  resolveApprovalRequest: vi.fn().mockResolvedValue({ id: "run_2" })
}));

vi.mock("@/lib/serializers", async () => {
  const actual = await vi.importActual<typeof import("@/lib/serializers")>("@/lib/serializers");
  return {
    ...actual,
    serializeRun: vi.fn().mockImplementation((value) => value)
  };
});

vi.mock("@/lib/services/demo-seed-service", () => ({
  seedDemoWorkspace: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $disconnect: vi.fn()
  })),
  TriggerType: {
    YIELD_DROP: "YIELD_DROP",
    RISK_INCREASE: "RISK_INCREASE",
    BETTER_OPPORTUNITY: "BETTER_OPPORTUNITY",
    MANUAL_REVIEW: "MANUAL_REVIEW"
  }
}));

describe("API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/agent/run returns normalized data", async () => {
    const { POST } = await import("@/app/api/agent/run/route");
    const response = await POST(
      new Request("http://localhost/api/agent/run", {
        method: "POST",
        body: JSON.stringify({ triggerType: "YIELD_DROP" })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.error).toBeNull();
    expect(payload.data).toEqual({ id: "run_1" });
  });

  it("POST /api/approvals/[id]/approve resolves an approval", async () => {
    const { POST } = await import("@/app/api/approvals/[id]/approve/route");
    const response = await POST(
      new Request("http://localhost/api/approvals/approval_1/approve", {
        method: "POST",
        body: JSON.stringify({ note: "Looks good." })
      }),
      {
        params: Promise.resolve({ id: "approval_1" })
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual({ id: "run_2" });
  });

  it("POST /api/demo/seed reseeds the workspace", async () => {
    const { POST } = await import("@/app/api/demo/seed/route");
    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.data).toEqual({ seeded: true });
  });
});
