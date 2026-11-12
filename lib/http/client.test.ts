import { http as mswHttp, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { tokenHolder } from "@/lib/auth/token-holder";
import { server, TEST_API_URL } from "@/tests/msw-server";

import { ApiError, CommonErrorCode } from "./api-error";
import { registerAuthFailureHandler, registerRefreshHandler } from "./auth-events";
import { http } from "./http";

const ok = <T>(data: T) =>
  HttpResponse.json({ success: true, message: "Success", data, timestamp: "", path: "" });

afterEach(() => {
  tokenHolder.clear();
  registerRefreshHandler(null);
  registerAuthFailureHandler(null);
});

describe("http", () => {
  it("bỏ envelope và trả thẳng data", async () => {
    server.use(mswHttp.get(`${TEST_API_URL}/agents/1`, () => ok({ uid: "1", name: "A" })));

    await expect(http.get("/agents/1")).resolves.toEqual({ uid: "1", name: "A" });
  });

  it("chuyển lỗi BE thành ApiError có code và details", async () => {
    server.use(
      mswHttp.post(`${TEST_API_URL}/agents`, () =>
        HttpResponse.json(
          {
            success: false,
            message: "Validation failed",
            errorCode: "ERR_1001",
            details: ["name is required"],
          },
          { status: 400 },
        ),
      ),
    );

    const error = await http.post("/agents", {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: CommonErrorCode.validation,
      details: ["name is required"],
    });
  });

  it("lỗi mạng thành ApiError status 0", async () => {
    server.use(mswHttp.get(`${TEST_API_URL}/down`, () => HttpResponse.error()));

    await expect(http.get("/down")).rejects.toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });

  it("không gắn Authorization khi chưa có token", async () => {
    let header: string | null = "unset";
    server.use(
      mswHttp.get(`${TEST_API_URL}/me`, ({ request }) => {
        header = request.headers.get("authorization");
        return ok(null);
      }),
    );

    await http.get("/me");
    expect(header).toBeNull();
  });

  it("nhiều request cùng 401 chỉ refresh một lần rồi retry", async () => {
    tokenHolder.set("old");
    const refresh = vi.fn(async () => "new");
    registerRefreshHandler(refresh);
    server.use(
      mswHttp.get(`${TEST_API_URL}/items/:id`, ({ request, params }) =>
        request.headers.get("authorization") === "Bearer new"
          ? ok(params.id)
          : HttpResponse.json(
              { success: false, message: "Unauthorized", errorCode: "ERR_1003" },
              { status: 401 },
            ),
      ),
    );

    const results = await Promise.all([
      http.get("/items/1"),
      http.get("/items/2"),
      http.get("/items/3"),
    ]);

    expect(results).toEqual(["1", "2", "3"]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(tokenHolder.get()).toBe("new");
  });

  it("refresh thất bại thì xoá token và báo auth failure", async () => {
    tokenHolder.set("old");
    const onFailure = vi.fn();
    registerRefreshHandler(() => Promise.reject(new Error("expired")));
    registerAuthFailureHandler(onFailure);
    server.use(
      mswHttp.get(`${TEST_API_URL}/secure`, () =>
        HttpResponse.json(
          { success: false, message: "Unauthorized", errorCode: "ERR_1003" },
          { status: 401 },
        ),
      ),
    );

    await expect(http.get("/secure")).rejects.toMatchObject({ status: 401 });
    expect(onFailure).toHaveBeenCalledWith("REFRESH_FAILED");
    expect(tokenHolder.get()).toBeNull();
  });
});
