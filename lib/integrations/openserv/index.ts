import { IntegrationMode } from "@prisma/client";
import { appConfig } from "@/lib/config";
import { MockOpenServAdapter } from "@/lib/integrations/openserv/mock-openserv";
import { RealOpenServAdapter } from "@/lib/integrations/openserv/real-openserv";

export function getOpenServAdapter(mode: IntegrationMode) {
  if (mode === IntegrationMode.REAL) {
    return new RealOpenServAdapter(appConfig.openservBaseUrl, appConfig.openservApiKey);
  }

  return new MockOpenServAdapter();
}
