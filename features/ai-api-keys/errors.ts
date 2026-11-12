import { registerErrorMessages } from "@/lib/http";

/** Khớp `AiProviderErrors` bên agent-core-be. */
export const AiApiKeyErrorCode = {
  notFound: "ERR_2400",
  providerHasKey: "ERR_2401",
  modelNotSupported: "ERR_2402",
} as const;

registerErrorMessages({
  [AiApiKeyErrorCode.notFound]: "Không tìm thấy API key",
  [AiApiKeyErrorCode.providerHasKey]: "Nhà cung cấp này đã có API key",
  [AiApiKeyErrorCode.modelNotSupported]: "Model này không có trong danh sách của nhà cung cấp",
});
