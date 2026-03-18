import { apiError, apiSuccess } from "@/lib/api";
import { listReceiptsForOrganization } from "@/lib/services/payment-service";
import { requireApiOrganizationContext } from "@/lib/session";

export async function GET() {
  try {
    const workspace = await requireApiOrganizationContext();
    const receipts = await listReceiptsForOrganization(workspace.organization.id, 50);
    return apiSuccess(receipts);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load receipts.", 500);
  }
}
