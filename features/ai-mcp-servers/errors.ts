import { registerErrorMessages } from "@/lib/http";

/** Khớp `AiMcpServerErrors` bên agent-core-be. */
export const AiMcpServerErrorCode = {
  notFound: "ERR_3100",
  codeExists: "ERR_3101",
  toolNotAllowed: "ERR_3102",
  connectFailed: "ERR_3103",
} as const;

registerErrorMessages({
  [AiMcpServerErrorCode.notFound]: "Không tìm thấy MCP server",
  [AiMcpServerErrorCode.codeExists]: "Mã này đã được dùng",
  [AiMcpServerErrorCode.toolNotAllowed]: "Tool này chưa được cho phép gọi",
  [AiMcpServerErrorCode.connectFailed]: "Không kết nối được MCP server",
});
