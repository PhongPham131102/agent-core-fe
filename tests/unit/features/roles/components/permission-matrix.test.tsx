import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { authKeys } from "@/features/auth";
import { PermissionMatrix } from "@/features/roles/components/permission-matrix";
import { getQueryClient } from "@/lib/query";
import { buildAuthUser } from "@/tests/support/fixtures";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

const catalog = [
  {
    subject: "user",
    permissions: [
      { action: "create", key: "user:create" },
      { action: "read", key: "user:read" },
    ],
  },
];

const renderMatrix = (permissions: string[], value: string[] = []) => {
  getQueryClient().setQueryData(authKeys.me(), buildAuthUser({ permissions }));
  server.use(mswHttp.get(apiUrl("/permissions"), () => apiOk(catalog)));
  const onChange = vi.fn();
  renderWithProviders(<PermissionMatrix value={value} onChange={onChange} />);
  return onChange;
};

afterEach(() => getQueryClient().clear());

describe("PermissionMatrix", () => {
  it("khoá quyền mà người thao tác không có", async () => {
    renderMatrix(["user:read"]);

    expect(await screen.findByRole("checkbox", { name: "Xem người dùng" })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: "Tạo người dùng" })).toBeDisabled();
  });

  it("bật một quyền thì giữ nguyên các quyền đã chọn", async () => {
    const onChange = renderMatrix(["user:read", "user:create"], ["user:read"]);

    await userEvent.click(await screen.findByRole("checkbox", { name: "Tạo người dùng" }));

    expect(onChange).toHaveBeenCalledWith(["user:read", "user:create"]);
  });

  it("'Tất cả' chỉ chọn những quyền được phép cấp", async () => {
    const onChange = renderMatrix(["user:read"]);

    await userEvent.click(await screen.findByRole("checkbox", { name: "Tất cả quyền người dùng" }));

    expect(onChange).toHaveBeenCalledWith(["user:read"]);
  });
});
