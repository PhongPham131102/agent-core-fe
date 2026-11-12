import { startSession, tokenHolder, withCrossTabLock } from "@/lib/auth";
import { registerRefreshHandler } from "@/lib/http";
import { getQueryClient } from "@/lib/query";

import { authKeys } from "./auth.keys";
import { authService } from "./auth.service";

import type { IAuthSession, IAuthUser } from "../types/auth.types";

const REFRESH_LOCK = "agent-core.auth.refresh";

/** Ghi nhận phiên mới: access token vào bộ nhớ, user (kèm quyền) vào cache React Query. */
export const applySession = ({ accessToken, user }: IAuthSession) => {
  startSession(accessToken);
  getQueryClient().setQueryData(authKeys.me(), user);
};

let refreshing: Promise<IAuthSession> | null = null;

/**
 * Điểm duy nhất gọi POST /auth/refresh. Refresh token xoay vòng và chỉ dùng được một lần,
 * nên hai request cùng gửi một cookie cũ thì request sau bị từ chối:
 * - trong một tab: dùng chung một promise;
 * - giữa các tab: xếp hàng bằng Web Locks, tab sau gửi cookie mà tab trước vừa nhận.
 */
export const refreshSession = () => {
  refreshing ??= withCrossTabLock(REFRESH_LOCK, authService.refresh)
    .then((session) => {
      applySession(session);
      return session;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

/**
 * queryFn của `authQueries.me()`.
 * - Chưa có access token (vừa tải trang): khôi phục phiên bằng cookie refresh.
 * - Đã có: đọc lại user và quyền; nếu token hết hạn thì interceptor tự refresh.
 */
export const fetchCurrentUser = async (): Promise<IAuthUser> => {
  if (tokenHolder.get()) return authService.getMe();
  return (await refreshSession()).user;
};

// Request nghiệp vụ gặp 401 sẽ lấy token mới qua đây (xem lib/http/client.ts).
registerRefreshHandler(async () => (await refreshSession()).accessToken);
