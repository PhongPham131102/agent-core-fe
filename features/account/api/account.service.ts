import { http } from "@/lib/http";

import type { IChangePasswordBody, IUpdateProfileBody } from "../types/account.types";
import type { IAuthUser } from "@/features/auth";

const BASE = "/auth";

/** Thao tác của người dùng trên chính tài khoản mình. */
export const accountService = {
  updateProfile: (body: IUpdateProfileBody) => http.patch<IAuthUser>(`${BASE}/me`, body),
  /** BE thu hồi mọi phiên và xoá cookie refresh. */
  changePassword: (body: IChangePasswordBody) => http.post<void>(`${BASE}/change-password`, body),
};
