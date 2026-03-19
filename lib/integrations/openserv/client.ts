import { appConfig } from "@/lib/config";

interface OpenServClientOptions {
  apiKey?: string;
  baseUrl?: string;
}

function createHeaders(apiKey: string, contentType = true) {
  const headers = new Headers({
    Authorization: `Bearer ${apiKey}`,
    "X-API-Key": apiKey
  });

  if (contentType) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export class OpenServClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(options: OpenServClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? appConfig.openservBaseUrl;
    this.apiKey = options.apiKey ?? appConfig.openservApiKey;

    if (!this.apiKey) {
      throw new Error("OpenServ API key is missing.");
    }
  }

  async sendChatMessage(input: {
    workspaceId: number | string;
    agentId: number | string;
    message: string;
  }) {
    const response = await fetch(
      `${this.baseUrl}/workspaces/${input.workspaceId}/agent-chat/${input.agentId}/message`,
      {
        method: "POST",
        headers: createHeaders(this.apiKey),
        body: JSON.stringify({
          message: input.message
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send OpenServ chat message (${response.status}).`);
    }
  }

  async completeTask(input: {
    workspaceId: number | string;
    taskId: number | string;
    output: string;
  }) {
    const response = await fetch(`${this.baseUrl}/workspaces/${input.workspaceId}/tasks/${input.taskId}/complete`, {
      method: "PUT",
      headers: createHeaders(this.apiKey),
      body: JSON.stringify({
        output: input.output
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to complete OpenServ task (${response.status}).`);
    }
  }

  async reportTaskError(input: {
    workspaceId: number | string;
    taskId: number | string;
    error: string;
  }) {
    const response = await fetch(`${this.baseUrl}/workspaces/${input.workspaceId}/tasks/${input.taskId}/error`, {
      method: "POST",
      headers: createHeaders(this.apiKey),
      body: JSON.stringify({
        error: input.error
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to report OpenServ task error (${response.status}).`);
    }
  }
}
