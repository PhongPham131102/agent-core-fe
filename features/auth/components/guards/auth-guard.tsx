"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ErrorView, FullPageSpinner } from "@/components/common";
import { buildLoginUrl } from "@/lib/auth";

import { useCurrentUserQuery } from "../../api/auth.queries";

import type { ReactNode } from "react";

/**
 * Chặn khu vực cần đăng nhập. Khôi phục phiên từ cookie refresh khi tải trang;
 * chưa đăng nhập thì đưa về /login kèm đường dẫn đang xem.
 *
 * Kiểm tra ở client vì cookie refresh thuộc origin của API (path /api/auth) nên
 * `proxy.ts` phía Next không đọc được. Đây chỉ là trải nghiệm: dữ liệu luôn do BE bảo vệ.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, error, refetch } = useCurrentUserQuery();
  const isUnauthenticated = !user && error?.status === 401;

  useEffect(() => {
    if (!isUnauthenticated) return;
    const from = `${window.location.pathname}${window.location.search}`;
    router.replace(buildLoginUrl({ from }));
  }, [isUnauthenticated, router]);

  // Còn dữ liệu cũ thì vẫn hiển thị, kể cả khi lần đọc lại gần nhất lỗi (mất mạng...).
  if (user) return children;
  if (error && !isUnauthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorView error={error} retry={() => void refetch()} />
      </div>
    );
  }
  return <FullPageSpinner />;
}
