import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import "@/features/ai-mcp-servers/errors";
import { AiMcpServerFormModal } from "@/features/ai-mcp-servers/components/form/ai-mcp-server-form-modal";
import { getQueryClient } from "@/lib/query";
import { buildAiMcpServer } from "@/tests/support/ai-fixtures";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

import type { IAiMcpServer } from "@/features/ai-mcp-servers/types/ai-mcp-server.types";

const mcpServer = buildAiMcpServer();

const captureBodies = (method: "post" | "patch", url: string) => {
  const bodies: unknown[] = [];
  server.use(
    mswHttp[method](apiUrl(url), async ({ request }) => {
      bodies.push(await request.json());
      return apiOk(mcpServer);
    }),
  );
  return bodies;
};

const renderForm = (record?: IAiMcpServer) => {
  const onClose = vi.fn();
  renderWithProviders(<AiMcpServerFormModal open server={record} onClose={onClose} />);
  return onClose;
};

afterEach(() => getQueryClient().clear());

describe("AiMcpServerFormModal", () => {
  it("thêm server kèm header rồi đóng", async () => {
    const bodies = captureBodies("post", "/ai-mcp-servers");
    const onClose = renderForm();

    await userEvent.type(screen.getByLabelText("Tên"), "CRM");
    await userEvent.type(screen.getByLabelText("Mã"), "crm");
    await userEvent.type(screen.getByLabelText("URL"), "https://crm.test/mcp");
    await userEvent.click(screen.getByRole("button", { name: /Thêm header/ }));
    await userEvent.type(screen.getByLabelText("Tên header"), "Authorization");
    await userEvent.type(screen.getByLabelText("Giá trị header"), "Bearer xyz");
    // Lỗi của dòng trống lúc vừa thêm không được treo lại ở cấp danh sách.
    await waitFor(() =>
      expect(screen.queryByText("Vui lòng nhập tên header")).not.toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: "Thêm server" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toEqual([
      {
        code: "crm",
        name: "CRM",
        url: "https://crm.test/mcp",
        headers: [{ key: "Authorization", value: "Bearer xyz" }],
      },
    ]);
  });

  it("mã trùng thì báo lỗi ngay dưới ô mã", async () => {
    server.use(mswHttp.post(apiUrl("/ai-mcp-servers"), () => apiError(409, "ERR_3101")));
    const onClose = renderForm();

    await userEvent.type(screen.getByLabelText("Tên"), "CRM");
    await userEvent.type(screen.getByLabelText("Mã"), "crm");
    await userEvent.type(screen.getByLabelText("URL"), "https://crm.test/mcp");
    await userEvent.click(screen.getByRole("button", { name: "Thêm server" }));

    expect(await screen.findAllByText("Mã này đã được dùng")).not.toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("sửa: khoá ô mã, không đổi gì thì đóng luôn", async () => {
    const bodies = captureBodies("patch", `/ai-mcp-servers/${mcpServer.uid}`);
    const onClose = renderForm(mcpServer);

    expect(screen.getByLabelText("Mã")).toBeDisabled();
    expect(screen.getByLabelText("Giá trị header")).toHaveValue("***abcd");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(bodies).toEqual([]);
  });

  it("sửa URL thì chỉ gửi URL", async () => {
    const bodies = captureBodies("patch", `/ai-mcp-servers/${mcpServer.uid}`);
    renderForm(mcpServer);

    const url = screen.getByLabelText("URL");
    await userEvent.clear(url);
    await userEvent.type(url, "https://new.test/mcp");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(bodies).toEqual([{ url: "https://new.test/mcp" }]));
  });
});
