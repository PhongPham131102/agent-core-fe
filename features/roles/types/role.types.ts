import type { IPaginationQuery } from "@/lib/http";

/** Khớp `IRoleResponse` bên agent-core-be. */
export interface IRole {
  uid: string;
  name: string;
  description: string;
  /** Role hệ thống có mọi quyền; không sửa, không xoá được. */
  isSuperAdmin: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/** Một mục của ô chọn role, khớp `IRoleOption` bên BE (GET /roles/options). */
export interface IRoleOption {
  uid: string;
  name: string;
  /**
   * Người đang thao tác có được gán role này cho người khác không. Role không gán được
   * (nhiều quyền hơn mình) vẫn nằm trong danh sách để lọc danh sách người dùng.
   */
  assignable: boolean;
}

export interface IRoleListQuery extends IPaginationQuery {
  search?: string;
}

export interface ICreateRoleBody {
  name: string;
  description?: string;
  permissions?: string[];
}

export type IUpdateRoleBody = Partial<ICreateRoleBody>;

/** Một nhóm trong danh mục quyền (GET /permissions): quyền của một đối tượng. */
export interface IPermissionGroup {
  subject: string;
  permissions: { action: string; key: string }[];
}
