import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { ProfileInfoForm } from "@/features/account/components/profile-info-form";
import { authKeys } from "@/features/auth";
import { getQueryClient } from "@/lib/query";
import { buildAuthUser } from "@/tests/support/fixtures";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

import type { IAuthUser } from "@/features/auth";

afterEach(() => getQueryClient().clear());

describe("ProfileInfoForm", () => {
  it("chỉ bật nút Lưu khi họ tên thay đổi", async () => {
    renderWithProviders(<ProfileInfoForm user={buildAuthUser() as IAuthUser} />);
    const save = screen.getByRole("button", { name: "Lưu thay đổi" });

    expect(save).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Họ tên"), " Mới");
    expect(save).toBeEnabled();
  });

  it("gửi đúng field đã đổi và cập nhật người dùng hiện tại trong cache", async () => {
    const user = buildAuthUser() as IAuthUser;
    let body: unknown;
    server.use(
      mswHttp.patch(apiUrl("/auth/me"), async ({ request }) => {
        body = await request.json();
        return apiOk({ ...user, fullName: "Trần Văn B" });
      }),
    );
    renderWithProviders(<ProfileInfoForm user={user} />);

    const input = screen.getByLabelText("Họ tên");
    await userEvent.clear(input);
    await userEvent.type(input, "  Trần Văn B ");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(body).toEqual({ fullName: "Trần Văn B" }));
    expect(getQueryClient().getQueryData<IAuthUser>(authKeys.me())?.fullName).toBe("Trần Văn B");
  });
});
