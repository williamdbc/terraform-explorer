import HttpClient from "@/clients/HttpClient";
import type { AwsCredentialRequest } from "@/interfaces/requests/AwsCredentialRequest";
import type { AwsProfileResponse } from "@/interfaces/responses/AwsProfileResponse";
import type { SuccessResponse } from "@/interfaces/responses/SuccessResponse";

export class ProvidersService {
  private static httpClient: HttpClient;
  private static baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/providers`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async createOrUpdateAwsProfile(request: AwsCredentialRequest): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("aws-profile", request);
  }

  static async listAwsProfiles(): Promise<AwsProfileResponse[]> {
    return this.getHttpClient().get<AwsProfileResponse[]>("aws-profiles");
  }

  static async deleteProfile(profileName: string): Promise<SuccessResponse> {
    return this.getHttpClient().delete<SuccessResponse>(`profile/${encodeURIComponent(profileName)}`);
  }
}