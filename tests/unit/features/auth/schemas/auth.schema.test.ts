import { describe, expect, it } from "vitest";

import { avatarSchema, emailSchema, passwordSchema } from "@/features/auth/schemas/auth.schema";

describe("passwordSchema", () => {
  it("chấp nhận mật khẩu đạt chính sách của BE", () => {
    expect(passwordSchema.safeParse("StrongP@ssw0rd").success).toBe(true);
  });

  it.each([
    ["ngắn hơn 8 ký tự", "Aa1@aaa"],
    ["thiếu chữ hoa", "weakp@ssw0rd"],
    ["thiếu chữ thường", "WEAKP@SSW0RD"],
    ["thiếu số", "WeakP@ssword"],
    ["thiếu ký tự đặc biệt", "WeakPassw0rd"],
    ["dài hơn 72 byte", `Aa1@${"ế".repeat(40)}`],
  ])("từ chối mật khẩu %s", (_label, value) => {
    expect(passwordSchema.safeParse(value).success).toBe(false);
  });
});

describe("emailSchema", () => {
  it("bỏ khoảng trắng hai đầu", () => {
    expect(emailSchema.parse("  a@b.co ")).toBe("a@b.co");
  });

  it("báo lỗi tiếng Việt khi bỏ trống hoặc sai định dạng", () => {
    expect(emailSchema.safeParse(undefined).error?.issues[0]?.message).toBe("Vui lòng nhập email");
    expect(emailSchema.safeParse("abc").error?.issues[0]?.message).toBe("Email không hợp lệ");
  });
});

describe("avatarSchema", () => {
  it("cho phép bỏ trống, chỉ nhận http(s)", () => {
    expect(avatarSchema.safeParse("").success).toBe(true);
    expect(avatarSchema.safeParse("https://example.com/a.png").success).toBe(true);
    expect(avatarSchema.safeParse("javascript:alert(1)").success).toBe(false);
  });
});
