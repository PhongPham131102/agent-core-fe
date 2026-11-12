import { describe, expect, it, vi } from "vitest";

import { ApiError, ClientErrorCode } from "@/lib/http";

import { makeQueryClient, shouldRetry } from "./query-client";

describe("shouldRetry", () => {
  it("không retry lỗi 4xx và request bị huỷ", () => {
    expect(shouldRetry(0, new ApiError(404, "ERR_1002", ""))).toBe(false);
    expect(shouldRetry(0, new ApiError(0, ClientErrorCode.cancelled, ""))).toBe(false);
  });

  it("retry lỗi 5xx/mạng tối đa 1 lần", () => {
    expect(shouldRetry(0, new ApiError(500, "ERR_1000", ""))).toBe(true);
    expect(shouldRetry(1, new ApiError(0, ClientErrorCode.network, ""))).toBe(false);
  });
});

describe("mutation meta.invalidates", () => {
  it("invalidate các key khai báo sau khi mutation thành công", async () => {
    const queryClient = makeQueryClient();
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async () => "ok",
        meta: { invalidates: [["agents", "list"]] },
      })
      .execute(undefined);

    expect(spy).toHaveBeenCalledWith({ queryKey: ["agents", "list"] });
  });
});
