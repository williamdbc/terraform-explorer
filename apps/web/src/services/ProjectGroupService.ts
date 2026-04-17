import HttpClient from "@/clients/HttpClient";
import type { CreateItemRequest } from "@/interfaces/requests/CreateItemRequest";
import type { RenameRequest } from "@/interfaces/requests/RenameRequest";
import type { ProjectGroupCopyRequest } from "@/interfaces/requests/ProjectGroupCopyRequest";
import type { ItemResponse } from "@/interfaces/responses/ItemResponse";
import type { SuccessResponse } from "@/interfaces/responses/SuccessResponse";


export class ProjectGroupService {
  private static httpClient: HttpClient;
  private static baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/accounts`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async list(accountName: string): Promise<ItemResponse[]> {
    const url = `${encodeURIComponent(accountName)}/modules`;
    return this.getHttpClient().get<ItemResponse[]>(url);
  }

  static async get(accountName: string, groupName: string): Promise<ItemResponse> {
    const url = `${encodeURIComponent(accountName)}/groups/${encodeURIComponent(groupName)}`;
    return this.getHttpClient().get<ItemResponse>(url);
  }

  static async create(accountName: string, request: CreateItemRequest): Promise<SuccessResponse> {
    const url = `${encodeURIComponent(accountName)}/groups`;
    return this.getHttpClient().post<SuccessResponse>(url, request);
  }

  static async delete(accountName: string, groupName: string): Promise<SuccessResponse> {
    const url = `${encodeURIComponent(accountName)}/groups/${encodeURIComponent(groupName)}`;
    return this.getHttpClient().delete<SuccessResponse>(url);
  }

  static async rename(accountName: string, groupName: string, req: RenameRequest): Promise<SuccessResponse> {
    const url = `${encodeURIComponent(accountName)}/groups/${encodeURIComponent(groupName)}`;
    return this.getHttpClient().put<SuccessResponse>(url, req);
  }

  static async copyProjectGroup(request: ProjectGroupCopyRequest): Promise<SuccessResponse> {
    const url = `${encodeURIComponent(request.source.accountName)}/groups/copy`;
    return this.getHttpClient().post<SuccessResponse>(url, request);
  }
}