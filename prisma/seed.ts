import { PrismaClient } from "@prisma/client";
import { appConfig } from "@/lib/config";
import { seedDemoWorkspace } from "@/lib/services/demo-seed-service";
import { ensureUserOrganization } from "@/lib/services/organization-service";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: appConfig.demoUserEmail },
    update: {
      name: "TreasuryPilot Demo Operator"
    },
    create: {
      email: appConfig.demoUserEmail,
      name: "TreasuryPilot Demo Operator"
    }
  });
  const workspace = await ensureUserOrganization(user.id);
  await seedDemoWorkspace(prisma, {
    organizationId: workspace.organization.id,
    userId: user.id
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to seed TreasuryPilot", error);
    await prisma.$disconnect();
    process.exit(1);
  });
