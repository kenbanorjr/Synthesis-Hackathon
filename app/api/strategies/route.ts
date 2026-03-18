import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { listStrategies, upsertStrategy } from "@/lib/services/strategy-service";
import { requireApiOrganizationContext } from "@/lib/session";
import { strategySchema } from "@/lib/validators/strategy";

export async function GET() {
  try {
    const workspace = await requireApiOrganizationContext();
    const strategies = await listStrategies(workspace.organization.id);
    return apiSuccess(strategies);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load strategies.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await requireApiOrganizationContext();
    const input = await parseJson(request, strategySchema);
    const strategy = await upsertStrategy(workspace.organization.id, input);
    return apiSuccess(strategy, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to save strategy.", 400);
  }
}
