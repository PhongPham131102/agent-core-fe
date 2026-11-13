"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { ApiError } from "@/lib/http";

import { aiChatKeys } from "../api/ai-chat.keys";
import { ChatEvent } from "../socket/chat-events";
import { getChatSocket } from "../socket/chat-socket";
import { useAiChatStore } from "../store/ai-chat.store";

import type { ChatAck, ISendChatPayload } from "../socket/chat-events";

const ACK_TIMEOUT_MS = 15_000;

/**
 * Gửi tin: hiện ngay (lượt mới trong store) rồi chờ ack. Cuộc chat mới thì ack trả
 * `threadUid` để mở cuộc chat đó. Ack bị từ chối thì bỏ lượt và ném `ApiError` để nơi gọi
 * báo lỗi và giữ lại chữ.
 */
export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useCallback(
    async ({ imageUrls = [], skillCode = "", ...payload }: ISendChatPayload) => {
      const store = useAiChatStore.getState();
      const turnId = crypto.randomUUID();
      store.startTurn({
        id: turnId,
        agentUid: payload.agentUid,
        threadUid: payload.threadUid ?? null,
        message: payload.message,
        imageUrls,
        skillCode,
      });

      try {
        const ack: ChatAck<{ threadUid: string }> = await getChatSocket()
          .timeout(ACK_TIMEOUT_MS)
          .emitWithAck(ChatEvent.send, {
            ...payload,
            imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
            skillCode: skillCode || undefined,
          });
        if (!ack.accepted) throw new ApiError(0, ack.code, ack.message);

        if (!payload.threadUid) {
          store.assignThread(turnId, ack.threadUid);
          // Vẫn đang ở cuộc chat mới của agent đó thì mở cuộc chat vừa tạo.
          const { agentUid, threadUid } = useAiChatStore.getState();
          if (agentUid === payload.agentUid && threadUid === null)
            store.selectThread(ack.threadUid);
          void queryClient.invalidateQueries({ queryKey: aiChatKeys.threads() });
        }
      } catch (error) {
        store.removeTurn(turnId);
        throw error;
      }
    },
    [queryClient],
  );
};
