import { routes } from "@/lib/constants/routes";

export const REDIRECT_PARAM = "redirect";
export const REASON_PARAM = "reason";

/** Lý do bị đưa về trang đăng nhập, hiển thị thành thông báo ở trang login. */
export const LoginReason = {
  expired: "expired",
  passwordChanged: "password-changed",
} as const;
export type LoginReason = (typeof LoginReason)[keyof typeof LoginReason];

interface ILoginUrlOptions {
  /** Đường dẫn (pathname + search) sẽ quay lại sau khi đăng nhập. */
  from?: string;
  reason?: LoginReason;
}

/**
 * Chỉ chấp nhận đường dẫn nội bộ (bắt đầu bằng một dấu "/") để tránh open redirect
 * kiểu `?redirect=https://evil.com` hoặc `//evil.com`.
 */
const isSafeInternalPath = (path: string) =>
  path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");

const isLoginPath = (path: string) => path === routes.login || path.startsWith(`${routes.login}?`);

export const buildLoginUrl = ({ from, reason }: ILoginUrlOptions = {}) => {
  const params = new URLSearchParams();
  if (from && from !== routes.home && isSafeInternalPath(from) && !isLoginPath(from)) {
    params.set(REDIRECT_PARAM, from);
  }
  if (reason) params.set(REASON_PARAM, reason);

  const query = params.toString();
  return query ? `${routes.login}?${query}` : routes.login;
};

/** Đích đến sau khi đăng nhập, lấy từ `?redirect=`; không hợp lệ thì về trang chủ. */
export const resolveRedirectTarget = (raw: string | null | undefined) =>
  raw && isSafeInternalPath(raw) && !isLoginPath(raw) ? raw : routes.home;
