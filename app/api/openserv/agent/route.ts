import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { appConfig } from "@/lib/config";
import { runAgentWorkflow } from "@/lib/services/workflow-service";
import { openServIngressSchema } from "@/lib/validators/openserv";

function isAuthorized(request: Request) {
  if (!appConfig.openservApiKey) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${appConfig.openservApiKey}`;
}

export async function GET() {
  return apiSuccess({
    ok: true,
    app: appConfig.appName,
    ingressPath: appConfig.openservIngressPath,
    capabilities: [
      "run_treasury_workflow",
      "yield_drop_detection",
      "policy_guardrails",
      "locus_receipts",
      "bounded_execution_records"
    ]
  });
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return apiError("Unauthorized OpenServ request.", 401);
    }

    const input = await parseJson(request, openServIngressSchema);
    const run = await runAgentWorkflow(input);

    return apiSuccess(
      {
        action: "run_treasury_workflow",
        run
      },
      201
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to process OpenServ workflow.", 400);
  }
}
