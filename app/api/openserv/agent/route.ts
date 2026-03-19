import { after } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { appConfig } from "@/lib/config";
import { processOpenServAction } from "@/lib/services/openserv-service";
import { runAgentWorkflow } from "@/lib/services/workflow-service";
import {
  openServAgentActionSchema,
  openServLegacyTriggerSchema
} from "@/lib/validators/openserv";

function matchesSecret(value: string | null, secret: string) {
  return Boolean(secret) && value === secret;
}

function matchesBearerToken(value: string | null, secret: string) {
  return Boolean(secret) && (value === `Bearer ${secret}` || value === secret);
}

function isAuthorized(request: Request) {
  const secrets = [appConfig.openservAuthToken, appConfig.openservApiKey].filter(Boolean);

  if (secrets.length === 0) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization");
  const xApiKey = request.headers.get("x-api-key");
  const xAuthToken = request.headers.get("x-auth-token");
  const openservAuthToken = request.headers.get("openserv-auth-token");

  return secrets.some((secret) => {
    return (
      matchesBearerToken(authorization, secret) ||
      matchesSecret(xApiKey, secret) ||
      matchesSecret(xAuthToken, secret) ||
      matchesSecret(openservAuthToken, secret)
    );
  });
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

    const body = await request.json();
    const legacyInput = openServLegacyTriggerSchema.safeParse(body);

    if (legacyInput.success) {
      const run = await runAgentWorkflow(legacyInput.data);

      return apiSuccess(
        {
          action: "run_treasury_workflow",
          run
        },
        201
      );
    }

    const action = openServAgentActionSchema.parse(body);

    if (process.env.NODE_ENV === "test") {
      await processOpenServAction(action);
    } else {
      after(async () => {
        await processOpenServAction(action);
      });
    }

    return apiSuccess(
      {
        accepted: true,
        type: action.type,
        message: "OK"
      },
      202
    );
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to process OpenServ workflow.", 400);
  }
}
