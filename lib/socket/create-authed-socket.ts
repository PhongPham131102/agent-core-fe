import { io } from "socket.io-client";

import { tokenHolder } from "@/lib/auth/token-holder";
import { env } from "@/lib/env";
import { renewAccessToken } from "@/lib/http";

import type { Socket } from "socket.io-client";

/** Lỗi BE trả khi token sai hoặc hết hạn lúc kết nối. */
const UNAUTHORIZED = "Unauthorized";

/**
 * Socket.IO tới một namespace của BE, xác thực bằng access token đang giữ trong bộ nhớ.
 * BE chỉ kiểm tra token lúc kết nối: bị từ chối vì token hết hạn thì refresh rồi kết nối
 * lại một lần. Tạo ở trạng thái chưa kết nối; nơi dùng gọi `connect()`/`disconnect()`.
 */
export const createAuthedSocket = (namespace: string): Socket => {
  // Socket nối vào gốc của BE, không nằm dưới tiền tố /api của REST.
  const socket = io(`${new URL(env.apiUrl).origin}/${namespace}`, {
    transports: ["websocket"],
    autoConnect: false,
    // Hàm được gọi lại mỗi lần (tái) kết nối nên luôn lấy token mới nhất.
    auth: (callback) => callback({ token: tokenHolder.get() }),
  });

  let renewed = false;
  socket.on("connect", () => {
    renewed = false;
  });
  socket.on("connect_error", ({ message }) => {
    if (message !== UNAUTHORIZED || renewed) return;
    renewed = true;
    renewAccessToken()
      .then(() => socket.connect())
      // Hết phiên: renewAccessToken đã báo để đăng xuất.
      .catch(() => undefined);
  });

  return socket;
};
