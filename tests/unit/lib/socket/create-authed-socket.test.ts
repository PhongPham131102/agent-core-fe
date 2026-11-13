import { afterEach, describe, expect, it, vi } from "vitest";

import { tokenHolder } from "@/lib/auth/token-holder";
import { FakeSocket } from "@/tests/support/fake-socket";

const fake = new FakeSocket();
const io = vi.fn((..._args: unknown[]) => fake);
vi.mock("socket.io-client", () => ({ io: (...args: unknown[]) => io(...args) }));

const renewAccessToken = vi.fn();
vi.mock("@/lib/http", () => ({ renewAccessToken: () => renewAccessToken() }));

const { createAuthedSocket } = await import("@/lib/socket");

afterEach(() => {
  vi.clearAllMocks();
  fake.handlers.clear();
  tokenHolder.clear();
});

describe("createAuthedSocket", () => {
  it("nối vào gốc của BE (không qua /api), chỉ websocket, lấy token mới nhất mỗi lần", () => {
    createAuthedSocket("ai-chat");

    const [url, options] = io.mock.calls[0] as [string, Record<string, unknown>];
    expect(url).toBe("http://api.test/ai-chat");
    expect(options).toMatchObject({ transports: ["websocket"], autoConnect: false });

    tokenHolder.set("token-2");
    const callback = vi.fn();
    (options.auth as (cb: typeof callback) => void)(callback);
    expect(callback).toHaveBeenCalledWith({ token: "token-2" });
  });

  it("bị từ chối vì token thì refresh rồi kết nối lại, chỉ một lần", async () => {
    renewAccessToken.mockResolvedValue("new-token");
    createAuthedSocket("ai-chat");

    fake.serverEmit("connect_error", { message: "Unauthorized" });
    fake.serverEmit("connect_error", { message: "Unauthorized" });

    await vi.waitFor(() => expect(fake.connect).toHaveBeenCalledTimes(1));
    expect(renewAccessToken).toHaveBeenCalledTimes(1);
  });

  it("lỗi khác (ví dụ thiếu quyền) thì không refresh", () => {
    createAuthedSocket("ai-chat");

    fake.serverEmit("connect_error", { message: 'Missing permission "ai-chat:use"' });

    expect(renewAccessToken).not.toHaveBeenCalled();
  });
});
