import { describe, expect, it } from "vitest";

import { formatBytes } from "@/lib/utils/format";

describe("formatBytes", () => {
  it("đổi sang đơn vị phù hợp, tối đa một chữ số thập phân", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1,5 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2 MB");
  });
});
