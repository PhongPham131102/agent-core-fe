import { registerAuthFailureHandler } from "@/lib/http";
import { getQueryClient } from "@/lib/query";
import { resetAllStores } from "@/lib/store";

import { buildLoginUrl, LoginReason } from "./redirect";
import { tokenHolder } from "./token-holder";

const CHANNEL_NAME = "agent-core.auth";
const FORCE_LOGOUT = "force_logout";

export const LogoutReason = {
  userLogout: "USER_LOGOUT",
  sessionExpired: "SESSION_EXPIRED",
  passwordChanged: "PASSWORD_CHANGED",
} as const;
export type LogoutReason = (typeof LogoutReason)[keyof typeof LogoutReason];

interface IForceLogoutOptions {
  reason: LogoutReason;
  /** Phát sang các tab khác (false khi chính mình nhận từ tab khác). */
  broadcast?: boolean;
  redirect?: boolean;
}

interface IForceLogoutMessage {
  type?: string;
  reason?: LogoutReason;
}

let channel: BroadcastChannel | null = null;
let isLoggingOut = false;

/** Lưu access token sau khi đăng nhập/refresh thành công. */
export const startSession = (accessToken: string) => {
  tokenHolder.set(accessToken);
};

/** Xoá toàn bộ trạng thái phiên: token, cache React Query, store đã đăng ký. */
export const clearSession = () => {
  tokenHolder.clear();
  getQueryClient().clear();
  resetAllStores();
};

const loginUrlFor = (reason: LogoutReason) => {
  if (reason === LogoutReason.passwordChanged) {
    return buildLoginUrl({ reason: LoginReason.passwordChanged });
  }
  if (reason === LogoutReason.sessionExpired) {
    // Hết phiên giữa chừng: đăng nhập lại xong quay về đúng trang đang xem.
    const from = `${window.location.pathname}${window.location.search}`;
    return buildLoginUrl({ from, reason: LoginReason.expired });
  }
  return buildLoginUrl();
};

export const forceLogout = ({ reason, broadcast = true, redirect = true }: IForceLogoutOptions) => {
  if (typeof window === "undefined" || isLoggingOut) return;
  isLoggingOut = true;

  clearSession();
  if (broadcast) channel?.postMessage({ type: FORCE_LOGOUT, reason } satisfies IForceLogoutMessage);
  // Điều hướng cứng để bỏ toàn bộ state còn trong bộ nhớ của phiên cũ.
  if (redirect) window.location.assign(loginUrlFor(reason));

  queueMicrotask(() => {
    isLoggingOut = false;
  });
};

/** Gọi một lần ở client (ClientBootstrap). Trả về hàm teardown. */
export const initSessionLifecycle = () => {
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent<IForceLogoutMessage>) => {
    if (event.data?.type !== FORCE_LOGOUT) return;
    forceLogout({ reason: event.data.reason ?? LogoutReason.userLogout, broadcast: false });
  };

  // 401 không cứu được bằng refresh: coi như hết phiên.
  registerAuthFailureHandler(() => forceLogout({ reason: LogoutReason.sessionExpired }));

  return () => {
    registerAuthFailureHandler(null);
    channel?.close();
    channel = null;
  };
};
