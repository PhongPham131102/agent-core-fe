import { describe, expect, it } from "vitest";

import { Permission } from "@/features/auth";
import { filterMenuByAccess, resolveLandingRoute, shellMenuItems } from "@/features/shell/menu";
import { routes } from "@/lib/constants/routes";

import type { PermissionKey } from "@/features/auth";

const canOnly =
  (...granted: PermissionKey[]) =>
  (permission: PermissionKey) =>
    granted.includes(permission);

const landingFor = (...granted: PermissionKey[]) =>
  resolveLandingRoute(filterMenuByAccess(shellMenuItems, canOnly(...granted)));

describe("resolveLandingRoute", () => {
  it("vào trang đầu tiên trong menu mà người dùng có quyền xem", () => {
    expect(landingFor(Permission.userRead, Permission.roleRead)).toBe(routes.users);
    expect(landingFor(Permission.roleRead)).toBe(routes.roles);
  });

  it("không có quyền xem trang nào thì về hồ sơ", () => {
    expect(landingFor()).toBe(routes.profile);
  });
});
