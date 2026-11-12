import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/features/ai-agents/errors";
import { AiAgentCreateDrawer } from "@/features/ai-agents/components/ai-agent-create-drawer";
import { getQueryClient } from "@/lib/query";
import { buildAiAgent } from "@/tests/support/ai-fixtures";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

/** Chọn một mục trong ô chọn có nhãn `label`. */
const pick = async (label: RegExp, option: string) => {
  await userEvent.click(screen.getByRole("combobox", { name: label }));
  await userEvent.click(await screen.findByTitle(option));
};

const fillRequired = async () => {
  await pick(/Nhà cung cấp/, "OpenAI");
  await userEvent.type(screen.getByLabelText(/Tên agent/), "Trợ lý bán hàng");
  await userEvent.type(screen.getByLabelText("Chỉ dẫn hệ thống"), "Bạn là trợ lý.");
  await pick(/^Model$/, "GPT-4o");
};

const renderDrawer = () => {
  const onClose = vi.fn();
  renderWithProviders(<AiAgentCreateDrawer open onClose={onClose} />);
  return onClose;
};

beforeEach(() => {
  server.use(
    mswHttp.get(apiUrl("/ai-api-keys/providers"), () => apiOk([{ id: "openai", name: "OpenAI" }])),
    mswHttp.get(apiUrl("/ai-api-keys/models/openai"), () =>
      apiOk([
        { id: "gpt-4o", name: "GPT-4o" },
        { id: "gpt-4o-mini", name: "GPT-4o mini" },
      ]),
    ),
    mswHttp.get(apiUrl("/ai-agents/reasoning-efforts"), () => apiOk([{ id: "low", name: "Low" }])),
  );
});

afterEach(() => getQueryClient().clear());

describe("AiAgentCreateDrawer", () => {
  it("tạo agent với mặc định của BE rồi đóng drawer", async () => {
    const bodies: unknown[] = [];
    server.use(
      mswHttp.post(apiUrl("/ai-agents"), async ({ request }) => {
        bodies.push(await request.json());
        return apiOk(buildAiAgent());
      }),
    );
    const onClose = renderDrawer();

    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Tạo agent" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toEqual([
      {
        name: "Trợ lý bán hàng",
        provider: "openai",
        model: "gpt-4o",
        systemPrompt: "Bạn là trợ lý.",
        temperature: 0.7,
        maxOutputTokens: 4096,
        maxSteps: 8,
        historyTurnLimit: 10,
        isActive: true,
      },
    ]);
  });

  it("mã đã có agent khác dùng thì báo lỗi ngay dưới ô mã", async () => {
    server.use(mswHttp.post(apiUrl("/ai-agents"), () => apiError(409, "ERR_2501")));
    const onClose = renderDrawer();

    await fillRequired();
    await userEvent.type(screen.getByLabelText("Mã"), "ban-hang");
    await userEvent.click(screen.getByRole("button", { name: "Tạo agent" }));

    expect(await screen.findAllByText("Mã agent đã được sử dụng")).not.toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("chọn nhà cung cấp rồi mới chọn được model", async () => {
    renderDrawer();

    expect(screen.getByRole("combobox", { name: /^Model$/ })).toBeDisabled();
    await pick(/Nhà cung cấp/, "OpenAI");

    expect(screen.getByRole("combobox", { name: /^Model$/ })).toBeEnabled();
  });
});
