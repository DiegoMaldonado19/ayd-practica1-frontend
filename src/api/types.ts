import { isAxiosError } from "axios";

export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    total_elements: number;
    total_pages: number;
  };
}

export interface ErrorResponse {
  error_code: string;
  message: string;
  suggested_action?: string;
  timestamp: string;
  path: string;
}

export function getErrorResponse(error: unknown): ErrorResponse | null {
  if (isAxiosError<ErrorResponse>(error) && error.response?.data?.error_code) {
    return error.response.data;
  }
  return null;
}

export function getErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado. Intenta de nuevo."): string {
  return getErrorResponse(error)?.message ?? fallback;
}

export function getErrorCode(error: unknown): string | null {
  return getErrorResponse(error)?.error_code ?? null;
}
