"use client";

import { keepPreviousData, queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import { authKeys } from "@/features/auth";

import { roleKeys } from "./roles.keys";
import { roleService } from "./roles.service";

import type { IRoleListQuery, IUpdateRoleBody } from "../types/role.types";

const OPTIONS_STALE_TIME_MS = 5 * 60_000;

export const roleQueries = {
  list: (query: IRoleListQuery) =>
    queryOptions({
      queryKey: roleKeys.list(query),
      queryFn: () => roleService.list(query),
      placeholderData: keepPreviousData,
    }),
  /** Nằm dưới `roleKeys.all` nên mọi thay đổi role đều làm mới danh sách này. */
  options: () =>
    queryOptions({
      queryKey: roleKeys.options(),
      queryFn: roleService.options,
      staleTime: OPTIONS_STALE_TIME_MS,
    }),
  /** Danh mục quyền chỉ đổi khi BE deploy bản mới. */
  permissionCatalog: () =>
    queryOptions({
      queryKey: roleKeys.permissionCatalog(),
      queryFn: roleService.permissionCatalog,
      staleTime: Infinity,
    }),
};

export const useRolesQuery = (query: IRoleListQuery) => useQuery(roleQueries.list(query));

export const useRoleOptionsQuery = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({ ...roleQueries.options(), enabled });

export const usePermissionCatalogQuery = () => useQuery(roleQueries.permissionCatalog());

export const useCreateRole = () =>
  useMutation({
    mutationFn: roleService.create,
    meta: { invalidates: [roleKeys.all], successMessage: "Đã tạo vai trò" },
  });

export const useUpdateRole = () =>
  useMutation({
    mutationFn: ({ uid, body }: { uid: string; body: IUpdateRoleBody }) =>
      roleService.update(uid, body),
    // Role vừa sửa có thể là role của chính mình: đọc lại quyền hiện tại.
    meta: { invalidates: [roleKeys.all, authKeys.me()], successMessage: "Đã cập nhật vai trò" },
  });

export const useDeleteRole = () =>
  useMutation({
    mutationFn: roleService.remove,
    meta: { invalidates: [roleKeys.all], successMessage: "Đã xoá vai trò" },
  });
