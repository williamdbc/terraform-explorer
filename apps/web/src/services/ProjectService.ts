import HttpClient from "@/clients/HttpClient";
import type { CreateProjectRequest } from "@/interfaces/requests/CreateProjectRequest";
import type { ProjectCopyRequest } from "@/interfaces/requests/ProjectCopyRequest";
import type { RenameProjectRequest } from "@/interfaces/requests/RenameProjectRequest";
import type { ItemResponse } from "@/interfaces/responses/ItemResponse";
import type { SuccessResponse } from "@/interfaces/responses/SuccessResponse";

export class ProjectService {
  private static httpClient: HttpClient;
  private static baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/projects`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async create(request: CreateProjectRequest): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("", request);
  }

  static async list(accountName: string, moduleName: string): Promise<ItemResponse[]> {
    const url = `account/${encodeURIComponent(accountName)}/module/${encodeURIComponent(moduleName)}`;
    return this.getHttpClient().get<ItemResponse[]>(url);
  }

  static async get(accountName: string, moduleName: string, projectName: string): Promise<ItemResponse> {
    const url = `account/${encodeURIComponent(accountName)}/module/${encodeURIComponent(moduleName)}/${encodeURIComponent(projectName)}`;
    return this.getHttpClient().get<ItemResponse>(url);
  }

  static async delete(accountName: string, moduleName: string, projectName: string): Promise<SuccessResponse> {
    const url = `account/${encodeURIComponent(accountName)}/module/${encodeURIComponent(moduleName)}/${encodeURIComponent(projectName)}`;
    return this.getHttpClient().delete<SuccessResponse>(url);
  }

  static async copyProject(request: ProjectCopyRequest): Promise<SuccessResponse> {
    return this.getHttpClient().post<SuccessResponse>("copy", request);
  }

  static async rename(accountName: string, moduleName: string, projectName: string, newProjectName: string): Promise<SuccessResponse> {
  const url = `account/${encodeURIComponent(accountName)}/module/${encodeURIComponent(moduleName)}/${encodeURIComponent(projectName)}`;
  const request: RenameProjectRequest = { newProjectName };
  return this.getHttpClient().put<SuccessResponse>(url, request);
  }
}