import { PrismaClient } from "@prisma/client";
import { seedDemoWorkspace } from "@/lib/services/demo-seed-service";

const prisma = new PrismaClient();

async function main() {
  await seedDemoWorkspace(prisma);
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
