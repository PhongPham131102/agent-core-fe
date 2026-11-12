"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authKeys } from "@/features/auth";
import { forceLogout, LogoutReason } from "@/lib/auth";

import { accountService } from "./account.service";

import type { IAuthUser } from "@/features/auth";

/** PATCH /auth/me trả về user mới nhất (kèm quyền): ghi thẳng vào cache, khỏi đọc lại. */
const useProfileMutation = (successMessage: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountService.updateProfile,
    onSuccess: (user) => queryClient.setQueryData<IAuthUser>(authKeys.me(), user),
    meta: { successMessage },
  });
};

export const useUpdateProfile = () => useProfileMutation("Đã cập nhật hồ sơ");

export const useUpdateAvatar = () => useProfileMutation("Đã cập nhật ảnh đại diện");

export const useChangePassword = () =>
  useMutation({
    mutationFn: accountService.changePassword,
    // BE đăng xuất mọi phiên và xoá cookie; trang login sẽ hiển thị lý do.
    onSuccess: () => forceLogout({ reason: LogoutReason.passwordChanged }),
  });
