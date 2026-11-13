import { registerErrorMessages } from "@/lib/http";

/** Khớp `AiMemoryErrors` bên agent-core-be. */
export const AiMemoryErrorCode = {
  notFound: "ERR_2900",
} as const;

registerErrorMessages({
  [AiMemoryErrorCode.notFound]: "Không tìm thấy ghi nhớ",
});
