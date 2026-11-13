import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { McpToolsTable } from "@/features/ai-mcp-servers/components/tools/mcp-tools-table";
import { getQueryClient } from "@/lib/query";
import { buildAiMcpServer } from "@/tests/support/ai-fixtures";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

const mcpServer = buildAiMcpServer({ allowedWriteTools: [] });
const BASE = `/ai-mcp-servers/${mcpServer.uid}`;

beforeEach(() => {
  server.use(
    mswHttp.get(apiUrl(`${BASE}/tools`), () =>
      apiOk([
        {
          name: "search_products",
          description: "Tìm sản phẩm",
          inputSchema: { type: "object", properties: { keyword: { type: "string" } } },
          readOnly: true,
          allowed: true,
        },
        {
          name: "create_order",
          description: "",
          inputSchema: {},
          readOnly: false,
          allowed: false,
        },
      ]),
    ),
  );
});

afterEach(() => getQueryClient().clear());

describe("McpToolsTable", () => {
  it("bật tool ghi thì gửi allowedWriteTools mới", async () => {
    const bodies: unknown[] = [];
    server.use(
      mswHttp.patch(apiUrl(BASE), async ({ request }) => {
        bodies.push(await request.json());
        return apiOk(mcpServer);
      }),
    );
    renderWithProviders(<McpToolsTable server={mcpServer} canUpdate />);

    expect(await screen.findByLabelText("Cho phép agent gọi search_products")).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Cho phép agent gọi create_order"));

    await waitFor(() => expect(bodies).toEqual([{ allowedWriteTools: ["create_order"] }]));
  });

  it("gọi thử tool với khung tham số điền sẵn và hiện kết quả", async () => {
    const calls: unknown[] = [];
    server.use(
      mswHttp.post(apiUrl(`${BASE}/tools/search_products/call`), async ({ request }) => {
        calls.push(await request.json());
        return apiOk({ isError: false, text: "Có 3 sản phẩm" });
      }),
    );
    renderWithProviders(<McpToolsTable server={mcpServer} canUpdate />);

    await userEvent.click(await screen.findByRole("button", { name: "Gọi thử search_products" }));
    await userEvent.click(await screen.findByRole("button", { name: "Gọi" }));

    expect(await screen.findByText("Có 3 sản phẩm")).toBeInTheDocument();
    expect(calls).toEqual([{ arguments: { keyword: "" } }]);
  });

  it("không có quyền sửa thì không bật tắt, không gọi thử được", async () => {
    renderWithProviders(<McpToolsTable server={mcpServer} canUpdate={false} />);

    expect(await screen.findByLabelText("Cho phép agent gọi create_order")).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Gọi thử/ })).not.toBeInTheDocument();
  });
});
