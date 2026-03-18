import { apiError, apiSuccess } from "@/lib/api";
import { runDemoScenario } from "@/lib/services/workflow-service";
import { requireApiOrganizationContext } from "@/lib/session";

export async function POST() {
  try {
    const workspace = await requireApiOrganizationContext();
    const run = await runDemoScenario(workspace.organization.id, workspace.user.id);
    return apiSuccess(run, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to run demo scenario.", 400);
  }
}
