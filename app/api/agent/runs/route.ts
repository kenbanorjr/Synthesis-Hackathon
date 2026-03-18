import { apiError, apiSuccess } from "@/lib/api";
import { listAgentRuns } from "@/lib/services/workflow-service";
import { requireApiOrganizationContext } from "@/lib/session";

export async function GET() {
  try {
    const workspace = await requireApiOrganizationContext();
    const runs = await listAgentRuns(workspace.organization.id);
    return apiSuccess(runs);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load agent runs.", 500);
  }
}
