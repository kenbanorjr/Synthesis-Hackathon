import { apiError, apiSuccess } from "@/lib/api";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";
import { listAgentRuns } from "@/lib/services/workflow-service";

export async function GET() {
  try {
    const workspace = await getDemoUserWithWorkspace();
    const runs = await listAgentRuns(workspace.id);
    return apiSuccess(runs);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load agent runs.", 500);
  }
}
