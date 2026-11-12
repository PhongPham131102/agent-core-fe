"use client";

import { Suspense } from "react";

import { AppShell } from "@/components/layout";
import { UserMenu } from "@/features/account";
import { AuthGuard } from "@/features/auth";

import { useShellMenu } from "../hooks/use-shell-menu";

import type { ReactNode } from "react";

function ShellLayout({ children }: { children: ReactNode }) {
  const menuItems = useShellMenu();

  return (
    <AppShell menuItems={menuItems} headerExtra={<UserMenu />}>
      {/* Trang danh sách đọc filter từ URL (nuqs/useSearchParams) nên cần Suspense. */}
      <Suspense>{children}</Suspense>
    </AppShell>
  );
}

/** Khu vực sau đăng nhập: kiểm tra phiên, rồi dựng khung trang với menu theo quyền. */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ShellLayout>{children}</ShellLayout>
    </AuthGuard>
  );
}
