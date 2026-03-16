import { apiError, apiSuccess } from "@/lib/api";
import { getSystemHealth } from "@/lib/services/health-service";

export async function GET() {
  try {
    const health = await getSystemHealth();
    return apiSuccess(health);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load health status.", 500);
  }
}
