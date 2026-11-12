import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { authKeys } from "@/features/auth/api/auth.keys";
import { LoginForm } from "@/features/auth/components/login/login-form";
import { tokenHolder } from "@/lib/auth";
import { getQueryClient } from "@/lib/query";
import { buildAuthUser } from "@/tests/support/fixtures";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

import "@/features/auth/errors";

const fillAndSubmit = async (email: string, password: string) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Mật khẩu"), password);
  await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
};

afterEach(() => {
  tokenHolder.clear();
  getQueryClient().clear();
});

describe("LoginForm", () => {
  it("đăng nhập thành công thì lưu token và user", async () => {
    const authUser = buildAuthUser();
    let body: unknown;
    server.use(
      mswHttp.post(apiUrl("/auth/login"), async ({ request }) => {
        body = await request.json();
        return apiOk({ accessToken: "access-1", user: authUser });
      }),
    );
    renderWithProviders(<LoginForm />);

    await fillAndSubmit("  admin@example.com", "secret");

    await waitFor(() => expect(tokenHolder.get()).toBe("access-1"));
    expect(body).toEqual({ email: "admin@example.com", password: "secret" });
    expect(getQueryClient().getQueryData(authKeys.me())).toEqual(authUser);
  });

  it("sai mật khẩu thì hiện lỗi ngay trong form", async () => {
    server.use(mswHttp.post(apiUrl("/auth/login"), () => apiError(401, "ERR_2000")));
    renderWithProviders(<LoginForm />);

    await fillAndSubmit("admin@example.com", "wrong");

    expect(await screen.findByText("Email hoặc mật khẩu không đúng")).toBeInTheDocument();
    expect(tokenHolder.get()).toBeNull();
  });

  it("không gọi API khi email sai định dạng", async () => {
    let called = false;
    server.use(
      mswHttp.post(apiUrl("/auth/login"), () => {
        called = true;
        return apiError(401, "ERR_2000");
      }),
    );
    renderWithProviders(<LoginForm />);

    await fillAndSubmit("khong-phai-email", "secret");

    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(called).toBe(false);
  });
});
