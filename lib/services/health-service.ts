import { appConfig } from "@/lib/config";
import { prisma } from "@/lib/db";
import { getOpenServAdapter } from "@/lib/integrations/openserv";
import { getLocusAdapter } from "@/lib/integrations/locus";
import { type ExecutionSettings, type IntegrationMode } from "@prisma/client";

export async function getSystemHealth(input?: {
  openservMode?: IntegrationMode;
  locusMode?: IntegrationMode;
  executionSettings?: ExecutionSettings | null;
}) {
  const [openservHealth, locusHealth] = await Promise.all([
    getOpenServAdapter(input?.openservMode ?? appConfig.openservMode).health(),
    getLocusAdapter(input?.locusMode ?? appConfig.locusMode).health()
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
    auth: {
      ok: Boolean(appConfig.auth.googleClientId && appConfig.auth.googleClientSecret) || process.env.NODE_ENV !== "production",
      message:
        appConfig.auth.googleClientId && appConfig.auth.googleClientSecret
          ? "Google OAuth is configured."
          : process.env.NODE_ENV !== "production"
            ? "Development auth fallback is active."
            : "Google OAuth credentials are missing."
    },
    execution: input?.executionSettings
      ? {
          ok: !input.executionSettings.emergencyStop,
          liveExecutionEnabled: input.executionSettings.liveExecutionEnabled,
          dryRunByDefault: input.executionSettings.dryRunByDefault,
          emergencyStop: input.executionSettings.emergencyStop,
          message: input.executionSettings.emergencyStop
            ? "Execution is disabled by the organization kill switch."
            : input.executionSettings.liveExecutionEnabled
              ? "Live execution is enabled for bounded actions."
              : "Execution is operating in dry-run mode."
        }
      : {
          ok: true,
          liveExecutionEnabled: false,
          dryRunByDefault: true,
          emergencyStop: false,
          message: "Execution settings are not loaded."
        },
    openserv: openservHealth,
    locus: locusHealth
  };
}
