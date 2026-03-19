import { MockOpenServAdapter } from "@/lib/integrations/openserv/mock-openserv";
import { appConfig } from "@/lib/config";
import type {
  IntegrationHealth,
  OpenServAdapter,
  OpenServWorkflowInput,
  OpenServWorkflowOutput
} from "@/lib/integrations/openserv/types";

export class RealOpenServAdapter implements OpenServAdapter {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly fallback = new MockOpenServAdapter()
  ) {}

  async health(): Promise<IntegrationHealth> {
    if (!this.baseUrl || !this.apiKey) {
      return {
        ok: false,
        mode: "real",
        message: "OpenServ is in real mode but the agent secret or base URL is missing."
      };
    }

    if (!appConfig.appUrl) {
      return {
        ok: false,
        mode: "real",
        message: "OpenServ real mode requires NEXT_PUBLIC_APP_URL to publish the agent endpoint."
      };
    }

    return {
      ok: true,
      mode: "real",
      message: `OpenServ custom agent ingress is configured at ${appConfig.appUrl}${appConfig.openservIngressPath}.`
    };
  }

  async runWorkflow(input: OpenServWorkflowInput): Promise<OpenServWorkflowOutput> {
    return this.fallback.runWorkflow(input);
  }
}
