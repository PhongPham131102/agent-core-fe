"use client";

import { useCallback } from "react";

import { Permission, useAccess } from "@/features/auth";

import { useRoleOptionsQuery } from "../api/roles.queries";

/**
 * Danh sách role cho ô chọn và ô lọc (GET /roles/options, cần quyền `user:read`).
 * `isAssignable` cho biết người đang thao tác có được gán, hay quản lý người đang giữ,
 * một role hay không. Chưa tải xong thì coi là được: quyết định cuối cùng thuộc về BE.
 */
export const useRoleOptions = () => {
  const { can } = useAccess();
  const isAvailable = can(Permission.userRead);
  const { data, isLoading, isError } = useRoleOptionsQuery({ enabled: isAvailable });

  const isAssignable = useCallback(
    (roleUid: string) => data?.find(({ uid }) => uid === roleUid)?.assignable ?? true,
    [data],
  );

  return {
    options: data ?? [],
    isLoading,
    isUnavailable: !isAvailable || isError,
    isAssignable,
  };
};
