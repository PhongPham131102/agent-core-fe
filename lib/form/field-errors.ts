import { getErrorMessage, isApiError } from "@/lib/http";

import type { FormInstance } from "antd";

/**
 * Tạo `onError` cho mutation: mã lỗi BE gắn với một field (email trùng, tên trùng)
 * thì hiện lỗi ngay dưới field đó, ngoài toast chung.
 *
 *   onError: fieldErrorHandler(form, { [UserErrorCode.emailExists]: "email" })
 */
export const fieldErrorHandler =
  <T>(form: FormInstance<T>, fieldByCode: Record<string, string>) =>
  (error: unknown) => {
    if (!isApiError(error)) return;
    const name = fieldByCode[error.code];
    if (name) form.setFields([{ name, errors: [getErrorMessage(error)] }] as never);
  };
