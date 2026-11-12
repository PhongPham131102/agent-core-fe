"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { BrandLogo, FullPageSpinner } from "@/components/common";
import { LoginReason, REASON_PARAM, REDIRECT_PARAM, resolveRedirectTarget } from "@/lib/auth";

import { authQueries } from "../../api/auth.queries";

import { LoginBrandPanel } from "./login-brand-panel";
import { LoginForm } from "./login-form";

const REASON_MESSAGES: Record<string, string> = {
  [LoginReason.expired]: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  [LoginReason.passwordChanged]: "Mật khẩu đã được đổi. Vui lòng đăng nhập lại.",
};

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const target = resolveRedirectTarget(searchParams.get(REDIRECT_PARAM));
  const reasonMessage = REASON_MESSAGES[searchParams.get(REASON_PARAM) ?? ""];

  // Đã có phiên (cookie còn hạn, hoặc vừa đăng nhập xong) thì rời trang login.
  // `retryOnMount: false`: guard vừa xác định chưa đăng nhập thì không hỏi lại BE ngay.
  // Khi quay lại tab, query vẫn thử lại một lần, nhờ vậy đăng nhập ở tab khác xong
  // thì tab này cũng tự vào.
  const { data: user } = useQuery({ ...authQueries.me(), retryOnMount: false });

  useEffect(() => {
    if (user) router.replace(target);
  }, [user, router, target]);

  if (user) return <FullPageSpinner tip="Đang chuyển trang..." />;

  return (
    <div className="flex min-h-screen bg-white">
      <LoginBrandPanel />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Màn hình nhỏ không có panel thương hiệu nên logo nằm ngay trên form. */}
          <BrandLogo size={36} className="mb-10 lg:hidden" />
          <Typography.Title level={2} className="mb-2! tracking-tight">
            Đăng nhập
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="mb-8!">
            Chào mừng trở lại. Nhập tài khoản của bạn để tiếp tục.
          </Typography.Paragraph>
          {reasonMessage && <Alert type="info" showIcon className="mb-6!" title={reasonMessage} />}
          <LoginForm />
          <Typography.Paragraph type="secondary" className="mt-8! mb-0! text-center text-sm">
            Chưa có tài khoản hoặc quên mật khẩu? Liên hệ quản trị viên để được cấp lại.
          </Typography.Paragraph>
        </div>
      </main>
    </div>
  );
}

export function LoginPage() {
  // useSearchParams cần Suspense để trang vẫn prerender được.
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <LoginScreen />
    </Suspense>
  );
}
