import { createAuthedSocket } from "@/lib/socket";

import { CHAT_NAMESPACE, ChatEvent } from "./chat-events";

import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Một socket chat cho cả app, tạo khi cần lần đầu; mở/đóng do popup chat quyết định. */
export const getChatSocket = () => {
  socket ??= createAuthedSocket(CHAT_NAMESPACE);
  return socket;
};

/** Dừng lượt đang chạy của một cuộc chat. */
export const stopChatTurn = (threadUid: string) => {
  getChatSocket().emit(ChatEvent.stop, { threadUid });
};
