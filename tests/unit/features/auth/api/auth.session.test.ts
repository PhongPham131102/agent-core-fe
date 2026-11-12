import { http as mswHttp } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { authKeys } from "@/features/auth/api/auth.keys";
import { fetchCurrentUser, refreshSession } from "@/features/auth/api/auth.session";
import { tokenHolder } from "@/lib/auth";
import { http } from "@/lib/http";
import { getQueryClient } from "@/lib/query";
import { buildAuthUser } from "@/tests/support/fixtures";
import { apiError, apiOk, apiUrl, server } from "@/tests/support/msw-server";

const user = buildAuthUser();

/** Giả lập refresh xoay vòng: mỗi lần gọi trả một token mới và đếm số lần gọi. */
const mockRefresh = () => {
  const calls = { count: 0 };
  server.use(
    mswHttp.post(apiUrl("/auth/refresh"), () => {
      calls.count += 1;
      return apiOk({ accessToken: `token-${calls.count}`, user });
    }),
  );
  return calls;
};

afterEach(() => {
  tokenHolder.clear();
  getQueryClient().clear();
});

describe("refreshSession", () => {
  it("lưu token và user vào cache", async () => {
    mockRefresh();

    await refreshSession();

    expect(tokenHolder.get()).toBe("token-1");
    expect(getQueryClient().getQueryData(authKeys.me())).toEqual(user);
  });

  it("nhiều lời gọi cùng lúc chỉ gửi một request", async () => {
    const calls = mockRefresh();

    const [first, second] = await Promise.all([refreshSession(), refreshSession()]);

    expect(calls.count).toBe(1);
    expect(first).toBe(second);
  });

  it("không gửi Authorization và không tự refresh lại khi bị 401", async () => {
    tokenHolder.set("stale");
    let authorization: string | null = "unset";
    let calls = 0;
    server.use(
      mswHttp.post(apiUrl("/auth/refresh"), ({ request }) => {
        calls += 1;
        authorization = request.headers.get("authorization");
        return apiError(401, "ERR_2001");
      }),
    );

    await expect(refreshSession()).rejects.toMatchObject({ status: 401, code: "ERR_2001" });
    expect(authorization).toBeNull();
    expect(calls).toBe(1);
  });
});

describe("fetchCurrentUser", () => {
  it("chưa có token thì khôi phục phiên bằng refresh", async () => {
    const calls = mockRefresh();

    await expect(fetchCurrentUser()).resolves.toEqual(user);
    expect(calls.count).toBe(1);
  });

  it("đã có token thì đọc GET /auth/me, không xoay refresh token", async () => {
    const calls = mockRefresh();
    tokenHolder.set("valid");
    server.use(mswHttp.get(apiUrl("/auth/me"), () => apiOk({ ...user, fullName: "Mới" })));

    await expect(fetchCurrentUser()).resolves.toMatchObject({ fullName: "Mới" });
    expect(calls.count).toBe(0);
  });
});

describe("request nghiệp vụ gặp 401", () => {
  it("tự refresh rồi gửi lại với token mới", async () => {
    const calls = mockRefresh();
    tokenHolder.set("expired");
    server.use(
      mswHttp.get(apiUrl("/users"), ({ request }) =>
        request.headers.get("authorization") === "Bearer token-1"
          ? apiOk({ items: [], total: 0, page: 1, limit: 20 })
          : apiError(401, "ERR_1003"),
      ),
    );

    await expect(http.get("/users")).resolves.toMatchObject({ total: 0 });
    expect(calls.count).toBe(1);
  });
});
