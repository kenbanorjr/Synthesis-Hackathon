import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/services/workflow-service", () => ({
  runAgentWorkflow: vi.fn().mockResolvedValue({ id: "run_1" })
}));

vi.mock("@/lib/services/openserv-service", () => ({
  processOpenServAction: vi.fn().mockResolvedValue(undefined)
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

vi.mock("@/lib/session", () => ({
  requireApiOrganizationContext: vi.fn().mockResolvedValue({
    organization: {
      id: "org_1",
      name: "TreasuryPilot Demo Workspace"
    },
    user: {
      id: "user_1",
      email: "demo@treasurypilot.local"
    }
  })
}));

vi.mock("@prisma/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@prisma/client")>();
  return {
    ...actual,
    PrismaClient: class PrismaClient {
      $disconnect = vi.fn();
    }
  };
});

describe("API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.OPENSERV_API_KEY = "openserv_api_key_test";
    process.env.OPENSERV_AUTH_TOKEN = "openserv_auth_token_test";
  });

  afterEach(() => {
    delete process.env.OPENSERV_API_KEY;
    delete process.env.OPENSERV_AUTH_TOKEN;
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

  it("POST /api/openserv/agent accepts an OpenServ action envelope", async () => {
    const { POST } = await import("@/app/api/openserv/agent/route");
    const response = await POST(
      new Request("http://localhost/api/openserv/agent", {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.OPENSERV_AUTH_TOKEN}`
        },
        body: JSON.stringify({
          type: "do-task",
          task: {
            id: 99,
            input: JSON.stringify({
              organizationId: "cmm000000000000000000000",
              triggerType: "YIELD_DROP"
            })
          },
          workspace: {
            id: 5,
            goal: "Run a treasury workflow"
          }
        })
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.error).toBeNull();
    expect(payload.data).toEqual(
      expect.objectContaining({
        accepted: true,
        type: "do-task"
      })
    );
  });
});
