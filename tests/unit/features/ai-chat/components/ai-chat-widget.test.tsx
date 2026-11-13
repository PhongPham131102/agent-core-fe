import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAiChatStore } from "@/features/ai-chat/store/ai-chat.store";
import { getQueryClient } from "@/lib/query";
import { AGENT_UID } from "@/tests/support/ai-chat-fixtures";
import { FakeSocket } from "@/tests/support/fake-socket";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

const fake = new FakeSocket();
vi.mock("@/lib/socket", () => ({ createAuthedSocket: () => fake }));

const { AiChatWidget } = await import("@/features/ai-chat");

const agentWith = (memoryEnabled: boolean) => ({
  uid: AGENT_UID,
  name: "Trợ lý bán hàng",
  description: "",
  memoryEnabled,
  skills: [],
});

const renderWidget = (memoryEnabled: boolean) => {
  server.use(
    mswHttp.get(apiUrl("/ai-chats/agents"), () => apiOk([agentWith(memoryEnabled)])),
    mswHttp.get(apiUrl("/ai-chats/threads"), () =>
      apiOk({ items: [], total: 0, page: 1, limit: 30 }),
    ),
  );
  renderWithProviders(<AiChatWidget />);
};

afterEach(() => {
  getQueryClient().clear();
  useAiChatStore.setState({ isOpen: false, agentUid: null, threadUid: null, turns: [] });
});

describe("AiChatWidget", () => {
  it("bấm nút nổi thì mở popup với agent đầu tiên và kết nối socket", async () => {
    renderWidget(true);

    await userEvent.click(screen.getByRole("button", { name: "Mở AI Chat" }));

    expect(await screen.findByText("Trợ lý bán hàng")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "AI Chat" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ghi nhớ" })).toBeInTheDocument();
    expect(fake.connect).toHaveBeenCalled();
  });

  it("agent không bật ghi nhớ thì không có nút ghi nhớ", async () => {
    renderWidget(false);

    await userEvent.click(screen.getByRole("button", { name: "Mở AI Chat" }));

    await screen.findByText("Trợ lý bán hàng");
    expect(screen.queryByRole("button", { name: "Ghi nhớ" })).not.toBeInTheDocument();
  });
});
