import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { runAgentWorkflow } from "@/lib/services/workflow-service";
import { requireApiOrganizationContext } from "@/lib/session";
import { triggerWorkflowSchema } from "@/lib/validators/workflow";

export async function POST(request: Request) {
  try {
    const workspace = await requireApiOrganizationContext();
    const input = await parseJson(request, triggerWorkflowSchema);
    const run = await runAgentWorkflow({
      ...input,
      organizationId: workspace.organization.id,
      initiatedByUserId: workspace.user.id
    });
    return apiSuccess(run, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to run agents.", 400);
  }
}
