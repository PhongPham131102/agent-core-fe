import { AiProviderErrorCode } from "@/features/ai-providers";
import { registerErrorMessages } from "@/lib/http";

import type { AiAgentValues } from "./schemas/ai-agent.schema";

/** Khớp `AiAgentErrors` bên agent-core-be. */
export const AiAgentErrorCode = {
  notFound: "ERR_2500",
  codeExists: "ERR_2501",
  /** Tên không tạo được mã (ví dụ toàn ký tự đặc biệt). */
  codeRequired: "ERR_2502",
  /** Có skill được chọn không còn tồn tại. */
  unknownSkills: "ERR_2503",
  /** Có kho tri thức được chọn không còn tồn tại. */
  unknownKnowledgeBases: "ERR_2504",
  /** Có tool được chọn không còn chọn được. */
  unknownTools: "ERR_2505",
  /** Có MCP server được chọn không còn tồn tại. */
  unknownMcpServers: "ERR_2506",
} as const;

registerErrorMessages({
  [AiAgentErrorCode.notFound]: "Không tìm thấy agent",
  [AiAgentErrorCode.codeExists]: "Đã có agent khác trùng tên này",
  [AiAgentErrorCode.codeRequired]: "Tên cần có ít nhất một chữ cái hoặc chữ số",
  [AiAgentErrorCode.unknownSkills]: "Có skill không còn tồn tại, vui lòng chọn lại",
  [AiAgentErrorCode.unknownKnowledgeBases]: "Có kho tri thức không còn tồn tại, vui lòng chọn lại",
  [AiAgentErrorCode.unknownTools]: "Có tool không còn dùng được, vui lòng chọn lại",
  [AiAgentErrorCode.unknownMcpServers]: "Có MCP server không còn tồn tại, vui lòng chọn lại",
});

/**
 * Lỗi BE gắn với một field của form agent: hiện ngay dưới field đó. Mã do BE tạo từ tên,
 * nên lỗi về mã hiện ở ô tên.
 */
export const AGENT_FIELD_BY_ERROR: Record<string, keyof AiAgentValues> = {
  [AiAgentErrorCode.codeExists]: "name",
  [AiAgentErrorCode.codeRequired]: "name",
  [AiAgentErrorCode.unknownSkills]: "skillCodes",
  [AiAgentErrorCode.unknownKnowledgeBases]: "knowledgeBaseUids",
  [AiAgentErrorCode.unknownTools]: "toolNames",
  [AiAgentErrorCode.unknownMcpServers]: "mcpServerCodes",
  [AiProviderErrorCode.modelNotSupported]: "model",
};
