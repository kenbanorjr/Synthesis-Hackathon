import { apiError, apiSuccess } from "@/lib/api";
import { getSystemHealth } from "@/lib/services/health-service";
import { getOptionalCurrentOrganizationContext } from "@/lib/session";

export async function GET() {
  try {
    const workspace = await getOptionalCurrentOrganizationContext();
    const health = await getSystemHealth({
      openservMode: workspace?.integrationSettings.openservMode,
      locusMode: workspace?.integrationSettings.locusMode,
      executionSettings: workspace?.executionSettings ?? null
    });
    return apiSuccess(health);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load health status.", 500);
  }
}
