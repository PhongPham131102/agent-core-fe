import { screen, waitFor } from "@testing-library/react";
import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "@/features/auth/components/guards/auth-guard";
import { tokenHolder } from "@/lib/auth";
import { getQueryClient } from "@/lib/query";
import { buildAuthUser } from "@/tests/support/fixtures";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";
import { renderWithProviders } from "@/tests/support/render";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

afterEach(() => {
  tokenHolder.clear();
  getQueryClient().clear();
  replace.mockReset();
  window.history.replaceState(null, "", "/");
});

describe("AuthGuard", () => {
  it("khôi phục phiên từ cookie rồi hiển thị nội dung", async () => {
    server.use(
      mswHttp.post(apiUrl("/auth/refresh"), () =>
        apiOk({ accessToken: "access-1", user: buildAuthUser() }),
      ),
    );

    renderWithProviders(<AuthGuard>Nội dung riêng tư</AuthGuard>);

    expect(screen.queryByText("Nội dung riêng tư")).not.toBeInTheDocument();
    expect(await screen.findByText("Nội dung riêng tư")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("chưa đăng nhập thì chuyển về login kèm đường dẫn đang xem", async () => {
    window.history.replaceState(null, "", "/users?page=2");
    server.use(mswHttp.post(apiUrl("/auth/refresh"), () => apiError(401, "ERR_2001")));

    renderWithProviders(<AuthGuard>Nội dung riêng tư</AuthGuard>);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/login?redirect=%2Fusers%3Fpage%3D2"),
    );
    expect(screen.queryByText("Nội dung riêng tư")).not.toBeInTheDocument();
  });

  it("lỗi không phải 401 thì hiện lỗi kèm nút thử lại, không đá về login", async () => {
    server.use(mswHttp.post(apiUrl("/auth/refresh"), () => apiError(500, "ERR_1000")));

    renderWithProviders(<AuthGuard>Nội dung riêng tư</AuthGuard>);

    expect(await screen.findByRole("button", { name: "Thử lại" })).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
