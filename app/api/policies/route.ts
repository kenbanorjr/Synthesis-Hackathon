import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";
import { getPolicyForUser, upsertPolicy } from "@/lib/services/policy-service";
import { serializePolicy } from "@/lib/serializers";
import { policySchema } from "@/lib/validators/policy";

export async function GET() {
  try {
    const workspace = await getDemoUserWithWorkspace();
    const policy = await getPolicyForUser(workspace.id);
    return apiSuccess(serializePolicy(policy));
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load policy.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await getDemoUserWithWorkspace();
    const input = await parseJson(request, policySchema);
    const policy = await upsertPolicy(workspace.id, input);
    return apiSuccess(policy, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to save policy.", 400);
  }
}
