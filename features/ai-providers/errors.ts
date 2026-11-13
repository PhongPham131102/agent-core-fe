import { registerErrorMessages } from "@/lib/http";

/** Khớp `AiProviderErrors` bên agent-core-be. */
export const AiProviderErrorCode = {
  keyNotFound: "ERR_2400",
  providerHasKey: "ERR_2401",
  /** Model không thuộc danh mục của nhà cung cấp; BE dùng chung cho API key và agent. */
  modelNotSupported: "ERR_2402",
  /** Nhà cung cấp chưa có key (ví dụ khi tạo embedding cho kho tri thức). */
  keyNotConfigured: "ERR_2403",
} as const;

registerErrorMessages({
  [AiProviderErrorCode.keyNotFound]: "Không tìm thấy API key",
  [AiProviderErrorCode.providerHasKey]: "Nhà cung cấp này đã có API key",
  [AiProviderErrorCode.modelNotSupported]: "Model này không có trong danh sách của nhà cung cấp",
  [AiProviderErrorCode.keyNotConfigured]: "Nhà cung cấp AI chưa có API key",
});
