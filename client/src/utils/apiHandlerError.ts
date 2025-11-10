import { AxiosError } from "axios";

interface ErrorResponse {
  status: number;
  message: string;
}

export const getErrorMessage = (err: unknown): string | null => {
  const axiosError = err as AxiosError<ErrorResponse>;
  return axiosError.response?.data?.message || null;
};