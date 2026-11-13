import { ChatMessageRole, ChatMessageStatus } from "../types/ai-chat.types";

import type { IChatTurn, IChatTurnStep } from "./chat-turn";
import type { IAiChatMessage, IKnowledgeSource } from "../types/ai-chat.types";
import type { IPaginated } from "@/lib/http";
import type { InfiniteData } from "@tanstack/react-query";

/** Một tin trên màn hình, dù lấy từ lịch sử đã lưu hay từ lượt đang chạy. */
export interface IChatViewMessage {
  key: string;
  role: ChatMessageRole;
  content: string;
  imageUrls: string[];
  skillCode: string;
  /** Có khi trạng thái khác "completed" (đã dừng, lỗi). */
  status?: IAiChatMessage["status"];
  /** Chỉ có khi tin lỗi; tin bị dừng BE cũng gửi lý do nhưng không phải lỗi. */
  errorMessage: string;
  /** Phần trả lời đang chạy: bước tool hiện tại và nguồn trích dẫn. */
  live?: { steps: IChatTurnStep[]; sources: IKnowledgeSource[] };
}

export type ChatMessagePages = InfiniteData<IPaginated<IAiChatMessage>>;

/** Gộp các trang lịch sử (mới nhất trước), bỏ tin trùng giữa các trang. */
export const flattenMessages = (data?: ChatMessagePages): IAiChatMessage[] => {
  const seen = new Set<string>();
  return (data?.pages ?? [])
    .flatMap(({ items }) => items)
    .filter(({ uid }) => !seen.has(uid) && Boolean(seen.add(uid)));
};

/** Tin đã lưu → tin hiển thị. */
export const toViewMessage = (message: IAiChatMessage): IChatViewMessage => ({
  key: message.uid,
  role: message.role,
  content: message.content,
  imageUrls: message.imageUrls,
  skillCode: message.skillCode,
  status: message.status.id === ChatMessageStatus.completed ? undefined : message.status,
  errorMessage: message.status.id === ChatMessageStatus.failed ? message.errorMessage : "",
});

const userOfTurn = (turn: IChatTurn): IChatViewMessage => ({
  key: `${turn.id}:user`,
  role: ChatMessageRole.user,
  content: turn.message,
  imageUrls: turn.imageUrls,
  skillCode: turn.skillCode,
  errorMessage: "",
});

const answerOfTurn = (turn: IChatTurn): IChatViewMessage => ({
  key: `${turn.id}:assistant`,
  role: ChatMessageRole.assistant,
  content: turn.content,
  imageUrls: [],
  skillCode: "",
  errorMessage: "",
  live: { steps: turn.steps, sources: turn.sources },
});

/** BE lưu tin người dùng ngay khi nhận: tin đó đã có trong lịch sử thì không hiện lần nữa. */
const isSavedTurnMessage = (saved: IAiChatMessage | undefined, turn: IChatTurn) =>
  saved?.role === ChatMessageRole.user && saved.content === turn.message.trim();

/**
 * Danh sách tin để hiển thị, mới nhất trước: lịch sử đã lưu (đã đổi sang tin hiển thị) cộng
 * lượt đang chạy. Đây là nơi duy nhất ghép hai nguồn, nên mỗi tin chỉ xuất hiện một lần.
 */
export const withLiveTurn = (
  history: IChatViewMessage[],
  newestSaved: IAiChatMessage | undefined,
  turn?: IChatTurn,
): IChatViewMessage[] => {
  if (!turn) return history;
  const visibleHistory = isSavedTurnMessage(newestSaved, turn) ? history.slice(1) : history;
  const sent = turn.message ? [userOfTurn(turn)] : [];
  return [answerOfTurn(turn), ...sent, ...visibleHistory];
};

/** Như `withLiveTurn` nhưng nhận thẳng tin đã lưu (dùng khi không cần giữ lại phần lịch sử). */
export const toChatView = (saved: IAiChatMessage[], turn?: IChatTurn): IChatViewMessage[] =>
  withLiveTurn(saved.map(toViewMessage), saved[0], turn);

/**
 * Lượt xong: ghi tin trả lời BE vừa lưu (và tin người dùng nếu cache chưa có) vào trang đầu
 * của lịch sử, để bỏ lượt đang chạy mà không bị nháy hay trùng. Sau đó vẫn tải lại để thay
 * tin người dùng tạm bằng bản đã lưu.
 */
export const addFinishedTurn = (
  data: ChatMessagePages | undefined,
  turn: IChatTurn | undefined,
  answer: IAiChatMessage,
): ChatMessagePages | undefined => {
  if (!data) return data;
  const [first, ...rest] = data.pages;
  if (!first) return data;

  const items = first.items.filter(({ uid }) => uid !== answer.uid);
  const needsUser = turn?.message && !isSavedTurnMessage(items[0], turn);
  const user: IAiChatMessage[] = needsUser
    ? [
        {
          uid: `${turn.id}:user`,
          role: ChatMessageRole.user,
          content: turn.message.trim(),
          imageUrls: turn.imageUrls,
          skillCode: turn.skillCode,
          status: { id: ChatMessageStatus.completed, name: "" },
          errorMessage: "",
          toolCalls: [],
          createdAt: answer.createdAt,
        },
      ]
    : [];
  return { ...data, pages: [{ ...first, items: [answer, ...user, ...items] }, ...rest] };
};
