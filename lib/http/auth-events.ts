/**
 * Cầu nối giữa tầng HTTP và tầng auth/session.
 * lib/http không import lib/auth; auth đăng ký handler vào đây.
 */
type RefreshHandler = () => Promise<string>;
type AuthFailureHandler = (reason: string) => void;

let refreshHandler: RefreshHandler | null = null;
let authFailureHandler: AuthFailureHandler | null = null;

/** Cách lấy access token mới. Chưa đăng ký thì 401 sẽ coi như hết phiên. */
export const registerRefreshHandler = (handler: RefreshHandler | null) => {
  refreshHandler = handler;
};

export const registerAuthFailureHandler = (handler: AuthFailureHandler | null) => {
  authFailureHandler = handler;
};

export const getRefreshHandler = () => refreshHandler;

export const emitAuthFailure = (reason: string) => {
  authFailureHandler?.(reason);
};
