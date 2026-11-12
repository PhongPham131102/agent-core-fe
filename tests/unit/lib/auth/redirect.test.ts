import { describe, expect, it } from "vitest";

import { buildLoginUrl, LoginReason, resolveRedirectTarget } from "@/lib/auth/redirect";

describe("resolveRedirectTarget", () => {
  it("giữ đường dẫn nội bộ", () => {
    expect(resolveRedirectTarget("/users?page=2")).toBe("/users?page=2");
  });

  it.each([
    ["URL ngoài", "https://evil.com"],
    ["protocol-relative", "//evil.com"],
    ["dấu gạch ngược", "/\\evil.com"],
    ["chính trang login", "/login?redirect=/users"],
    ["rỗng", ""],
    ["null", null],
  ])("về trang chủ khi giá trị là %s", (_label, raw) => {
    expect(resolveRedirectTarget(raw)).toBe("/");
  });
});

describe("buildLoginUrl", () => {
  it("không thêm tham số khi không có gì để nhớ", () => {
    expect(buildLoginUrl()).toBe("/login");
    expect(buildLoginUrl({ from: "/" })).toBe("/login");
  });

  it("mã hoá đường dẫn quay lại và lý do", () => {
    expect(buildLoginUrl({ from: "/users?page=2", reason: LoginReason.expired })).toBe(
      "/login?redirect=%2Fusers%3Fpage%3D2&reason=expired",
    );
  });

  it("bỏ qua đường dẫn quay lại không an toàn", () => {
    expect(buildLoginUrl({ from: "//evil.com" })).toBe("/login");
  });
});
