import { isAxiosError } from "axios";

import type { IApiErrorBody } from "./types";

/** Mã lỗi chung, khớp `CommonErrors` bên agent-core-be. */
export const CommonErrorCode = {
  internal: "ERR_1000",
  validation: "ERR_1001",
  notFound: "ERR_1002",
  unauthorized: "ERR_1003",
  forbidden: "ERR_1004",
  badRequest: "ERR_1005",
  tooManyRequests: "ERR_1006",
  conflict: "ERR_1007",
} as const;

/** Mã lỗi chỉ có ở client (không có response từ BE). */
export const ClientErrorCode = {
  network: "NETWORK_ERROR",
  timeout: "TIMEOUT",
  cancelled: "CANCELLED",
  unknown: "UNKNOWN",
} as const;

export class ApiError extends Error {
  override readonly name = "ApiError";

  constructor(
    /** HTTP status; 0 khi không nhận được response. */
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: string[],
  ) {
    super(message);
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const isApiErrorBody = (value: unknown): value is IApiErrorBody =>
  typeof value === "object" &&
  value !== null &&
  (value as IApiErrorBody).success === false &&
  typeof (value as IApiErrorBody).errorCode === "string";

const fallbackCodeByStatus = (status: number): string => {
  if (status >= 500) return CommonErrorCode.internal;
  const map: Record<number, string> = {
    400: CommonErrorCode.badRequest,
    401: CommonErrorCode.unauthorized,
    403: CommonErrorCode.forbidden,
    404: CommonErrorCode.notFound,
    409: CommonErrorCode.conflict,
    429: CommonErrorCode.tooManyRequests,
  };
  return map[status] ?? CommonErrorCode.badRequest;
};

/** Chuẩn hoá mọi lỗi (axios, lỗi mạng, lỗi lạ) về một `ApiError` duy nhất. */
export const toApiError = (error: unknown): ApiError => {
  if (isApiError(error)) return error;

  if (isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") {
      return new ApiError(0, ClientErrorCode.cancelled, "Request đã bị huỷ");
    }
    if (!error.response) {
      return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
        ? new ApiError(0, ClientErrorCode.timeout, "Hết thời gian chờ phản hồi từ máy chủ")
        : new ApiError(0, ClientErrorCode.network, "Không kết nối được tới máy chủ");
    }

    const { status, data } = error.response;
    if (isApiErrorBody(data)) {
      return new ApiError(status, data.errorCode, data.message, data.details);
    }
    return new ApiError(status, fallbackCodeByStatus(status), error.message);
  }

  const message = error instanceof Error ? error.message : "Đã có lỗi xảy ra";
  return new ApiError(0, ClientErrorCode.unknown, message);
};
