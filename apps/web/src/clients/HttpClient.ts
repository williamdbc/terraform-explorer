import { SessionService } from '@/services/SessionService';
import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export default class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    if (!baseURL) {
      throw new Error("A variável de ambiente não foi definida.");
    }

    this.instance = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.instance.interceptors.request.use(
      (config) => {
        config.headers.Accept = '*/*';
        const token = SessionService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );


    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const code = error.code;
    
          if (status === 401) {
            SessionService.handleExpiredSession();
          } else if (code === "ERR_NETWORK") {
            console.error("Erro de rede:", error.message);
          } else if (status && status >= 500) {
            console.error("Erro interno do servidor");
          }
        } else {
          console.error("Erro desconhecido:", error);
        }
    
        return Promise.reject(error);
      }
    );
  
  }
  
  async get<T>(endpoint: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(endpoint, { params, ...config });
    return HttpClient.handleResponse(response);
  }

  async post<T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(endpoint, body, config);
    return HttpClient.handleResponse(response);
  }
  
  async put<T>(endpoint: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(endpoint, body, config);
    return HttpClient.handleResponse(response);
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(endpoint, config);
    return HttpClient.handleResponse(response);
  }

  private static handleResponse<T>(response: AxiosResponse<T>): T {
    return response.data;
  }
}