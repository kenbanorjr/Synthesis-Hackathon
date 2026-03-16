import { appConfig } from "@/lib/config";
import { prisma } from "@/lib/db";
import { getOpenServAdapter } from "@/lib/integrations/openserv";
import { getLocusAdapter } from "@/lib/integrations/locus";
import { getDemoUserWithWorkspace } from "@/lib/services/user-service";

export async function getSystemHealth() {
  const workspace = await getDemoUserWithWorkspace().catch(() => null);
  const [openservHealth, locusHealth] = await Promise.all([
    getOpenServAdapter(workspace?.integrationSettings.openservMode ?? appConfig.openservMode).health(),
    getLocusAdapter(workspace?.integrationSettings.locusMode ?? appConfig.locusMode).health()
  ]);

  let database = {
    ok: true,
    message: "Database reachable."
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = {
      ok: false,
      message: "Database query failed."
    };
  }

  return {
    app: {
      ok: true,
      message: "TreasuryPilot is running."
    },
    database,
    openserv: openservHealth,
    locus: locusHealth
  };
}
