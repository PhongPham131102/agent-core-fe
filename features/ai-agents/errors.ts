import { AiProviderErrorCode } from "@/features/ai-providers";
import { registerErrorMessages } from "@/lib/http";

import type { AiAgentValues } from "./schemas/ai-agent.schema";

/** Khớp `AiAgentErrors` bên agent-core-be. */
export const AiAgentErrorCode = {
  notFound: "ERR_2500",
  codeExists: "ERR_2501",
  /** Bỏ trống mã mà tên không tạo được mã (ví dụ toàn ký tự đặc biệt). */
  codeRequired: "ERR_2502",
} as const;

registerErrorMessages({
  [AiAgentErrorCode.notFound]: "Không tìm thấy agent",
  [AiAgentErrorCode.codeExists]: "Mã agent đã được sử dụng",
  [AiAgentErrorCode.codeRequired]: "Không tạo được mã từ tên, vui lòng nhập mã",
});

/** Lỗi BE gắn với một field của form agent: hiện ngay dưới field đó. */
export const AGENT_FIELD_BY_ERROR: Record<string, keyof AiAgentValues> = {
  [AiAgentErrorCode.codeExists]: "code",
  [AiAgentErrorCode.codeRequired]: "code",
  [AiProviderErrorCode.modelNotSupported]: "model",
};
