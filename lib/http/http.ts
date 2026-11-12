import { apiClient } from "./client";

import type { IApiResponse } from "./types";
import type { AxiosRequestConfig, AxiosResponse } from "axios";

const unwrap = async <T>(request: Promise<AxiosResponse<IApiResponse<T>>>): Promise<T> =>
  (await request).data?.data;

/**
 * Client dùng trong service: trả thẳng `data` (kiểu T) đã bỏ envelope.
 * Lỗi luôn là `ApiError` (xem interceptor ở client.ts).
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.get<IApiResponse<T>>(url, config)),
  post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.post<IApiResponse<T>>(url, body, config)),
  put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.put<IApiResponse<T>>(url, body, config)),
  patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.patch<IApiResponse<T>>(url, body, config)),
  delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
    unwrap<T>(apiClient.delete<IApiResponse<T>>(url, config)),
};
