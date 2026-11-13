import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/features/ai-chat/errors";
import { useAiChatStore } from "@/features/ai-chat/store/ai-chat.store";
import { ApiError } from "@/lib/http";
import { getQueryClient } from "@/lib/query";
import { AGENT_UID, THREAD_UID } from "@/tests/support/ai-chat-fixtures";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

const send = vi.fn();
vi.mock("@/features/ai-chat/hooks/use-send-chat-message", () => ({
  useSendChatMessage: () => send,
}));

const { ChatComposer } = await import("@/features/ai-chat/components/composer/chat-composer");

const agent = {
  uid: AGENT_UID,
  name: "Trợ lý",
  description: "",
  memoryEnabled: false,
  skills: [
    { code: "tra-cuu", name: "Tra cứu đơn", description: "Tìm đơn theo mã", iconUrl: "" },
    { code: "viet-mo-ta", name: "Viết mô tả", description: "", iconUrl: "" },
  ],
};

const renderComposer = (answering = false) =>
  renderWithProviders(<ChatComposer agent={agent} threadUid={THREAD_UID} answering={answering} />);
const input = () => screen.getByLabelText("Tin nhắn");

beforeEach(() =>
  useAiChatStore.setState({ connection: "connected", draft: "", skillCode: "", chatError: null }),
);
afterEach(() => {
  getQueryClient().clear();
  send.mockReset();
});

describe("ChatComposer", () => {
  it("chọn skill từ nút +, Enter gửi kèm skill rồi xoá ô soạn và chip skill", async () => {
    send.mockResolvedValue(undefined);
    renderComposer();

    await userEvent.click(screen.getByRole("button", { name: "Mở công cụ" }));
    await userEvent.click(screen.getByRole("button", { name: /Mở danh sách skill/ }));
    await userEvent.click(screen.getByRole("option", { name: /Tra cứu đơn/ }));
    expect(screen.getByTitle("Bỏ skill đã chọn")).toHaveTextContent("Tra cứu đơn");

    await userEvent.type(input(), "Đơn 123{Shift>}{Enter}{/Shift}ở đâu?");
    expect(send).not.toHaveBeenCalled();
    await userEvent.type(input(), "{Enter}");

    expect(send).toHaveBeenCalledWith({
      agentUid: AGENT_UID,
      threadUid: THREAD_UID,
      message: "Đơn 123\nở đâu?",
      skillCode: "tra-cuu",
      imageUrls: [],
    });
    expect(input()).toHaveValue("");
    expect(screen.queryByTitle("Bỏ skill đã chọn")).not.toBeInTheDocument();
  });

  it('gõ "/" lọc skill, Enter chọn skill khớp đầu tiên', async () => {
    renderComposer();

    await userEvent.type(input(), "/viet");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await userEvent.type(input(), "{Enter}");

    expect(useAiChatStore.getState().skillCode).toBe("viet-mo-ta");
    expect(input()).toHaveValue("");
    expect(send).not.toHaveBeenCalled();
  });

  it("đính kèm ảnh: tải lên rồi gửi URL; chỉ có ảnh thì dùng câu mặc định", async () => {
    send.mockResolvedValue(undefined);
    server.use(
      mswHttp.post(apiUrl("/uploads/images"), () =>
        apiOk({ uid: "i1", url: "https://cdn.test/a.webp" }),
      ),
    );
    renderComposer();

    const file = new File([new Uint8Array([1])], "a.png", { type: "image/png" });
    await userEvent.upload(document.querySelector<HTMLInputElement>('input[type="file"]')!, file);
    expect(await screen.findByRole("button", { name: "Bỏ ảnh đính kèm" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Hãy xem ảnh đính kèm.",
        imageUrls: ["https://cdn.test/a.webp"],
      }),
    );
  });

  it("gửi lỗi thì trả lại chữ, skill và báo lỗi bằng banner", async () => {
    send.mockRejectedValue(new ApiError(0, "ERR_3001", "busy"));
    useAiChatStore.setState({ skillCode: "tra-cuu" });
    renderComposer();

    await userEvent.type(input(), "Xin chào{Enter}");

    await waitFor(() => expect(input()).toHaveValue("Xin chào"));
    expect(useAiChatStore.getState()).toMatchObject({
      skillCode: "tra-cuu",
      chatError: "Agent vẫn đang trả lời trong cuộc chat này",
    });
  });

  it("agent đang trả lời thì có nút dừng thay cho nút gửi", () => {
    renderComposer(true);

    expect(screen.getByRole("button", { name: "Dừng" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gửi" })).not.toBeInTheDocument();
  });
});
