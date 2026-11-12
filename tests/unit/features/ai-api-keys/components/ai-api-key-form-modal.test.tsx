import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@/features/ai-api-keys/errors";
import { AiApiKeyFormModal } from "@/features/ai-api-keys/components/ai-api-key-form-modal";
import { getQueryClient } from "@/lib/query";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

import type { IAiApiKey } from "@/features/ai-api-keys/types/ai-api-key.types";

const KEY_UID = "33333333-3333-4333-8333-333333333333";
const OPENAI = { id: "openai", name: "OpenAI" };

const storedKey: IAiApiKey = {
  uid: KEY_UID,
  provider: OPENAI,
  secretKey: "***abcd",
  defaultModel: { id: "gpt-4o-mini", name: "GPT-4o mini" },
  usageCount: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

/** Ghi lại body của request ghi để kiểm tra chỉ gửi những gì đã đổi. */
const captureBodies = (method: "post" | "patch", url: string) => {
  const bodies: unknown[] = [];
  server.use(
    mswHttp[method](apiUrl(url), async ({ request }) => {
      bodies.push(await request.json());
      return apiOk(storedKey);
    }),
  );
  return bodies;
};

const renderForm = (apiKey?: IAiApiKey, usedProviders: string[] = []) => {
  const onClose = vi.fn();
  renderWithProviders(
    <AiApiKeyFormModal
      open
      apiKey={apiKey}
      providers={[OPENAI]}
      usedProviders={usedProviders}
      onClose={onClose}
    />,
  );
  return onClose;
};

/** Mở ô chọn model rồi bấm vào model có tên hiển thị `name`. */
const pickModel = async (name: string) => {
  await userEvent.click(screen.getByRole("combobox", { name: /Model mặc định/ }));
  await userEvent.click(await screen.findByTitle(name));
};

beforeEach(() => {
  server.use(
    mswHttp.get(apiUrl("/ai-api-keys/models/openai"), () =>
      apiOk([
        { id: "gpt-4o", name: "GPT-4o" },
        { id: "gpt-4o-mini", name: "GPT-4o mini" },
      ]),
    ),
  );
});

afterEach(() => getQueryClient().clear());

describe("AiApiKeyFormModal", () => {
  it("tạo key: gửi id nhà cung cấp và id model đã chọn", async () => {
    const bodies = captureBodies("post", "/ai-api-keys");
    const onClose = renderForm();

    await userEvent.type(screen.getByLabelText("API key"), "sk-test-1234");
    await pickModel("GPT-4o");
    await userEvent.click(screen.getByRole("button", { name: "Lưu API key" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toEqual([
      { provider: "openai", secretKey: "sk-test-1234", defaultModel: "gpt-4o" },
    ]);
  });

  it("sửa mà không đổi gì thì đóng luôn, không gửi request", async () => {
    const bodies = captureBodies("patch", `/ai-api-keys/${KEY_UID}`);
    const onClose = renderForm(storedKey);

    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toEqual([]);
  });

  it("để trống key thì chỉ gửi model đã đổi", async () => {
    const bodies = captureBodies("patch", `/ai-api-keys/${KEY_UID}`);
    renderForm(storedKey);

    await pickModel("GPT-4o");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(bodies).toEqual([{ defaultModel: "gpt-4o" }]));
  });

  it("nhập key mới thì gửi kèm key", async () => {
    const bodies = captureBodies("patch", `/ai-api-keys/${KEY_UID}`);
    renderForm(storedKey);

    await userEvent.type(screen.getByLabelText("API key"), "sk-new-key-1234");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(bodies).toEqual([{ secretKey: "sk-new-key-1234" }]));
  });

  it("model không thuộc danh mục thì báo lỗi ngay dưới ô model", async () => {
    server.use(mswHttp.patch(apiUrl(`/ai-api-keys/${KEY_UID}`), () => apiError(400, "ERR_2402")));
    const onClose = renderForm(storedKey);

    await pickModel("GPT-4o");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(
      await screen.findAllByText("Model này không có trong danh sách của nhà cung cấp"),
    ).not.toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("nhà cung cấp đã có key thì báo lỗi ngay dưới ô nhà cung cấp", async () => {
    server.use(mswHttp.post(apiUrl("/ai-api-keys"), () => apiError(409, "ERR_2401")));
    const onClose = renderForm();

    await userEvent.type(screen.getByLabelText("API key"), "sk-test-1234");
    await userEvent.click(screen.getByRole("button", { name: "Lưu API key" }));

    expect(await screen.findAllByText("Nhà cung cấp này đã có API key")).not.toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });
});
