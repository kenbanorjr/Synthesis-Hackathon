import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { runAgentWorkflow } from "@/lib/services/workflow-service";
import { triggerWorkflowSchema } from "@/lib/validators/workflow";

export async function POST(request: Request) {
  try {
    const input = await parseJson(request, triggerWorkflowSchema);
    const run = await runAgentWorkflow(input);
    return apiSuccess(run, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to run agents.", 400);
  }
}
