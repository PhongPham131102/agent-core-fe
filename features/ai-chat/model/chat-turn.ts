import type { IChatToolCall, IKnowledgeSource } from "../types/ai-chat.types";

/** Một lần gọi tool trong lượt đang chạy. */
export interface IChatTurnStep extends Omit<IChatToolCall, "isError"> {
  done: boolean;
  isError: boolean;
}

/**
 * Lượt chat đang chạy ở tab này: tin vừa gửi và phần trả lời đang nhận qua socket.
 * Lượt xong thì tin đã lưu thay vào cache lịch sử và lượt bị bỏ.
 */
export interface IChatTurn {
  /** Id phía client, có ngay khi bấm gửi. */
  id: string;
  agentUid: string;
  /** null khi là cuộc chat mới, chưa có ack. */
  threadUid: string | null;
  /** Tin người dùng; "" nếu lượt được bắt đầu từ tab khác. */
  message: string;
  imageUrls: string[];
  skillCode: string;
  content: string;
  steps: IChatTurnStep[];
  sources: IKnowledgeSource[];
}

/** Lượt chỉ có phần trả lời: dựng từ sự kiện của cuộc chat chưa có lượt nào ở tab này. */
export const remoteTurn = (threadUid: string): IChatTurn => ({
  id: threadUid,
  agentUid: "",
  threadUid,
  message: "",
  imageUrls: [],
  skillCode: "",
  content: "",
  steps: [],
  sources: [],
});

const sameSource = (a: IKnowledgeSource, b: IKnowledgeSource) =>
  a.documentUid === b.documentUid && a.chunkIndex === b.chunkIndex;

/** Thêm nguồn mới, bỏ đoạn đã có (kể cả trùng nhau trong cùng lượt gửi tới). */
export const mergeSources = (current: IKnowledgeSource[], incoming: IKnowledgeSource[]) =>
  incoming.reduce(
    (merged, source) => (merged.some((s) => sameSource(s, source)) ? merged : [...merged, source]),
    current,
  );
