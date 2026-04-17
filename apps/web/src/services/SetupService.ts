
import HttpClient from "@/clients/HttpClient";
import type { RegisterRequest } from "@/interfaces/requests/RegisterRequest";
import type { SetupResponse } from "@/interfaces/responses/SetupResponse";

export class SetupService {
  private static httpClient: HttpClient;
  private static baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/setup`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async status(): Promise<SetupResponse> {
    return this.getHttpClient().get<SetupResponse>("status");
  }

  static async setup(request: RegisterRequest): Promise<void> {
    return this.getHttpClient().post<void>("", request);
  }


}