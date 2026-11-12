import { describe, expect, it } from "vitest";

import { hasAnyPermission, hasPermissions, Permission } from "@/features/auth/permissions";

const editor = { role: { isSuperAdmin: false }, permissions: [Permission.userRead] };
const superAdmin = { role: { isSuperAdmin: true }, permissions: [] };

describe("hasPermissions", () => {
  it("cần đủ mọi quyền", () => {
    expect(hasPermissions(editor, [Permission.userRead])).toBe(true);
    expect(hasPermissions(editor, [Permission.userRead, Permission.userCreate])).toBe(false);
  });

  it("Super Admin có mọi quyền dù danh sách quyền rỗng", () => {
    expect(hasPermissions(superAdmin, [Permission.roleDelete])).toBe(true);
  });

  it("chưa đăng nhập thì không có quyền nào", () => {
    expect(hasPermissions(undefined, [])).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("chỉ cần một quyền", () => {
    expect(hasAnyPermission(editor, [Permission.userCreate, Permission.userRead])).toBe(true);
    expect(hasAnyPermission(editor, [Permission.userCreate])).toBe(false);
  });
});
