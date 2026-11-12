import { routes } from "@/lib/constants/routes";
import { registerAuthFailureHandler } from "@/lib/http";
import { getQueryClient } from "@/lib/query";
import { resetAllStores } from "@/lib/store";

import { tokenHolder } from "./token-holder";

const CHANNEL_NAME = "agent-core.auth";
const FORCE_LOGOUT = "force_logout";

interface IForceLogoutOptions {
  reason: string;
  /** Phát sang các tab khác (false khi chính mình nhận từ tab khác). */
  broadcast?: boolean;
  redirect?: boolean;
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

export const forceLogout = ({ reason, broadcast = true, redirect = true }: IForceLogoutOptions) => {
  if (typeof window === "undefined" || isLoggingOut) return;
  isLoggingOut = true;

  clearSession();
  if (broadcast) channel?.postMessage({ type: FORCE_LOGOUT, reason });
  if (redirect && window.location.pathname !== routes.login) {
    window.location.assign(routes.login);
  }

  queueMicrotask(() => {
    isLoggingOut = false;
  });
};

/** Gọi một lần ở client (SessionLifecycle). Trả về hàm teardown. */
export const initSessionLifecycle = () => {
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent<{ type?: string; reason?: string }>) => {
    if (event.data?.type !== FORCE_LOGOUT) return;
    forceLogout({ reason: event.data.reason ?? "BROADCAST", broadcast: false });
  };

  registerAuthFailureHandler((reason) => forceLogout({ reason }));

  return () => {
    registerAuthFailureHandler(null);
    channel?.close();
    channel = null;
  };
};
