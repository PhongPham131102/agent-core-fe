import type { IAiCatalogOption } from "@/features/ai-providers";
import type { IPaginationQuery } from "@/lib/http";

/** Khớp `IAiAgentResponse` bên agent-core-be. */
export interface IAiAgent {
  uid: string;
  /** Mã kebab-case, luôn có giá trị: bỏ trống khi lưu thì BE lấy slug của tên. */
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
  createdAt: string;
  updatedAt: string;
}

export interface IAiAgentListQuery extends IPaginationQuery {
  /** Tìm theo tên hoặc mã. */
  search?: string;
}

/**
 * Đầu vào nhận `id` thô của nhà cung cấp, model và mức suy luận.
 * `code: ""` hoặc bỏ trống là lấy slug của tên; `reasoningEffort: ""` là không dùng.
 */
export interface ICreateAiAgentBody {
  code?: string;
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
}

/** Chỉ gửi field đã đổi. */
export type IUpdateAiAgentBody = Partial<ICreateAiAgentBody>;
