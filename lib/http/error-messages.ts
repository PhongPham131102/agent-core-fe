import { ClientErrorCode, CommonErrorCode, isApiError } from "./api-error";

/**
 * Registry message theo errorCode. Mỗi feature tự đăng ký mã lỗi của mình
 * (features/<domain>/errors.ts) nên lib/http không cần biết feature nào (OCP).
 */
const messages = new Map<string, string>([
  [CommonErrorCode.internal, "Máy chủ gặp lỗi, vui lòng thử lại sau"],
  [CommonErrorCode.unauthorized, "Phiên đăng nhập đã hết hạn"],
  [CommonErrorCode.forbidden, "Bạn không có quyền thực hiện thao tác này"],
  [CommonErrorCode.notFound, "Không tìm thấy dữ liệu"],
  [CommonErrorCode.tooManyRequests, "Thao tác quá nhanh, vui lòng thử lại sau"],
  [ClientErrorCode.network, "Không kết nối được tới máy chủ"],
  [ClientErrorCode.timeout, "Hết thời gian chờ phản hồi từ máy chủ"],
]);

/** Các mã mà message từ BE cụ thể hơn message mặc định, nên ưu tiên message BE. */
const preferServerMessage = new Set<string>([
  CommonErrorCode.validation,
  CommonErrorCode.badRequest,
  CommonErrorCode.conflict,
]);

export const registerErrorMessages = (entries: Record<string, string>) => {
  for (const [code, message] of Object.entries(entries)) messages.set(code, message);
};

export const getErrorMessage = (error: unknown, fallback = "Đã có lỗi xảy ra"): string => {
  if (!isApiError(error)) return error instanceof Error ? error.message : fallback;

  if (preferServerMessage.has(error.code)) {
    return error.details?.length ? error.details.join(", ") : error.message || fallback;
  }
  return messages.get(error.code) ?? (error.message || fallback);
};
