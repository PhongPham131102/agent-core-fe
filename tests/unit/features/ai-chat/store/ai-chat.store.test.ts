import { afterEach, describe, expect, it } from "vitest";

import { useAiChatStore } from "@/features/ai-chat/store/ai-chat.store";
import { AGENT_UID, THREAD_UID } from "@/tests/support/ai-chat-fixtures";

const OTHER_THREAD = "99999999-9999-4999-8999-999999999999";
const store = () => useAiChatStore.getState();
const newTurn = {
  id: "t1",
  agentUid: AGENT_UID,
  threadUid: null,
  message: "Hi",
  imageUrls: [],
  skillCode: "",
};

afterEach(() =>
  useAiChatStore.setState({ turns: [], finishedThreadUids: [], agentUid: null, threadUid: null }),
);

describe("useAiChatStore", () => {
  it("sự kiện tới trước ack được giữ riêng, ack về thì gộp vào lượt đang chờ", () => {
    store().startTurn(newTurn);
    store().appendDelta(THREAD_UID, "Chào");
    store().assignThread("t1", THREAD_UID);

    expect(store().turns).toEqual([
      expect.objectContaining({ id: "t1", threadUid: THREAD_UID, message: "Hi", content: "Chào" }),
    ]);
  });

  it("cuộc chat mới ở tab khác không bị gộp nhầm vào lượt đang chờ ack của tab này", () => {
    store().startTurn(newTurn);
    store().appendDelta(OTHER_THREAD, "của tab khác");
    store().assignThread("t1", THREAD_UID);

    expect(store().turns).toHaveLength(2);
    expect(store().turns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: OTHER_THREAD, threadUid: OTHER_THREAD, message: "" }),
        expect.objectContaining({ id: "t1", threadUid: THREAD_UID, content: "" }),
      ]),
    );
  });

  it("lượt đã xong trước khi ack về thì ack về sẽ bỏ lượt, không treo", () => {
    store().startTurn(newTurn);
    store().appendDelta(THREAD_UID, "Chào");
    expect(store().finishTurn(THREAD_UID)?.content).toBe("Chào");

    store().finishTurn(THREAD_UID);
    store().assignThread("t1", THREAD_UID);

    expect(store().turns).toEqual([]);
  });

  it("ghép bước tool với kết quả qua toolCallId, gộp nguồn trùng", () => {
    const call = { toolCallId: "c1", toolName: "search_knowledge", label: "Searching..." };
    const source = { documentUid: "d1", fileName: "a.md", chunkIndex: 0, score: 0.9 };
    store().startTurn({ ...newTurn, threadUid: THREAD_UID });

    store().addStep(THREAD_UID, call);
    store().finishStep(THREAD_UID, { ...call, isError: false }, [source, source]);

    expect(store().turns[0]).toMatchObject({
      steps: [{ ...call, done: true, isError: false }],
      sources: [source],
    });
  });

  it("đổi agent thì về cuộc chat mới và bỏ skill đã chọn", () => {
    useAiChatStore.setState({ threadUid: THREAD_UID, skillCode: "tra-cuu" });
    store().selectAgent(AGENT_UID);

    expect(store()).toMatchObject({ threadUid: null, skillCode: "" });
  });
});
