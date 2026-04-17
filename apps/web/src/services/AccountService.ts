import HttpClient from "@/clients/HttpClient";
import type { AccountCopyRequest } from "@/interfaces/requests/AccountCopyRequest";
import type { CreateItemRequest } from "@/interfaces/requests/CreateItemRequest";
import type { RenameRequest } from "@/interfaces/requests/RenameRequest";
import type { SetAwsConfigRequest } from "@/interfaces/requests/SetAwsConfigRequest";
import type { ItemResponse } from "@/interfaces/responses/ItemResponse";
import type { SuccessResponse } from "@/interfaces/responses/SuccessResponse";

export class AccountService {
  private static httpClient: HttpClient;
  private static baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/account`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async list(): Promise<ItemResponse[]> {
    return this.getHttpClient().get<ItemResponse[]>("");
  }

  static async get(name: string): Promise<ItemResponse> {
    return this.getHttpClient().get<ItemResponse>(`/${encodeURIComponent(name)}`);
  }

  static async create(request: CreateItemRequest): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("", request);
  }

  static async delete(name: string): Promise<SuccessResponse> {
    return this.getHttpClient().delete<SuccessResponse>(`/${encodeURIComponent(name)}`);
  }

  static async rename(name: string, req: RenameRequest): Promise<SuccessResponse> {
    return this.getHttpClient().put<SuccessResponse>(`/${encodeURIComponent(name)}`, req);
  }

  static async copyAccount(request: AccountCopyRequest): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("copy", request);
  }

  static async linkProviderToAccount(accountName: string, request: SetAwsConfigRequest): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>(`${encodeURIComponent(accountName)}/link-provider-to-account`, request);
  }
}