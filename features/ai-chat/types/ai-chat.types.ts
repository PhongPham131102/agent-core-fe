import type { IAiSkillOption } from "@/features/ai-skills";

/** Agent đang bật mà người dùng chat được (`GET /ai-chats/agents`). */
export interface IAiChatAgent {
  uid: string;
  name: string;
  description: string;
  /** Có bật ghi nhớ: mới hiện mục ghi nhớ của agent. */
  memoryEnabled: boolean;
  /** Skill gắn với agent, chọn được cho từng tin nhắn. */
  skills: IAiSkillOption[];
}

/** Khớp `IAiChatThreadResponse` bên agent-core-be. */
export interface IAiChatThread {
  uid: string;
  agentUid: string;
  title: string;
  createdAt: string;
}

export const ChatMessageRole = {
  user: "user",
  assistant: "assistant",
} as const;

export type ChatMessageRole = (typeof ChatMessageRole)[keyof typeof ChatMessageRole];

export const ChatMessageStatus = {
  completed: "completed",
  cancelled: "cancelled",
  failed: "failed",
} as const;

export type ChatMessageStatus = (typeof ChatMessageStatus)[keyof typeof ChatMessageStatus];

/** Một lần agent gọi tool, lưu cùng tin trả lời (khớp `IAiChatToolCall` bên BE). */
export interface IChatToolCall {
  toolCallId: string;
  toolName: string;
  /** Dòng hiển thị, ví dụ "Searching the knowledge bases...". */
  label: string;
  isError: boolean;
}

/** Một đoạn tài liệu agent đã dùng (artifact của tool tìm trong kho tri thức). */
export interface IKnowledgeSource {
  documentUid: string;
  fileName: string;
  chunkIndex: number;
  score: number;
}

/** Khớp `IAiChatMessageResponse` bên agent-core-be. */
export interface IAiChatMessage {
  uid: string;
  role: ChatMessageRole;
  content: string;
  status: { id: ChatMessageStatus; name: string };
  /** Lý do khi `status` là `failed`; tin bị dừng cũng có, nên hiển thị theo `status`. */
  errorMessage: string;
  /** Các tool agent đã gọi trong lượt (chỉ tin của agent). */
  toolCalls: IChatToolCall[];
  /** Ảnh và skill người dùng gửi kèm (chỉ tin của người dùng); `skillCode` "" là không chọn. */
  imageUrls: string[];
  skillCode: string;
  createdAt: string;
}
