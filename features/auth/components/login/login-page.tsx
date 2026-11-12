"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { BrandLogo, FullPageSpinner } from "@/components/common";
import { LoginReason, REASON_PARAM, REDIRECT_PARAM, resolveRedirectTarget } from "@/lib/auth";
import { appConfig } from "@/lib/constants/app";

import { authQueries } from "../../api/auth.queries";

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
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-100 rounded-2xl border border-black/6 bg-white px-6 py-10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:px-10">
        <div className="mb-8 flex flex-col items-center gap-3">
          <BrandLogo size={48} showName={false} />
          <Typography.Title level={4} className="m-0!">
            {appConfig.name}
          </Typography.Title>
        </div>
        {reasonMessage && <Alert type="info" showIcon className="mb-6!" title={reasonMessage} />}
        <LoginForm />
      </div>
    </main>
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
