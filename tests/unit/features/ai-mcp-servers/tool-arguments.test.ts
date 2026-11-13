import { describe, expect, it } from "vitest";

import { mcpToolArgumentsSchema } from "@/features/ai-mcp-servers/schemas/ai-mcp-server.schema";
import { argumentsTemplate, parseArguments } from "@/features/ai-mcp-servers/tool-arguments";

describe("argumentsTemplate", () => {
  it("điền giá trị rỗng theo type của từng tham số", () => {
    const template = argumentsTemplate({
      type: "object",
      properties: {
        keyword: { type: "string" },
        limit: { type: "integer" },
        active: { type: "boolean" },
        tags: { type: "array" },
        other: {},
      },
    });

    expect(JSON.parse(template)).toEqual({
      keyword: "",
      limit: 0,
      active: false,
      tags: [],
      other: null,
    });
  });

  it("schema không có properties thì là object rỗng", () => {
    expect(argumentsTemplate({})).toBe("{}");
  });
});

describe("tham số gọi thử", () => {
  it("chỉ nhận object JSON hoặc để trống", () => {
    expect(mcpToolArgumentsSchema.safeParse('{"a":1}').success).toBe(true);
    expect(mcpToolArgumentsSchema.safeParse("").success).toBe(true);
    expect(mcpToolArgumentsSchema.safeParse("[1]").success).toBe(false);
    expect(mcpToolArgumentsSchema.safeParse("{a:1}").success).toBe(false);
  });

  it("trống thì gửi object rỗng", () => {
    expect(parseArguments("  ")).toEqual({});
    expect(parseArguments('{"a":1}')).toEqual({ a: 1 });
  });
});
