import { HttpResponse } from "msw";
import { setupServer } from "msw/node";

/** Base URL dùng trong test, khớp `test.env` ở vitest.config.mts. */
export const TEST_API_URL = "http://api.test/api";

export const server = setupServer();

export const apiUrl = (path: string) => `${TEST_API_URL}${path}`;

/** Response thành công theo envelope của BE (TransformInterceptor). */
export const apiOk = <T>(data: T) =>
  HttpResponse.json({ success: true, message: "Success", data, timestamp: "", path: "" });

/** Response lỗi theo AllExceptionsFilter của BE. */
export const apiError = (
  status: number,
  errorCode: string,
  message = "Error",
  details?: string[],
) =>
  HttpResponse.json(
    { success: false, message, errorCode, details, statusCode: status },
    { status },
  );
