import type { IAiChatMessage, IChatToolCall, IKnowledgeSource } from "../types/ai-chat.types";

/** Namespace và tên sự kiện, khớp `AI_CHAT_SOCKET`, `AI_CHAT_EVENTS` bên agent-core-be. */
export const CHAT_NAMESPACE = "ai-chat";

export const ChatEvent = {
  send: "ai:chat",
  stop: "ai:chat:stop",
  chunk: "ai:chat:chunk",
  step: "ai:chat:step",
  toolResult: "ai:chat:tool-result",
  done: "ai:chat:done",
  error: "ai:chat:error",
} as const;

export interface ISendChatPayload {
  agentUid: string;
  message: string;
  /** Bỏ trống để mở cuộc chat mới. */
  threadUid?: string;
  /** URL ảnh đã tải lên qua app, tối đa 4. */
  imageUrls?: string[];
  /** `code` một skill của agent, áp dụng cho lượt này. */
  skillCode?: string;
}

export type ChatAck<T> =
  ({ accepted: true } & T) | { accepted: false; code: string; message: string };

export interface IChatChunkEvent {
  threadUid: string;
  delta: string;
}

/** Agent bắt đầu gọi một tool. */
export interface IChatStepEvent extends Omit<IChatToolCall, "isError"> {
  threadUid: string;
}

/** Tool chạy xong; ghép với `IChatStepEvent` qua `toolCallId`. */
export interface IChatToolResultEvent extends IChatToolCall {
  threadUid: string;
  /** Chỉ tool tìm trong kho tri thức có `sources`; nguồn không được lưu, chỉ có ở đây. */
  artifact?: { sources?: IKnowledgeSource[] };
}

export interface IChatDoneEvent {
  threadUid: string;
  message: IAiChatMessage;
}

export interface IChatErrorEvent {
  threadUid: string;
  message?: IAiChatMessage;
}
