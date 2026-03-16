import { MockOpenServAdapter } from "@/lib/integrations/openserv/mock-openserv";
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
      return this.fallback.health();
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        },
        cache: "no-store"
      });

      if (!response.ok) {
        return {
          ok: false,
          mode: "real",
          message: "OpenServ endpoint is configured but unhealthy."
        };
      }

      return {
        ok: true,
        mode: "real",
        message: "OpenServ endpoint is reachable."
      };
    } catch {
      return this.fallback.health();
    }
  }

  async runWorkflow(input: OpenServWorkflowInput): Promise<OpenServWorkflowOutput> {
    if (!this.baseUrl || !this.apiKey) {
      return this.fallback.runWorkflow(input);
    }

    try {
      const response = await fetch(`${this.baseUrl}/workflows/treasury-pilot`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        return this.fallback.runWorkflow(input);
      }

      return (await response.json()) as OpenServWorkflowOutput;
    } catch {
      return this.fallback.runWorkflow(input);
    }
  }
}
