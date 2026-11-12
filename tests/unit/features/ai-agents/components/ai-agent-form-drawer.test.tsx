import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/features/ai-agents/errors";
import { AiAgentFormDrawer } from "@/features/ai-agents/components/ai-agent-form-drawer";
import { authKeys } from "@/features/auth";
import { getQueryClient } from "@/lib/query";
import { buildAiAgent } from "@/tests/support/ai-fixtures";
import { buildAuthUser } from "@/tests/support/fixtures";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

import type { IAiAgent } from "@/features/ai-agents/types/ai-agent.types";

const agent = buildAiAgent();

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

/** Ghi lại body của request ghi để kiểm tra FE gửi đúng những gì. */
const captureBodies = (method: "post" | "patch", url: string) => {
  const bodies: unknown[] = [];
  server.use(
    mswHttp[method](apiUrl(url), async ({ request }) => {
      bodies.push(await request.json());
      return apiOk(agent);
    }),
  );
  return bodies;
};

const renderDrawer = (props: { agent?: IAiAgent; permissions?: string[] } = {}) => {
  getQueryClient().setQueryData(
    authKeys.me(),
    buildAuthUser({ permissions: props.permissions ?? ["ai-agent:create", "ai-agent:update"] }),
  );
  const onClose = vi.fn();
  renderWithProviders(<AiAgentFormDrawer open agent={props.agent} onClose={onClose} />);
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
    mswHttp.get(apiUrl("/ai-skills/options"), () =>
      apiOk([{ code: "tra-cuu", name: "Tra cứu đơn hàng", description: "", iconUrl: "" }]),
    ),
  );
});

afterEach(() => getQueryClient().clear());

describe("AiAgentFormDrawer: thêm mới", () => {
  it("gửi mặc định của BE kèm field đã nhập rồi đóng drawer", async () => {
    const bodies = captureBodies("post", "/ai-agents");
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

  it("trùng tên agent khác (BE tạo trùng mã) thì báo lỗi ngay dưới ô tên", async () => {
    server.use(mswHttp.post(apiUrl("/ai-agents"), () => apiError(409, "ERR_2501")));
    const onClose = renderDrawer();

    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Tạo agent" }));

    expect(await screen.findAllByText("Đã có agent khác trùng tên này")).not.toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("gửi code của skill đã chọn", async () => {
    const bodies = captureBodies("post", "/ai-agents");
    renderDrawer();

    await fillRequired();
    await pick(/^Skill$/, "Tra cứu đơn hàng");
    await userEvent.click(screen.getByRole("button", { name: "Tạo agent" }));

    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toMatchObject({ skillCodes: ["tra-cuu"] });
  });

  it("skill không còn tồn tại thì báo lỗi ngay dưới ô skill", async () => {
    server.use(mswHttp.post(apiUrl("/ai-agents"), () => apiError(400, "ERR_2503")));
    renderDrawer();

    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: "Tạo agent" }));

    expect(
      await screen.findAllByText("Có skill không còn tồn tại, vui lòng chọn lại"),
    ).not.toHaveLength(0);
  });

  it("chọn nhà cung cấp rồi mới chọn được model", async () => {
    renderDrawer();

    expect(screen.getByRole("combobox", { name: /^Model$/ })).toBeDisabled();
    await pick(/Nhà cung cấp/, "OpenAI");

    expect(screen.getByRole("combobox", { name: /^Model$/ })).toBeEnabled();
  });
});

describe("AiAgentFormDrawer: sửa", () => {
  it("không đổi gì thì đóng luôn, không gửi request", async () => {
    const bodies = captureBodies("patch", `/ai-agents/${agent.uid}`);
    const onClose = renderDrawer({ agent });

    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toEqual([]);
  });

  it("chỉ gửi field đã đổi", async () => {
    const bodies = captureBodies("patch", `/ai-agents/${agent.uid}`);
    renderDrawer({ agent });

    const name = screen.getByLabelText(/Tên agent/);
    await userEvent.clear(name);
    await userEvent.type(name, "Tư vấn");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(bodies).toEqual([{ name: "Tư vấn" }]));
  });

  it("không có quyền sửa thì chỉ xem, không có nút lưu", () => {
    renderDrawer({ agent, permissions: ["ai-agent:read"] });

    expect(screen.getByLabelText(/Tên agent/)).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Lưu thay đổi" })).not.toBeInTheDocument();
  });
});
