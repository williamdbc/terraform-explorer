import HttpClient from "@/clients/HttpClient";
import type { GitStatusResponse } from "@/interfaces/responses/GitStatusResponse";
import type { SuccessResponse } from "@/interfaces/responses/SuccessResponse";

export class GitService {
  private static httpClient: HttpClient;
  private static baseURL = `${import.meta.env.VITE_API_BASE_URL}/git`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async getStatus(): Promise<GitStatusResponse> {
    return this.getHttpClient().get<GitStatusResponse>("/status");
  }

  static async commit(message?: string, files?: string[]): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("/commit", { message, files });
  }

  static async push(): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("/push");
  }

  static async pull(): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("/pull");
  }

  static async setAutoCommit(enabled: boolean, intervalSeconds: number): Promise<SuccessResponse> {
    return this.getHttpClient().put<SuccessResponse>("/auto-commit", { enabled, intervalSeconds });
  }

  static async clone(): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("/clone");
  }
}
