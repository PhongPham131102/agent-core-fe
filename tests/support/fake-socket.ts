import { vi } from "vitest";

type Handler = (...args: never[]) => unknown;

/**
 * Socket.IO giả cho test: ghi lại handler đã đăng ký, cho test tự phát sự kiện từ "server",
 * và trả ack theo `ackFor`.
 */
export class FakeSocket {
  handlers = new Map<string, Handler[]>();
  ackFor: (event: string, payload: unknown) => unknown = () => ({ accepted: true });
  connect = vi.fn(() => this);
  disconnect = vi.fn(() => this);
  emit = vi.fn();

  on(event: string, handler: Handler) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), handler]);
    return this;
  }

  off(event: string, handler: Handler) {
    this.handlers.set(
      event,
      (this.handlers.get(event) ?? []).filter((item) => item !== handler),
    );
    return this;
  }

  removeAllListeners() {
    this.handlers.clear();
    return this;
  }

  timeout() {
    return {
      emitWithAck: (event: string, payload: unknown) =>
        Promise.resolve(this.ackFor(event, payload)),
    };
  }

  /** Phát sự kiện như thể từ server. */
  serverEmit(event: string, payload?: unknown) {
    for (const handler of this.handlers.get(event) ?? [])
      (handler as (p: unknown) => void)(payload);
  }
}
