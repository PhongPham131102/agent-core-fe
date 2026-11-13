import type { IAiAgentListQuery } from "../types/ai-agent.types";

export const aiAgentKeys = {
  all: ["ai-agents"] as const,
  lists: () => [...aiAgentKeys.all, "list"] as const,
  list: (query: IAiAgentListQuery) => [...aiAgentKeys.lists(), query] as const,
  details: () => [...aiAgentKeys.all, "detail"] as const,
  detail: (uid: string) => [...aiAgentKeys.details(), uid] as const,
  /** Danh mục cố định bên BE, không đổi theo agent nào. */
  reasoningEfforts: () => ["ai-reasoning-efforts"] as const,
  tools: () => ["ai-agent-tools"] as const,
};
