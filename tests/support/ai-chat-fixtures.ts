import type { IChatTurn } from "@/features/ai-chat/model/chat-turn";
import type { IAiChatMessage } from "@/features/ai-chat/types/ai-chat.types";

export const AGENT_UID = "77777777-7777-4777-8777-777777777777";
export const THREAD_UID = "88888888-8888-4888-8888-888888888888";

/** Tin nhắn đã lưu, khớp response của agent-core-be. */
export const buildChatMessage = (overrides: Partial<IAiChatMessage> = {}): IAiChatMessage => ({
  uid: "m1",
  role: "assistant",
  content: "",
  status: { id: "completed", name: "Completed" },
  errorMessage: "",
  toolCalls: [],
  imageUrls: [],
  skillCode: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

export const buildChatTurn = (overrides: Partial<IChatTurn> = {}): IChatTurn => ({
  id: "turn-1",
  agentUid: AGENT_UID,
  threadUid: THREAD_UID,
  message: "Xin chào",
  imageUrls: [],
  skillCode: "",
  content: "",
  steps: [],
  sources: [],
  ...overrides,
});

/** Trang lịch sử như `useInfiniteQuery` giữ trong cache (mới nhất trước). */
export const pagesOf = (items: IAiChatMessage[]) => ({
  pages: [{ items, total: items.length, page: 1, limit: 30 }],
  pageParams: [1],
});
