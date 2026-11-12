import { registerErrorMessages } from "@/lib/http";

/** Khớp `AuthErrors` bên agent-core-be. */
export const AuthErrorCode = {
  invalidCredentials: "ERR_2000",
  invalidRefreshToken: "ERR_2001",
  invalidOldPassword: "ERR_2002",
  tooManyLoginAttempts: "ERR_2003",
} as const;

registerErrorMessages({
  [AuthErrorCode.invalidCredentials]: "Email hoặc mật khẩu không đúng",
  [AuthErrorCode.invalidRefreshToken]: "Phiên đăng nhập đã hết hạn",
  [AuthErrorCode.invalidOldPassword]: "Mật khẩu hiện tại không đúng",
  [AuthErrorCode.tooManyLoginAttempts]: "Đăng nhập sai quá nhiều lần, vui lòng thử lại sau ít phút",
});
