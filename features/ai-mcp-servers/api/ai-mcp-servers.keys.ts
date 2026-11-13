import type { IAiMcpServerListQuery } from "../types/ai-mcp-server.types";

export const aiMcpServerKeys = {
  all: ["ai-mcp-servers"] as const,
  lists: () => [...aiMcpServerKeys.all, "list"] as const,
  list: (query: IAiMcpServerListQuery) => [...aiMcpServerKeys.lists(), query] as const,
  details: () => [...aiMcpServerKeys.all, "detail"] as const,
  detail: (uid: string) => [...aiMcpServerKeys.details(), uid] as const,
  tools: (uid: string) => [...aiMcpServerKeys.detail(uid), "tools"] as const,
  options: () => [...aiMcpServerKeys.all, "options"] as const,
};
