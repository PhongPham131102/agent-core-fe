import { compactParams, http } from "@/lib/http";

import type { ICreateUserBody, IUpdateUserBody, IUser, IUserListQuery } from "../types/user.types";
import type { IPaginated } from "@/lib/http";

const BASE = "/users";

export const userService = {
  list: (query: IUserListQuery) =>
    http.get<IPaginated<IUser>>(BASE, { params: compactParams(query) }),
  detail: (uid: string) => http.get<IUser>(`${BASE}/${uid}`),
  create: (body: ICreateUserBody) => http.post<IUser>(BASE, body),
  update: (uid: string, body: IUpdateUserBody) => http.patch<IUser>(`${BASE}/${uid}`, body),
  /** Đặt lại mật khẩu; BE đăng xuất người đó trên mọi thiết bị. */
  resetPassword: (uid: string, newPassword: string) =>
    http.patch<void>(`${BASE}/${uid}/password`, { newPassword }),
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),
};
