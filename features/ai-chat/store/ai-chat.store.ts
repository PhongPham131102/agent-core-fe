import { createStore } from "@/lib/store";

import { mergeSources, remoteTurn } from "../model/chat-turn";

import type { IChatTurn } from "../model/chat-turn";
import type { IChatToolCall, IKnowledgeSource } from "../types/ai-chat.types";

export const ChatConnection = {
  connecting: "connecting",
  connected: "connected",
  disconnected: "disconnected",
} as const;

export type ChatConnection = (typeof ChatConnection)[keyof typeof ChatConnection];

/** Số cuộc chat đã xong gần đây cần nhớ, để ghép với ack về muộn. */
const FINISHED_MEMORY = 20;

interface IAiChatState {
  isOpen: boolean;
  agentUid: string | null;
  /** null là đang ở cuộc chat mới. */
  threadUid: string | null;
  connection: ChatConnection;
  /**
   * Lượt đang chạy. Sự kiện socket không mang id lượt nên mỗi lượt gắn với một `threadUid`;
   * lượt của cuộc chat mới có `threadUid` null tới khi ack về.
   */
  turns: IChatTurn[];
  /** Cuộc chat vừa xong lượt mà chưa có lượt nào nhận (ack về sau sự kiện xong). */
  finishedThreadUids: string[];
  /** Tin đang soạn: giữ lại khi đóng popup hay đổi cuộc chat. */
  draft: string;
  /** `code` skill chọn cho tin tiếp theo; "" là để agent tự chọn. */
  skillCode: string;
  /** Lỗi gửi tin hay lượt lỗi không có tin, hiện thành banner trong khung chat. */
  chatError: string | null;
}

interface IAiChatActions {
  setOpen: (open: boolean) => void;
  /** Đổi agent thì về cuộc chat mới. */
  selectAgent: (agentUid: string) => void;
  selectThread: (threadUid: string | null) => void;
  setConnection: (connection: ChatConnection) => void;
  startTurn: (turn: Omit<IChatTurn, "content" | "steps" | "sources">) => void;
  /**
   * Ack trả `threadUid` cho lượt của cuộc chat mới: gộp với phần trả lời đã nhận trước ack
   * (nếu có), hoặc bỏ lượt nếu cuộc chat đó đã xong lượt rồi.
   */
  assignThread: (turnId: string, threadUid: string) => void;
  appendDelta: (threadUid: string, delta: string) => void;
  addStep: (threadUid: string, step: Omit<IChatToolCall, "isError">) => void;
  finishStep: (threadUid: string, call: IChatToolCall, sources: IKnowledgeSource[]) => void;
  /** Lượt của `threadUid` xong: bỏ và trả lại lượt đó (để ghi vào lịch sử). */
  finishTurn: (threadUid: string) => IChatTurn | undefined;
  removeTurn: (turnId: string) => void;
  /** Bỏ mọi lượt (đóng popup, mất kết nối: không còn nhận được sự kiện); trả về các lượt đã bỏ. */
  clearTurns: () => IChatTurn[];
  setDraft: (draft: string) => void;
  setSkillCode: (skillCode: string) => void;
  setChatError: (message: string | null) => void;
}

/** Cập nhật lượt của `threadUid`; chưa có (lượt ở tab khác, hay trước ack) thì mở lượt mới. */
const withTurn = (
  turns: IChatTurn[],
  threadUid: string,
  update: (turn: IChatTurn) => IChatTurn,
): IChatTurn[] =>
  turns.some((turn) => turn.threadUid === threadUid)
    ? turns.map((turn) => (turn.threadUid === threadUid ? update(turn) : turn))
    : [...turns, update(remoteTurn(threadUid))];

/** Trạng thái của popup chat và các lượt đang chạy; lịch sử tin nhắn nằm ở React Query. */
export const useAiChatStore = createStore<IAiChatState, IAiChatActions>({
  name: "ai-chat",
  initialState: {
    isOpen: false,
    agentUid: null,
    threadUid: null,
    connection: ChatConnection.connecting,
    turns: [],
    finishedThreadUids: [],
    draft: "",
    skillCode: "",
    chatError: null,
  },
  actions: (set, get) => ({
    setOpen: (isOpen) => set({ isOpen }, false, "setOpen"),
    // Skill thuộc từng agent: đổi agent thì bỏ skill đã chọn.
    selectAgent: (agentUid) =>
      set({ agentUid, threadUid: null, skillCode: "", chatError: null }, false, "selectAgent"),
    selectThread: (threadUid) => set({ threadUid, chatError: null }, false, "selectThread"),
    setConnection: (connection) => set({ connection }, false, "setConnection"),
    startTurn: (turn) =>
      set(
        (state) => ({ turns: [...state.turns, { ...turn, content: "", steps: [], sources: [] }] }),
        false,
        "startTurn",
      ),
    assignThread: (turnId, threadUid) =>
      set(
        (state) => {
          if (state.finishedThreadUids.includes(threadUid)) {
            return {
              turns: state.turns.filter(({ id }) => id !== turnId),
              finishedThreadUids: state.finishedThreadUids.filter((uid) => uid !== threadUid),
            };
          }
          const early = state.turns.find((turn) => turn.threadUid === threadUid);
          return {
            turns: state.turns
              .filter((turn) => turn !== early)
              .map((turn) =>
                turn.id === turnId
                  ? {
                      ...turn,
                      threadUid,
                      ...(early && {
                        content: early.content,
                        steps: early.steps,
                        sources: early.sources,
                      }),
                    }
                  : turn,
              ),
          };
        },
        false,
        "assignThread",
      ),
    appendDelta: (threadUid, delta) =>
      set(
        (state) => ({
          turns: withTurn(state.turns, threadUid, (turn) => ({
            ...turn,
            content: turn.content + delta,
          })),
        }),
        false,
        "appendDelta",
      ),
    addStep: (threadUid, step) =>
      set(
        (state) => ({
          turns: withTurn(state.turns, threadUid, (turn) => ({
            ...turn,
            steps: [...turn.steps, { ...step, done: false, isError: false }],
          })),
        }),
        false,
        "addStep",
      ),
    finishStep: (threadUid, call, sources) =>
      set(
        (state) => ({
          turns: withTurn(state.turns, threadUid, (turn) => ({
            ...turn,
            steps: turn.steps.map((step) =>
              step.toolCallId === call.toolCallId
                ? { ...step, done: true, isError: call.isError }
                : step,
            ),
            sources: mergeSources(turn.sources, sources),
          })),
        }),
        false,
        "finishStep",
      ),
    finishTurn: (threadUid) => {
      const turn = get().turns.find((item) => item.threadUid === threadUid);
      set(
        (state) =>
          turn
            ? { turns: state.turns.filter((item) => item !== turn) }
            : {
                finishedThreadUids: [threadUid, ...state.finishedThreadUids].slice(
                  0,
                  FINISHED_MEMORY,
                ),
              },
        false,
        "finishTurn",
      );
      return turn;
    },
    removeTurn: (turnId) =>
      set(
        (state) => ({ turns: state.turns.filter(({ id }) => id !== turnId) }),
        false,
        "removeTurn",
      ),
    clearTurns: () => {
      const { turns } = get();
      set({ turns: [] }, false, "clearTurns");
      return turns;
    },
    setDraft: (draft) => set({ draft }, false, "setDraft"),
    setSkillCode: (skillCode) => set({ skillCode }, false, "setSkillCode"),
    setChatError: (chatError) => set({ chatError }, false, "setChatError"),
  }),
});
