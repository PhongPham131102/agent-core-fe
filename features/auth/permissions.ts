/**
 * Quyền mà FE dùng để ẩn/hiện giao diện, khớp `PermissionKey` bên agent-core-be
 * (`<subject>:<action>`). BE thêm quyền mới thì bổ sung vào đây khi FE cần gate theo nó.
 * Đây chỉ là gợi ý cho giao diện: quyền thật luôn do BE kiểm tra.
 */
export const Permission = {
  userRead: "user:read",
  userCreate: "user:create",
  userUpdate: "user:update",
  userDelete: "user:delete",
  roleRead: "role:read",
  roleCreate: "role:create",
  roleUpdate: "role:update",
  roleDelete: "role:delete",
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

/** Phần của người dùng hiện tại cần để quyết định quyền. */
export interface IAccessSubject {
  role: { isSuperAdmin: boolean };
  permissions: readonly string[];
}

/** Cùng quy tắc với `PermissionsGuard` bên BE: Super Admin có mọi quyền, còn lại phải có đủ. */
export const hasPermissions = (
  subject: IAccessSubject | null | undefined,
  required: readonly string[],
) => {
  if (!subject) return false;
  return subject.role.isSuperAdmin || required.every((key) => subject.permissions.includes(key));
};

export const hasAnyPermission = (
  subject: IAccessSubject | null | undefined,
  candidates: readonly string[],
) => {
  if (!subject) return false;
  return subject.role.isSuperAdmin || candidates.some((key) => subject.permissions.includes(key));
};
