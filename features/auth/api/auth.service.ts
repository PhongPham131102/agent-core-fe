import { http } from "@/lib/http";

import type { IAuthSession, IAuthUser, ILoginBody } from "../types/auth.types";

const BASE = "/auth";

/**
 * login / refresh / logout là endpoint public, xác thực bằng cookie refresh token:
 * `skipAuth` để không gắn Authorization và để 401 của chúng không kích hoạt refresh.
 */
export const authService = {
  login: (body: ILoginBody) => http.post<IAuthSession>(`${BASE}/login`, body, { skipAuth: true }),
  refresh: () => http.post<IAuthSession>(`${BASE}/refresh`, undefined, { skipAuth: true }),
  logout: () => http.post<void>(`${BASE}/logout`, undefined, { skipAuth: true }),
  getMe: () => http.get<IAuthUser>(`${BASE}/me`),
};
