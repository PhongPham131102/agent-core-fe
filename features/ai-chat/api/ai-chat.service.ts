import { compactParams, http } from "@/lib/http";

import type { IAiChatAgent, IAiChatMessage, IAiChatThread } from "../types/ai-chat.types";
import type { IPaginated } from "@/lib/http";

const BASE = "/ai-chats";
export const CHAT_PAGE_SIZE = 30;

/** REST chỉ để đọc lại và xoá; gửi tin và nhận trả lời đi qua socket. */
export const aiChatService = {
  agents: () => http.get<IAiChatAgent[]>(`${BASE}/agents`),
  /** Mới nhất trước. */
  threads: (agentUid: string, page: number) =>
    http.get<IPaginated<IAiChatThread>>(`${BASE}/threads`, {
      params: compactParams({ agentUid, page, limit: CHAT_PAGE_SIZE }),
    }),
  /** Mới nhất trước; nơi hiển thị tự đảo lại. */
  messages: (threadUid: string, page: number) =>
    http.get<IPaginated<IAiChatMessage>>(`${BASE}/threads/${threadUid}/messages`, {
      params: { page, limit: CHAT_PAGE_SIZE },
    }),
  renameThread: (threadUid: string, title: string) =>
    http.patch<IAiChatThread>(`${BASE}/threads/${threadUid}`, { title }),
  removeThread: (threadUid: string) => http.delete(`${BASE}/threads/${threadUid}`),
};
