import HttpClient from "@/clients/HttpClient";
import type { CommandRequest } from "@/interfaces/requests/CommandRequest";
import type { ExecuteAllRequest } from "@/interfaces/requests/ExecuteAllRequest";
import type { CommandResponse } from "@/interfaces/responses/CommandResponse";
import type { ExecuteAllResponse } from "@/interfaces/responses/ExecuteAllResponse";
import type { TerraformStructure } from "@/interfaces/TerraformStructure";

export class TerraformService {
  private static httpClient: HttpClient;
  private static baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/terraform`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async getStructure(): Promise<TerraformStructure> {
    return this.getHttpClient().get<TerraformStructure>("structure");
  }

  static async executeCommand(request: CommandRequest): Promise<CommandResponse> {
    return this.getHttpClient().post<CommandResponse>("execute", request);
  }

  static async executeAll(request: ExecuteAllRequest): Promise<ExecuteAllResponse> {
    return this.getHttpClient().post<ExecuteAllResponse>("execute-all", request);
  }
}