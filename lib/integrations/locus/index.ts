import { IntegrationMode } from "@prisma/client";
import { appConfig } from "@/lib/config";
import { MockLocusAdapter } from "@/lib/integrations/locus/mock-locus";
import { RealLocusAdapter } from "@/lib/integrations/locus/real-locus";

export function getLocusAdapter(mode: IntegrationMode) {
  if (mode === IntegrationMode.REAL) {
    return new RealLocusAdapter(appConfig.locusBaseUrl, appConfig.locusApiKey);
  }

  return new MockLocusAdapter();
}
