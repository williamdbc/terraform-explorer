import HttpClient from "@/clients/HttpClient";
import type { FileWriteRequest } from "@/interfaces/requests/FileWriteRequest";
import type { RenameFileRequest } from "@/interfaces/requests/RenameFileRequest";
import type { FileReadResponse } from "@/interfaces/responses/FileReadResponse";
import type { SuccessResponse } from "@/interfaces/responses/SuccessResponse";

export class FileService {
  private static httpClient: HttpClient;
  private static baseURL: string = `${import.meta.env.VITE_API_BASE_URL}/files`;

  private static getHttpClient(): HttpClient {
    if (!this.httpClient) {
      this.httpClient = new HttpClient(this.baseURL);
    }
    return this.httpClient;
  }

  static async read(path: string): Promise<FileReadResponse> {
    return this.getHttpClient().get<FileReadResponse>(`/${encodeURIComponent(path)}`);
  }

  static async write(request: FileWriteRequest): Promise<void> {
    return this.getHttpClient().post<void>("", request);
  }

  static async delete(path: string): Promise<void> {
    return this.getHttpClient().delete<void>(`/${encodeURIComponent(path)}`);
  }

  static async rename(request: RenameFileRequest): Promise<SuccessResponse> {
    return this.getHttpClient().put<SuccessResponse>("", request);
  }
}