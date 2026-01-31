import HttpClient from "@/clients/HttpClient";
import type { LoginRequest } from "@/interfaces/requests/LoginRequest";
import type { LoginResponse } from "@/interfaces/responses/LoginResponse";
import type { MeResponse } from "@/interfaces/responses/MeResponse";

export class AuthService {
  private static httpClient: HttpClient;
  private static baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/auth`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async login(request: LoginRequest): Promise<LoginResponse> {
    return this.getHttpClient().post<LoginResponse>("login", request);
  }

  static async me(): Promise<MeResponse> {
  return this.getHttpClient().get<MeResponse>("/me");
}

}