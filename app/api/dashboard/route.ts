import { apiError, apiSuccess } from "@/lib/api";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";

export async function GET() {
  try {
    const workspace = await getDemoUserWithWorkspace();
    const dashboard = await getDashboardData(workspace.id);
    return apiSuccess(dashboard);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load dashboard data.", 500);
  }
}
