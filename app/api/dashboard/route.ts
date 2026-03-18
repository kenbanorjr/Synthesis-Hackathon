import { apiError, apiSuccess } from "@/lib/api";
import { getDashboardData } from "@/lib/services/dashboard-service";
import { requireApiOrganizationContext } from "@/lib/session";

export async function GET() {
  try {
    const workspace = await requireApiOrganizationContext();
    const dashboard = await getDashboardData(workspace.organization.id);
    return apiSuccess(dashboard);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load dashboard data.", 500);
  }
}
