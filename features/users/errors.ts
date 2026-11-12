import { registerErrorMessages } from "@/lib/http";

/** Khớp `UserErrors` bên agent-core-be. */
export const UserErrorCode = {
  notFound: "ERR_2100",
  emailExists: "ERR_2101",
  cannotDeleteSelf: "ERR_2102",
  cannotChangeOwnRole: "ERR_2103",
  beyondOwnAccess: "ERR_2104",
} as const;

registerErrorMessages({
  [UserErrorCode.notFound]: "Không tìm thấy người dùng",
  [UserErrorCode.emailExists]: "Email đã được sử dụng",
  [UserErrorCode.cannotDeleteSelf]: "Bạn không thể xoá tài khoản của chính mình",
  [UserErrorCode.cannotChangeOwnRole]: "Bạn không thể tự đổi vai trò của mình",
  [UserErrorCode.beyondOwnAccess]:
    "Bạn không thể quản lý người dùng hoặc gán vai trò có nhiều quyền hơn mình",
});
