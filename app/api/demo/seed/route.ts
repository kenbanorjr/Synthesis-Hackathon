import { apiError, apiSuccess } from "@/lib/api";
import { prisma } from "@/lib/db";
import { seedDemoWorkspace } from "@/lib/services/demo-seed-service";
import { requireApiOrganizationContext } from "@/lib/session";

export async function POST() {
  try {
    const workspace = await requireApiOrganizationContext();
    await seedDemoWorkspace(prisma, {
      organizationId: workspace.organization.id,
      userId: workspace.user.id
    });
    return apiSuccess({ seeded: true }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to seed demo data.", 500);
  }
}
