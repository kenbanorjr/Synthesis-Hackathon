import { IntegrationMode } from "@prisma/client";

function resolveMode(value: string | undefined, fallback: IntegrationMode) {
  if (value?.toUpperCase() === IntegrationMode.REAL) {
    return IntegrationMode.REAL;
  }

  return fallback;
}

export const appConfig = {
  appName: "TreasuryPilot",
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "demo@treasurypilot.local",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  openservMode: resolveMode(process.env.OPENSERV_MODE, IntegrationMode.MOCK),
  openservBaseUrl: process.env.OPENSERV_BASE_URL ?? "",
  openservApiKey: process.env.OPENSERV_API_KEY ?? "",
  locusMode: resolveMode(process.env.LOCUS_MODE, IntegrationMode.MOCK),
  locusBaseUrl: process.env.LOCUS_BASE_URL ?? "",
  locusApiKey: process.env.LOCUS_API_KEY ?? ""
};
