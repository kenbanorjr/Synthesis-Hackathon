import { IntegrationMode } from "@prisma/client";

function resolveMode(value: string | undefined, fallback: IntegrationMode) {
  if (value?.toUpperCase() === IntegrationMode.REAL) {
    return IntegrationMode.REAL;
  }

  return fallback;
}

const defaultIntegrationMode = process.env.NODE_ENV === "production" ? IntegrationMode.REAL : IntegrationMode.MOCK;

export const appConfig = {
  appName: "TreasuryPilot",
  demoUserEmail: process.env.DEMO_USER_EMAIL ?? "demo@treasurypilot.local",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  auth: {
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "treasurypilot-dev-secret",
    googleClientId: process.env.AUTH_GOOGLE_ID ?? "",
    googleClientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    allowDemoAuth:
      process.env.AUTH_ENABLE_DEMO === "true" ||
      (process.env.AUTH_ENABLE_DEMO !== "false" &&
        (process.env.NODE_ENV !== "production" || !process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET))
  },
  openservMode: resolveMode(process.env.OPENSERV_MODE, defaultIntegrationMode),
  openservBaseUrl: process.env.OPENSERV_BASE_URL ?? "https://api.openserv.ai",
  openservApiKey: process.env.OPENSERV_API_KEY ?? "",
  locusMode: resolveMode(process.env.LOCUS_MODE, defaultIntegrationMode),
  locusBaseUrl: process.env.LOCUS_BASE_URL ?? "https://api.paywithlocus.com/api",
  locusApiKey: process.env.LOCUS_API_KEY ?? "",
  openservIngressPath: "/api/openserv/agent"
};
