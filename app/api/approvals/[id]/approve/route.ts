import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { resolveApprovalRequest } from "@/lib/services/approval-service";
import { serializeRun } from "@/lib/serializers";
import { approvalResolutionSchema } from "@/lib/validators/approval";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const input = await parseJson(request, approvalResolutionSchema);
    const run = await resolveApprovalRequest(id, "approve", input.note);
    return apiSuccess(serializeRun(run));
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to approve request.", 400);
  }
}
