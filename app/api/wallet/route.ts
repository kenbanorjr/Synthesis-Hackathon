import { apiError, apiSuccess, parseJson } from "@/lib/api";
import { requireApiOrganizationContext } from "@/lib/session";
import { getOrganizationWallet, upsertOrganizationWallet } from "@/lib/services/wallet-service";
import { walletSchema } from "@/lib/validators/wallet";

export async function GET() {
  try {
    const workspace = await requireApiOrganizationContext();
    const wallet = await getOrganizationWallet(workspace.organization.id);
    return apiSuccess(wallet);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load wallet settings.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const workspace = await requireApiOrganizationContext();
    const input = await parseJson(request, walletSchema);
    const wallet = await upsertOrganizationWallet(workspace.organization.id, input);
    return apiSuccess(wallet, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to save wallet settings.", 400);
  }
}
