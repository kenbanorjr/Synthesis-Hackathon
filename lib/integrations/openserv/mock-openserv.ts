import type {
  OpenServAdapter,
  OpenServWorkflowInput,
  OpenServWorkflowOutput
} from "@/lib/integrations/openserv/types";
import { runWorkflowEngine } from "@/lib/services/workflow-engine";

export class MockOpenServAdapter implements OpenServAdapter {
  async health() {
    return {
      ok: true,
      mode: "mock" as const,
      message: "Mock OpenServ workflow engine is active."
    };
  }

  async runWorkflow(input: OpenServWorkflowInput): Promise<OpenServWorkflowOutput> {
    return runWorkflowEngine(input);
  }
}
