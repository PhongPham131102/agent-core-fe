import { describe, expect, it } from "vitest";

import "@/features/ai-knowledge/errors";
import { ApiError, getErrorMessage } from "@/lib/http";

describe("lỗi của kho tri thức", () => {
  it("chưa có API key (mã của ai-providers) vẫn hiện tiếng Việt trên trang kho", () => {
    const error = new ApiError(400, "ERR_2403", "No API key is stored for this AI provider");

    expect(getErrorMessage(error)).toBe("Nhà cung cấp AI chưa có API key");
  });
});
