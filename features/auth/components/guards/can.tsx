"use client";

import { ForbiddenView } from "@/components/common";

import { useAccess } from "../../hooks/use-access";

import type { PermissionKey } from "../../permissions";
import type { ReactNode } from "react";

interface ICanProps {
  permission: PermissionKey | PermissionKey[];
  /** `all` (mặc định): cần đủ mọi quyền. `any`: chỉ cần một quyền. */
  mode?: "all" | "any";
  fallback?: ReactNode;
  children: ReactNode;
}

/** Ẩn phần giao diện khi người dùng thiếu quyền: `<Can permission={Permission.userCreate}>`. */
export function Can({ permission, mode = "all", fallback = null, children }: ICanProps) {
  const { can, canAny } = useAccess();
  const keys = Array.isArray(permission) ? permission : [permission];
  const allowed = mode === "any" ? canAny(...keys) : can(...keys);
  return allowed ? children : fallback;
}

/** Bọc cả trang: thiếu quyền thì hiện trang 403 thay vì gọi API rồi nhận lỗi. */
export function PermissionGuard(props: Omit<ICanProps, "fallback">) {
  return <Can {...props} fallback={<ForbiddenView />} />;
}
