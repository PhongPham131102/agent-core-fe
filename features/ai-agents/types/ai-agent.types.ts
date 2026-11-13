import type { IAiKnowledgeBaseOption } from "@/features/ai-knowledge";
import type { IAiMcpServerOption } from "@/features/ai-mcp-servers";
import type { IAiCatalogOption } from "@/features/ai-providers";
import type { IAiSkillOption } from "@/features/ai-skills";
import type { IPaginationQuery } from "@/lib/http";

/** Một tool chọn tay được cho agent (`GET /ai-agents/tools`). */
export interface IAiAgentTool extends IAiCatalogOption {
  description: string;
}

/** Khớp `IAiAgentResponse` bên agent-core-be. */
export interface IAiAgent {
  uid: string;
  /** Mã kebab-case do BE tạo từ tên lúc tạo agent. */
  code: string;
  name: string;
  description: string;
  provider: IAiCatalogOption;
  model: IAiCatalogOption;
  /** `null` là không dùng; có giá trị thì model bỏ qua `temperature`. */
  reasoningEffort: IAiCatalogOption | null;
  systemPrompt: string;
  temperature: number;
  maxOutputTokens: number;
  /** Số lần gọi model tối đa trong một lượt. */
  maxSteps: number;
  /** Số lượt hội thoại cũ gửi kèm. */
  historyTurnLimit: number;
  isActive: boolean;
  skills: IAiSkillOption[];
  knowledgeBases: IAiKnowledgeBaseOption[];
  /** Tool chọn tay; tool của skill, kho tri thức, ghi nhớ tự bật theo cấu hình. */
  tools: IAiAgentTool[];
  mcpServers: IAiMcpServerOption[];
  /** Agent tự ghi nhớ thông tin về từng người dùng giữa các cuộc chat. */
  memoryEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAiAgentListQuery extends IPaginationQuery {
  /** Tìm theo tên hoặc mã. */
  search?: string;
}

/**
 * Đầu vào nhận `id` thô của nhà cung cấp, model và mức suy luận; `reasoningEffort: ""` là
 * không dùng. FE không gửi `code`: BE tự tạo từ tên.
 */
export interface ICreateAiAgentBody {
  name: string;
  description?: string;
  provider: string;
  model: string;
  reasoningEffort?: string;
  systemPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  maxSteps?: number;
  historyTurnLimit?: number;
  isActive?: boolean;
  /** `code` của các skill gắn với agent. */
  skillCodes?: string[];
  /** `uid` của các kho tri thức agent được tìm. */
  knowledgeBaseUids?: string[];
  /** `id` của các tool chọn tay (`GET /ai-agents/tools`). */
  toolNames?: string[];
  /** `code` của các MCP server agent được dùng tool. */
  mcpServerCodes?: string[];
  memoryEnabled?: boolean;
}

/** `POST /ai-agents/vector-sync`: số điểm vector đã dựng lại. */
export interface IAiVectorSyncResult {
  knowledgePointCount: number;
  memoryPointCount: number;
}

/** Chỉ gửi field đã đổi. */
export type IUpdateAiAgentBody = Partial<ICreateAiAgentBody>;
