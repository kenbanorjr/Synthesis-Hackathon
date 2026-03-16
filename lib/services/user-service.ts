import { appConfig } from "@/lib/config";
import { prisma } from "@/lib/db";

export async function getDemoUserWithWorkspace() {
  const user = await prisma.user.findUnique({
    where: { email: appConfig.demoUserEmail },
    include: {
      treasuryPolicy: true,
      integrationSettings: true
    }
  });

  if (!user || !user.treasuryPolicy || !user.integrationSettings) {
    throw new Error("Demo workspace is not initialized. Run the seed command or POST /api/demo/seed.");
  }

  return user;
}
