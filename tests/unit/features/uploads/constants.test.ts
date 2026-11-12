import { describe, expect, it } from "vitest";

import { IMAGE_UPLOAD, validateImageFile } from "@/features/uploads/constants";

const fileOf = (type: string, size = 1024) => new File([new Uint8Array(size)], "anh", { type });

describe("validateImageFile", () => {
  it.each(IMAGE_UPLOAD.mimeTypes)("nhận %s", (type) => {
    expect(validateImageFile(fileOf(type))).toBeNull();
  });

  it("từ chối SVG và định dạng khác", () => {
    expect(validateImageFile(fileOf("image/svg+xml"))).toBe("Chỉ nhận ảnh JPG, PNG, WebP hoặc GIF");
    expect(validateImageFile(fileOf("application/pdf"))).not.toBeNull();
  });

  it("từ chối ảnh lớn hơn 10 MB", () => {
    expect(validateImageFile(fileOf("image/png", IMAGE_UPLOAD.maxBytes + 1))).toBe(
      "Ảnh vượt quá 10 MB",
    );
  });
});
