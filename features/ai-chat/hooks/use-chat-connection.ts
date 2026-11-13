"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { aiChatKeys } from "../api/ai-chat.keys";
import { addFinishedTurn } from "../model/chat-messages";
import { ChatEvent } from "../socket/chat-events";
import { getChatSocket } from "../socket/chat-socket";
import { ChatConnection, useAiChatStore } from "../store/ai-chat.store";

import type { ChatMessagePages } from "../model/chat-messages";
import type {
  IChatChunkEvent,
  IChatDoneEvent,
  IChatErrorEvent,
  IChatStepEvent,
  IChatToolResultEvent,
} from "../socket/chat-events";

const NO_RESPONSE_MESSAGE = "Không nhận được phản hồi từ máy chủ, vui lòng thử lại.";

/**
 * Giữ kết nối socket chat khi `enabled` (popup đang mở) và đưa sự kiện vào store.
 * Lượt xong: ghi tin đã lưu vào cache lịch sử rồi bỏ lượt, sau đó tải lại nền.
 * Đóng popup hay mất kết nối thì không còn nhận được sự kiện: bỏ mọi lượt đang chạy và đọc
 * lại lịch sử qua REST, để khung chat không kẹt ở trạng thái "đang trả lời".
 */
export const useChatConnection = (enabled: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const socket = getChatSocket();
    const store = useAiChatStore.getState();

    const refreshThreads = (threadUids: (string | null)[]) => {
      for (const threadUid of threadUids) {
        if (threadUid)
          void queryClient.invalidateQueries({ queryKey: aiChatKeys.messages(threadUid) });
      }
      void queryClient.invalidateQueries({ queryKey: aiChatKeys.threads() });
    };

    const dropTurns = () => refreshThreads(store.clearTurns().map(({ threadUid }) => threadUid));

    const finish = ({ threadUid, message }: IChatDoneEvent | IChatErrorEvent) => {
      const turn = store.finishTurn(threadUid);
      // BE không lưu được tin trả lời thì tin có uid rỗng và không có trong lịch sử:
      // không ghi vào cache (tải lại sẽ mất), báo lý do bằng banner.
      const saved = message?.uid ? message : undefined;
      if (saved) {
        queryClient.setQueryData<ChatMessagePages>(aiChatKeys.messages(threadUid), (data) =>
          addFinishedTurn(data, turn, saved),
        );
      }
      // Chỉ báo khi là tin của tab này, ở cuộc trò chuyện đang mở.
      const ownTurn = Boolean(turn?.message);
      if (!saved && ownTurn && useAiChatStore.getState().threadUid === threadUid) {
        store.setChatError(message?.errorMessage || NO_RESPONSE_MESSAGE);
      }
      refreshThreads([threadUid]);
    };

    const handlers = {
      connect: () => store.setConnection(ChatConnection.connected),
      connect_error: () => store.setConnection(ChatConnection.disconnected),
      disconnect: () => {
        store.setConnection(ChatConnection.disconnected);
        dropTurns();
      },
      [ChatEvent.chunk]: ({ threadUid, delta }: IChatChunkEvent) =>
        store.appendDelta(threadUid, delta),
      [ChatEvent.step]: ({ threadUid, ...step }: IChatStepEvent) => store.addStep(threadUid, step),
      [ChatEvent.toolResult]: ({ threadUid, artifact, ...call }: IChatToolResultEvent) =>
        store.finishStep(threadUid, call, artifact?.sources ?? []),
      [ChatEvent.done]: finish,
      [ChatEvent.error]: finish,
    };

    store.setConnection(ChatConnection.connecting);
    for (const [event, handler] of Object.entries(handlers)) socket.on(event, handler);
    socket.connect();

    return () => {
      for (const [event, handler] of Object.entries(handlers)) socket.off(event, handler);
      socket.disconnect();
      dropTurns();
      store.setConnection(ChatConnection.connecting);
    };
  }, [enabled, queryClient]);
};
