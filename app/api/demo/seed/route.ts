import { PrismaClient } from "@prisma/client";
import { apiError, apiSuccess } from "@/lib/api";
import { seedDemoWorkspace } from "@/lib/services/demo-seed-service";

export async function POST() {
  const client = new PrismaClient();

  try {
    await seedDemoWorkspace(client);
    return apiSuccess({ seeded: true }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to seed demo data.", 500);
  } finally {
    await client.$disconnect();
  }
}
