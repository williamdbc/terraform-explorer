import HttpClient from "@/clients/HttpClient";
import type { CreateItemRequest } from "@/interfaces/requests/CreateItemRequest";
import type { RenameRequest } from "@/interfaces/requests/RenameRequest";
import type { UsedModuleCopyRequest } from "@/interfaces/requests/UsedModuleCopyRequest";
import type { ItemResponse } from "@/interfaces/responses/ItemResponse";
import type { SuccessResponse } from "@/interfaces/responses/SuccessResponse";


export class UsedModuleService {
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

  static async get(accountName: string, moduleName: string): Promise<ItemResponse> {
    const url = `${encodeURIComponent(accountName)}/modules/${encodeURIComponent(moduleName)}`;
    return this.getHttpClient().get<ItemResponse>(url);
  }

  static async create(accountName: string, request: CreateItemRequest): Promise<SuccessResponse> {
    const url = `${encodeURIComponent(accountName)}/modules`;
    return this.getHttpClient().post<SuccessResponse>(url, request);
  }

  static async delete(accountName: string, moduleName: string): Promise<SuccessResponse> {
    const url = `${encodeURIComponent(accountName)}/modules/${encodeURIComponent(moduleName)}`;
    return this.getHttpClient().delete<SuccessResponse>(url);
  }

  static async rename(accountName: string, moduleName: string, req: RenameRequest): Promise<SuccessResponse> {
    const url = `${encodeURIComponent(accountName)}/modules/${encodeURIComponent(moduleName)}`;
    return this.getHttpClient().put<SuccessResponse>(url, req);
  }

  static async copyUsedModule(request: UsedModuleCopyRequest): Promise<SuccessResponse> {
    const url = `${encodeURIComponent(request.source.accountName)}/modules/copy`;
    return this.getHttpClient().post<SuccessResponse>(url, request);
  }
}