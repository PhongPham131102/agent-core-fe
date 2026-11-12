"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { authQueries } from "../api/auth.queries";
import { hasAnyPermission, hasPermissions } from "../permissions";

import type { PermissionKey } from "../permissions";

export const useAccess = () => {
  const { data: user } = useQuery({ ...authQueries.me(), enabled: false });

  return useMemo(
    () => ({
      user,
      isSuperAdmin: user?.role.isSuperAdmin ?? false,
      can: (...required: PermissionKey[]) => hasPermissions(user, required),
      canAny: (...candidates: PermissionKey[]) => hasAnyPermission(user, candidates),
    }),
    [user],
  );
};
