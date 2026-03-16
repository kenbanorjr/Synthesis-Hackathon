import { apiError, apiSuccess } from "@/lib/api";
import { runDemoScenario } from "@/lib/services/workflow-service";

export async function POST() {
  try {
    const run = await runDemoScenario();
    return apiSuccess(run, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to run demo scenario.", 400);
  }
}
