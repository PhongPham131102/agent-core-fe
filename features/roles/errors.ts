import { registerErrorMessages } from "@/lib/http";

/** Khớp `RoleErrors` bên agent-core-be. */
export const RoleErrorCode = {
  notFound: "ERR_2200",
  nameExists: "ERR_2201",
  isSystem: "ERR_2202",
  inUse: "ERR_2203",
  beyondOwnAccess: "ERR_2204",
} as const;

registerErrorMessages({
  [RoleErrorCode.notFound]: "Không tìm thấy vai trò",
  [RoleErrorCode.nameExists]: "Tên vai trò đã được sử dụng",
  [RoleErrorCode.isSystem]: "Không thể sửa hoặc xoá vai trò hệ thống",
  [RoleErrorCode.inUse]: "Vai trò đang được gán cho người dùng nên chưa xoá được",
  [RoleErrorCode.beyondOwnAccess]:
    "Bạn không thể cấp quyền mình không có, hoặc sửa vai trò đang giữ những quyền đó",
});
