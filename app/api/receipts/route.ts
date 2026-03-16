import { apiError, apiSuccess } from "@/lib/api";
import { listReceiptsForUser } from "@/lib/services/payment-service";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";

export async function GET() {
  try {
    const workspace = await getDemoUserWithWorkspace();
    const receipts = await listReceiptsForUser(workspace.id, 50);
    return apiSuccess(receipts);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load receipts.", 500);
  }
}
