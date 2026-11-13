import { describe, expect, it } from "vitest";

import { toCreateBody, toFormValues, toUpdateBody } from "@/features/ai-mcp-servers/form-values";
import { buildAiMcpServer } from "@/tests/support/ai-fixtures";

const server = buildAiMcpServer();

describe("toCreateBody", () => {
  it("trim chuỗi, bỏ headers khi không có header nào", () => {
    expect(
      toCreateBody({ code: " crm ", name: " CRM ", url: " https://crm.test/mcp ", headers: [] }),
    ).toEqual({ code: "crm", name: "CRM", url: "https://crm.test/mcp", headers: undefined });
  });

  it("header bỏ trống giá trị thì gửi chuỗi rỗng", () => {
    const body = toCreateBody({
      code: "crm",
      name: "CRM",
      url: "https://crm.test/mcp",
      headers: [{ key: " X-Api-Key ", value: undefined }],
    });

    expect(body.headers).toEqual([{ key: "X-Api-Key", value: "" }]);
  });
});

describe("toUpdateBody", () => {
  it("không đổi gì thì body rỗng, kể cả header còn giá trị che", () => {
    expect(toUpdateBody(server, toFormValues(server))).toEqual({});
  });

  it("chỉ gửi field đã đổi, không bao giờ gửi mã", () => {
    const values = { ...toFormValues(server), code: "khac", name: "Teeinblue mới" };

    expect(toUpdateBody(server, values)).toEqual({ name: "Teeinblue mới" });
  });

  it("đổi một header thì gửi cả danh sách, header không đổi vẫn giữ giá trị che", () => {
    const values = {
      ...toFormValues(server),
      headers: [
        { key: "Authorization", value: "***abcd" },
        { key: "X-Shop", value: "demo" },
      ],
    };

    expect(toUpdateBody(server, values)).toEqual({
      headers: [
        { key: "Authorization", value: "***abcd" },
        { key: "X-Shop", value: "demo" },
      ],
    });
  });

  it("xoá hết header thì gửi mảng rỗng", () => {
    expect(toUpdateBody(server, { ...toFormValues(server), headers: [] })).toEqual({ headers: [] });
  });
});

describe("schema", () => {
  it("chặn mã sai dạng và header trùng tên", () => {
    expect(() => toCreateBody({ code: "1abc", name: "A", url: "https://a.test" })).toThrow();
    expect(() =>
      toCreateBody({
        code: "abc",
        name: "A",
        url: "https://a.test",
        headers: [
          { key: "Authorization", value: "a" },
          { key: "authorization", value: "b" },
        ],
      }),
    ).toThrow();
  });
});
