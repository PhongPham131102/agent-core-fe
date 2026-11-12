import type { IPaginationQuery } from "@/lib/http";

/** Khớp `IUserResponse` bên agent-core-be. */
export interface IUser {
  uid: string;
  email: string;
  fullName: string;
  avatar: string;
  roleUid: string;
  /** null khi role đã bị xoá. */
  role: { uid: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUserListQuery extends IPaginationQuery {
  /** Khớp không phân biệt hoa thường trên email hoặc họ tên. */
  search?: string;
  roleUid?: string;
}

export interface ICreateUserBody {
  email: string;
  roleUid: string;
  password: string;
  fullName?: string;
  avatar?: string;
}

/** Email và mật khẩu không sửa qua endpoint này. */
export type IUpdateUserBody = Partial<Pick<ICreateUserBody, "roleUid" | "fullName" | "avatar">>;
