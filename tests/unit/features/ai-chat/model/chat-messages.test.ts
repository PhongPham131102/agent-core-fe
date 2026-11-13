import { describe, expect, it } from "vitest";

import {
  addFinishedTurn,
  flattenMessages,
  toChatView,
} from "@/features/ai-chat/model/chat-messages";
import { buildChatMessage, buildChatTurn, pagesOf } from "@/tests/support/ai-chat-fixtures";

const user = buildChatMessage({ uid: "u1", role: "user", content: "Xin chào" });
const answer = buildChatMessage({ uid: "a1", content: "Chào bạn" });

describe("toChatView", () => {
  it("tin người dùng BE đã lưu thì không hiện lần nữa trong lượt đang chạy", () => {
    const view = toChatView([user], buildChatTurn({ content: "Chào" }));

    expect(view.map(({ key, content }) => [key, content])).toEqual([
      ["turn-1:assistant", "Chào"],
      ["turn-1:user", "Xin chào"],
    ]);
  });

  it("lượt từ tab khác (không có tin người dùng) chỉ thêm phần trả lời", () => {
    const view = toChatView([answer, user], buildChatTurn({ message: "", content: "..." }));

    expect(view.map(({ key }) => key)).toEqual(["turn-1:assistant", "a1", "u1"]);
  });

  it("tin bị dừng hiện trạng thái nhưng không coi lý do dừng là lỗi", () => {
    const [stopped] = toChatView([
      buildChatMessage({
        status: { id: "cancelled", name: "Stopped" },
        errorMessage: "Stopped by the user",
      }),
    ]);

    expect(stopped?.status?.name).toBe("Stopped");
    expect(stopped?.errorMessage).toBe("");
  });
});

describe("flattenMessages", () => {
  it("bỏ tin trùng giữa các trang", () => {
    const data = {
      pages: [pagesOf([answer, user]).pages[0]!, pagesOf([user]).pages[0]!],
      pageParams: [1, 2],
    };

    expect(flattenMessages(data).map(({ uid }) => uid)).toEqual(["a1", "u1"]);
  });
});

describe("addFinishedTurn", () => {
  it("cache đã có tin người dùng thì chỉ thêm tin trả lời", () => {
    const next = addFinishedTurn(pagesOf([user]), buildChatTurn(), answer);

    expect(flattenMessages(next).map(({ uid }) => uid)).toEqual(["a1", "u1"]);
  });

  it("cache chưa có tin người dùng thì thêm bản tạm kèm ảnh và skill", () => {
    const turn = buildChatTurn({ imageUrls: ["https://cdn.test/a.webp"], skillCode: "tra-cuu" });
    const [added, temp] = flattenMessages(addFinishedTurn(pagesOf([]), turn, answer));

    expect(added?.uid).toBe("a1");
    expect(temp).toMatchObject({
      role: "user",
      content: "Xin chào",
      imageUrls: ["https://cdn.test/a.webp"],
      skillCode: "tra-cuu",
    });
  });

  it("chưa tải lịch sử thì để nguyên, chờ tải lại", () => {
    expect(addFinishedTurn(undefined, buildChatTurn(), answer)).toBeUndefined();
  });
});
