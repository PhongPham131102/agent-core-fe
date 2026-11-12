import { describe, expect, it } from "vitest";

import { ApiError, CommonErrorCode } from "@/lib/http/api-error";
import { getErrorMessage, registerErrorMessages } from "@/lib/http/error-messages";

describe("getErrorMessage", () => {
  it("ưu tiên message feature đã đăng ký", () => {
    registerErrorMessages({ ERR_AGENT_001: "Agent không tồn tại" });
    expect(getErrorMessage(new ApiError(404, "ERR_AGENT_001", "Agent not found"))).toBe(
      "Agent không tồn tại",
    );
  });

  it("lỗi validation hiển thị details từ BE", () => {
    const error = new ApiError(400, CommonErrorCode.validation, "Validation failed", ["a", "b"]);
    expect(getErrorMessage(error)).toBe("a, b");
  });

  it("mã chưa đăng ký thì dùng message từ BE", () => {
    expect(getErrorMessage(new ApiError(422, "ERR_X", "Thông điệp từ BE"))).toBe(
      "Thông điệp từ BE",
    );
  });
});
