import { compactParams, http } from "@/lib/http";

import { MCP_CALL_TIMEOUT_MS, MCP_SYNC_TIMEOUT_MS } from "../constants";

import type {
  IAiMcpServer,
  IAiMcpServerListQuery,
  IAiMcpServerOption,
  IAiMcpTool,
  IAiMcpToolCallResult,
  ICreateAiMcpServerBody,
  IUpdateAiMcpServerBody,
} from "../types/ai-mcp-server.types";
import type { IPaginated } from "@/lib/http";

const BASE = "/ai-mcp-servers";

export const aiMcpServerService = {
  list: (query: IAiMcpServerListQuery) =>
    http.get<IPaginated<IAiMcpServer>>(BASE, { params: compactParams(query) }),
  detail: (uid: string) => http.get<IAiMcpServer>(`${BASE}/${uid}`),
  /** Mọi server, cho ô chọn server của agent. Cần quyền `ai-agent:read`. */
  options: () => http.get<IAiMcpServerOption[]>(`${BASE}/options`),
  create: (body: ICreateAiMcpServerBody) => http.post<IAiMcpServer>(BASE, body),
  update: (uid: string, body: IUpdateAiMcpServerBody) =>
    http.patch<IAiMcpServer>(`${BASE}/${uid}`, body),
  remove: (uid: string) => http.delete(`${BASE}/${uid}`),
  /** Đọc lại danh sách tool từ server MCP; lỗi kết nối được BE lưu ở `lastSyncError`. */
  syncTools: (uid: string) =>
    http.post<IAiMcpServer>(`${BASE}/${uid}/sync-tools`, undefined, {
      timeout: MCP_SYNC_TIMEOUT_MS,
    }),
  tools: (uid: string) => http.get<IAiMcpTool[]>(`${BASE}/${uid}/tools`),
  callTool: (uid: string, toolName: string, args: Record<string, unknown>) =>
    http.post<IAiMcpToolCallResult>(
      `${BASE}/${uid}/tools/${encodeURIComponent(toolName)}/call`,
      { arguments: args },
      { timeout: MCP_CALL_TIMEOUT_MS },
    ),
};
