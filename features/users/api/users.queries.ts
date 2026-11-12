"use client";

import { keepPreviousData, queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { authKeys } from "@/features/auth";

import { userKeys } from "./users.keys";
import { userService } from "./users.service";

import type { IUpdateUserBody, IUserListQuery } from "../types/user.types";

export const userQueries = {
  list: (query: IUserListQuery) =>
    queryOptions({
      queryKey: userKeys.list(query),
      queryFn: () => userService.list(query),
      placeholderData: keepPreviousData,
    }),
  detail: (uid: string) =>
    queryOptions({ queryKey: userKeys.detail(uid), queryFn: () => userService.detail(uid) }),
};

export const useUsersQuery = (query: IUserListQuery) => useQuery(userQueries.list(query));

export const useCreateUser = () =>
  useMutation({
    mutationFn: userService.create,
    meta: { invalidates: [userKeys.all], successMessage: "Đã tạo người dùng" },
  });

export const useUpdateUser = () =>
  useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: IUpdateUserBody }) =>
      userService.update(uid, body),
    // Người được sửa có thể là chính mình: đọc lại tên, ảnh ở header.
    meta: { invalidates: [userKeys.all, authKeys.me()], successMessage: "Đã cập nhật người dùng" },
  });

export const useResetUserPassword = () =>
  useMutation({
    mutationFn: ({ uid, newPassword }: { uid: string; newPassword: string }) =>
      userService.resetPassword(uid, newPassword),
    meta: { successMessage: "Đã đặt lại mật khẩu" },
  });

export const useDeleteUser = () =>
  useMutation({
    mutationFn: userService.remove,
    meta: { invalidates: [userKeys.all], successMessage: "Đã xoá người dùng" },
  });
