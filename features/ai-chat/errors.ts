import { registerErrorMessages } from "@/lib/http";

/** Khớp `AiChatErrors` bên agent-core-be. */
export const AiChatErrorCode = {
  threadNotFound: "ERR_3000",
  threadBusy: "ERR_3001",
  skillNotAvailable: "ERR_3002",
  imageNotAllowed: "ERR_3003",
  imageLoadFailed: "ERR_3004",
} as const;

registerErrorMessages({
  [AiChatErrorCode.threadNotFound]: "Không tìm thấy cuộc chat",
  [AiChatErrorCode.threadBusy]: "Agent vẫn đang trả lời trong cuộc chat này",
  [AiChatErrorCode.skillNotAvailable]: "Agent không có skill này",
  [AiChatErrorCode.imageNotAllowed]: "Ảnh phải được tải lên qua ứng dụng",
  [AiChatErrorCode.imageLoadFailed]: "Không tải được ảnh đính kèm",
});
