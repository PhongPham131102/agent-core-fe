"use client";

import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { forceLogout, LogoutReason } from "@/lib/auth";

import { authKeys } from "./auth.keys";
import { authService } from "./auth.service";
import { applySession, fetchCurrentUser } from "./auth.session";

const CURRENT_USER_STALE_TIME_MS = 5 * 60_000;

export const authQueries = {
  /**
   * Người dùng hiện tại kèm role và quyền. Lần đầu sẽ khôi phục phiên từ cookie;
   * 401 nghĩa là chưa đăng nhập. Quay lại tab sau khi dữ liệu cũ thì đọc lại để
   * quyền bị đổi ở nơi khác được cập nhật.
   */
  me: () =>
    queryOptions({
      queryKey: authKeys.me(),
      queryFn: fetchCurrentUser,
      staleTime: CURRENT_USER_STALE_TIME_MS,
      gcTime: Infinity,
      retry: false,
      refetchOnWindowFocus: true,
    }),
};

/** Dùng ở guard: kích hoạt việc khôi phục phiên. Nơi khác đọc qua `useAccess()`. */
export const useCurrentUserQuery = () => useQuery(authQueries.me());

export const useLogin = () =>
  useMutation({
    mutationFn: authService.login,
    onSuccess: applySession,
    // Form đăng nhập tự hiển thị lỗi ngay cạnh ô nhập.
    meta: { silentError: true },
  });

export const useLogout = () =>
  useMutation({
    mutationFn: authService.logout,
    onSuccess: () => forceLogout({ reason: LogoutReason.userLogout }),
    meta: { errorMessage: "Không đăng xuất được, vui lòng thử lại" },
  });
