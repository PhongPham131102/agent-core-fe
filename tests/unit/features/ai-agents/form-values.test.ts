import { describe, expect, it } from "vitest";

import {
  NEW_AGENT_VALUES,
  toCreateBody,
  toFormValues,
  toUpdateBody,
} from "@/features/ai-agents/form-values";
import { buildAiAgent } from "@/tests/support/ai-fixtures";

const agent = buildAiAgent();

describe("toCreateBody", () => {
  it("bỏ field tuỳ chọn còn trống, trim chuỗi, giữ mặc định", () => {
    const body = toCreateBody({
      ...NEW_AGENT_VALUES,
      name: "  Trợ lý  ",
      code: "",
      provider: "openai",
      model: "gpt-4o",
      systemPrompt: " Bạn là trợ lý. ",
    });

    expect(body).toEqual({
      name: "Trợ lý",
      provider: "openai",
      model: "gpt-4o",
      systemPrompt: "Bạn là trợ lý.",
      temperature: 0.7,
      maxOutputTokens: 4096,
      maxSteps: 8,
      historyTurnLimit: 10,
      isActive: true,
    });
  });

  it("từ chối mã không đúng dạng kebab-case", () => {
    const values = { ...toFormValues(agent), code: "Cskh Tong Dai" };

    expect(() => toCreateBody(values)).toThrow();
  });
});

describe("toUpdateBody", () => {
  it("không đổi gì thì body rỗng", () => {
    expect(toUpdateBody(agent, toFormValues(agent))).toEqual({});
  });

  it("chỉ gửi field đã đổi", () => {
    const values = { ...toFormValues(agent), name: "Tư vấn", maxSteps: 4 };

    expect(toUpdateBody(agent, values)).toEqual({ name: "Tư vấn", maxSteps: 4 });
  });

  it("xoá trắng mã (BE tạo lại từ tên) và bỏ mức suy luận thì gửi chuỗi rỗng", () => {
    const withEffort = buildAiAgent({ reasoningEffort: { id: "low", name: "Low" } });
    const values = { ...toFormValues(withEffort), code: "", reasoningEffort: undefined };

    expect(toUpdateBody(withEffort, values)).toEqual({ code: "", reasoningEffort: "" });
  });
});
