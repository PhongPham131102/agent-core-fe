import axios, { isAxiosError } from "axios";

import { tokenHolder } from "@/lib/auth/token-holder";
import { env } from "@/lib/env";

import { toApiError } from "./api-error";
import { emitAuthFailure, getRefreshHandler } from "./auth-events";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Không gắn Authorization (endpoint public như login). */
    skipAuth?: boolean;
    /** Không thử refresh khi 401 (chính request refresh). */
    skipAuthRefresh?: boolean;
    /** Đánh dấu request đã được retry sau refresh. */
    _retry?: boolean;
  }
}

const AUTHORIZATION = "Authorization";
const REQUEST_TIMEOUT_MS = 30_000;

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: REQUEST_TIMEOUT_MS,
  // Refresh token nằm ở cookie httpOnly do BE set, nên request phải gửi kèm cookie.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenHolder.get();
  // Chỉ gắn header khi thật sự có token (tránh "Bearer null").
  if (token && !config.skipAuth) config.headers.set(AUTHORIZATION, `Bearer ${token}`);
  return config;
});

/**
 * Promise refresh dùng chung: nhiều request cùng gặp 401 chỉ gọi refresh một lần,
 * các request còn lại chờ chung promise này rồi retry.
 */
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (refresh: () => Promise<string>) => {
  refreshPromise ??= refresh()
    .then((token) => {
      tokenHolder.set(token);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  const apiError = toApiError(error);
  const config = isAxiosError(error) ? error.config : undefined;

  if (apiError.status !== 401 || !config || config.skipAuth) throw apiError;

  const refresh = getRefreshHandler();
  if (!refresh || config.skipAuthRefresh || config._retry) {
    tokenHolder.clear();
    emitAuthFailure(apiError.code);
    throw apiError;
  }

  config._retry = true;

  // Token đã được refresh bởi request khác sau khi request này được gửi: chỉ cần retry.
  const currentToken = tokenHolder.get();
  if (currentToken && config.headers.get(AUTHORIZATION) !== `Bearer ${currentToken}`) {
    config.headers.set(AUTHORIZATION, `Bearer ${currentToken}`);
    return apiClient(config);
  }

  try {
    const token = await refreshAccessToken(refresh);
    config.headers.set(AUTHORIZATION, `Bearer ${token}`);
  } catch {
    tokenHolder.clear();
    emitAuthFailure("REFRESH_FAILED");
    throw apiError;
  }
  return apiClient(config);
});
