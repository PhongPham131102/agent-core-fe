import { http as mswHttp } from "msw";
import { describe, expect, it } from "vitest";

import { userService } from "@/features/users/api/users.service";
import { apiOk, apiUrl, server } from "@/tests/support/msw-server";

describe("userService.list", () => {
  it("gửi page/limit và bỏ filter rỗng khỏi query string", async () => {
    let search = "";
    server.use(
      mswHttp.get(apiUrl("/users"), ({ request }) => {
        search = new URL(request.url).search;
        return apiOk({ items: [], total: 0, page: 2, limit: 20 });
      }),
    );

    const result = await userService.list({ page: 2, limit: 20, search: "", roleUid: undefined });

    expect(search).toBe("?page=2&limit=20");
    expect(result).toEqual({ items: [], total: 0, page: 2, limit: 20 });
  });
});

describe("userService.resetPassword", () => {
  it("gửi PATCH /users/:uid/password và chấp nhận 204", async () => {
    let body: unknown;
    server.use(
      mswHttp.patch(apiUrl("/users/u1/password"), async ({ request }) => {
        body = await request.json();
        return new Response(null, { status: 204 });
      }),
    );

    await expect(userService.resetPassword("u1", "StrongP@ssw0rd")).resolves.toBeUndefined();
    expect(body).toEqual({ newPassword: "StrongP@ssw0rd" });
  });
});
