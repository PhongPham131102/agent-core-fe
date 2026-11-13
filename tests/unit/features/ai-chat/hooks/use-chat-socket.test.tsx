import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { aiChatKeys } from "@/features/ai-chat/api/ai-chat.keys";
import { flattenMessages } from "@/features/ai-chat/model/chat-messages";
import { useAiChatStore } from "@/features/ai-chat/store/ai-chat.store";
import { getQueryClient } from "@/lib/query";
import { AGENT_UID, buildChatMessage, pagesOf, THREAD_UID } from "@/tests/support/ai-chat-fixtures";
import { FakeSocket } from "@/tests/support/fake-socket";

import type { ChatMessagePages } from "@/features/ai-chat/model/chat-messages";
import type { ReactNode } from "react";

const fake = new FakeSocket();
vi.mock("@/lib/socket", () => ({ createAuthedSocket: () => fake }));

const { useChatConnection } = await import("@/features/ai-chat/hooks/use-chat-connection");
const { useSendChatMessage } = await import("@/features/ai-chat/hooks/use-send-chat-message");

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>
);

afterEach(() => {
  getQueryClient().clear();
  useAiChatStore.setState({
    turns: [],
    finishedThreadUids: [],
    agentUid: null,
    threadUid: null,
    chatError: null,
  });
  fake.handlers.clear();
  fake.ackFor = () => ({ accepted: true });
  vi.clearAllMocks();
});

describe("useChatConnection", () => {
  it("chỉ kết nối khi popup mở, đóng thì ngắt", () => {
    const { rerender } = renderHook(({ open }) => useChatConnection(open), {
      wrapper,
      initialProps: { open: false },
    });
    expect(fake.connect).not.toHaveBeenCalled();

    rerender({ open: true });
    expect(fake.connect).toHaveBeenCalled();

    rerender({ open: false });
    expect(fake.disconnect).toHaveBeenCalled();
  });

  it("lượt xong: ghi tin đã lưu vào lịch sử rồi bỏ lượt, không trùng tin", () => {
    const user = buildChatMessage({ uid: "u1", role: "user", content: "Xin chào" });
    getQueryClient().setQueryData(aiChatKeys.messages(THREAD_UID), pagesOf([user]));
    useAiChatStore.getState().startTurn({
      id: "t1",
      agentUid: AGENT_UID,
      threadUid: THREAD_UID,
      message: "Xin chào",
      imageUrls: [],
      skillCode: "",
    });
    renderHook(() => useChatConnection(true), { wrapper });

    act(() => {
      fake.serverEmit("ai:chat:chunk", { threadUid: THREAD_UID, delta: "Chào bạn" });
      fake.serverEmit("ai:chat:done", {
        threadUid: THREAD_UID,
        message: buildChatMessage({ uid: "a1", content: "Chào bạn" }),
      });
    });

    const cached = getQueryClient().getQueryData<ChatMessagePages>(aiChatKeys.messages(THREAD_UID));
    expect(flattenMessages(cached).map(({ uid }) => uid)).toEqual(["a1", "u1"]);
    expect(useAiChatStore.getState().turns).toEqual([]);
  });

  it("đóng popup giữa lượt thì bỏ lượt đang chạy, không kẹt ở trạng thái đang trả lời", () => {
    useAiChatStore.getState().startTurn({
      id: "t1",
      agentUid: AGENT_UID,
      threadUid: THREAD_UID,
      message: "Xin chào",
      imageUrls: [],
      skillCode: "",
    });
    const { rerender } = renderHook(({ open }) => useChatConnection(open), {
      wrapper,
      initialProps: { open: true },
    });

    rerender({ open: false });

    expect(useAiChatStore.getState().turns).toEqual([]);
  });

  it("mất kết nối thì bỏ lượt và báo trạng thái mất kết nối", () => {
    useAiChatStore.getState().startTurn({
      id: "t1",
      agentUid: AGENT_UID,
      threadUid: THREAD_UID,
      message: "Xin chào",
      imageUrls: [],
      skillCode: "",
    });
    renderHook(() => useChatConnection(true), { wrapper });

    act(() => fake.serverEmit("disconnect"));

    expect(useAiChatStore.getState()).toMatchObject({ connection: "disconnected", turns: [] });
  });

  it("lượt lỗi không có tin chỉ báo banner ở đúng cuộc chat đang mở", () => {
    useAiChatStore.setState({ threadUid: "khac" });
    useAiChatStore.getState().startTurn({
      id: "t1",
      agentUid: AGENT_UID,
      threadUid: THREAD_UID,
      message: "Xin chào",
      imageUrls: [],
      skillCode: "",
    });
    renderHook(() => useChatConnection(true), { wrapper });

    act(() => fake.serverEmit("ai:chat:error", { threadUid: THREAD_UID }));
    expect(useAiChatStore.getState().chatError).toBeNull();

    useAiChatStore.setState({ threadUid: THREAD_UID });
    useAiChatStore.getState().startTurn({
      id: "t2",
      agentUid: AGENT_UID,
      threadUid: THREAD_UID,
      message: "Lần nữa",
      imageUrls: [],
      skillCode: "",
    });
    act(() => fake.serverEmit("ai:chat:error", { threadUid: THREAD_UID }));
    expect(useAiChatStore.getState().chatError).toBe(
      "Không nhận được phản hồi từ máy chủ, vui lòng thử lại.",
    );
  });
});

describe("useChatConnection: tin trả lời không lưu được", () => {
  it("không ghi vào lịch sử, báo lý do BE gửi bằng banner", () => {
    const user = buildChatMessage({ uid: "u1", role: "user", content: "Xin chào" });
    getQueryClient().setQueryData(aiChatKeys.messages(THREAD_UID), pagesOf([user]));
    useAiChatStore.setState({ threadUid: THREAD_UID });
    useAiChatStore.getState().startTurn({
      id: "t1",
      agentUid: AGENT_UID,
      threadUid: THREAD_UID,
      message: "Xin chào",
      imageUrls: [],
      skillCode: "",
    });
    renderHook(() => useChatConnection(true), { wrapper });

    act(() =>
      fake.serverEmit("ai:chat:error", {
        threadUid: THREAD_UID,
        message: buildChatMessage({
          uid: "",
          status: { id: "failed", name: "Failed" },
          errorMessage: "The agent took too long to answer",
        }),
      }),
    );

    const cached = getQueryClient().getQueryData<ChatMessagePages>(aiChatKeys.messages(THREAD_UID));
    expect(flattenMessages(cached).map(({ uid }) => uid)).toEqual(["u1"]);
    expect(useAiChatStore.getState().chatError).toBe("The agent took too long to answer");
  });
});

describe("useSendChatMessage", () => {
  it("hiện tin ngay; cuộc chat mới thì mở cuộc chat ack trả về", async () => {
    useAiChatStore.setState({ agentUid: AGENT_UID, threadUid: null });
    fake.ackFor = () => {
      expect(useAiChatStore.getState().turns).toHaveLength(1);
      return { accepted: true, threadUid: THREAD_UID };
    };
    const { result } = renderHook(() => useSendChatMessage(), { wrapper });

    await act(() =>
      result.current({
        agentUid: AGENT_UID,
        message: "Hi",
        imageUrls: ["https://cdn.test/a.webp"],
      }),
    );

    expect(useAiChatStore.getState()).toMatchObject({
      threadUid: THREAD_UID,
      turns: [{ threadUid: THREAD_UID, imageUrls: ["https://cdn.test/a.webp"] }],
    });
  });

  it("ack bị từ chối thì bỏ lượt và ném lỗi mang mã của BE", async () => {
    fake.ackFor = () => ({ accepted: false, code: "ERR_3002", message: "no skill" });
    const { result } = renderHook(() => useSendChatMessage(), { wrapper });

    await expect(
      result.current({ agentUid: AGENT_UID, threadUid: THREAD_UID, message: "Hi", skillCode: "x" }),
    ).rejects.toMatchObject({ code: "ERR_3002" });
    expect(useAiChatStore.getState().turns).toEqual([]);
  });
});
