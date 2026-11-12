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

  it("không gửi mã: BE tự tạo từ tên", () => {
    expect(toCreateBody(toFormValues(agent))).not.toHaveProperty("code");
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

  it("bỏ mức suy luận thì gửi chuỗi rỗng", () => {
    const withEffort = buildAiAgent({ reasoningEffort: { id: "low", name: "Low" } });
    const values = { ...toFormValues(withEffort), reasoningEffort: undefined };

    expect(toUpdateBody(withEffort, values)).toEqual({ reasoningEffort: "" });
  });
});

describe("skill của agent", () => {
  const withSkills = buildAiAgent({
    skills: [{ code: "tra-cuu", name: "Tra cứu", description: "", iconUrl: "" }],
  });

  it("tạo mới chỉ gửi skillCodes khi có chọn", () => {
    const values = toFormValues(agent);

    expect(toCreateBody(values).skillCodes).toBeUndefined();
    expect(toCreateBody({ ...values, skillCodes: ["tra-cuu"] }).skillCodes).toEqual(["tra-cuu"]);
  });

  it("sửa: đổ sẵn code từ skills, bỏ hết thì gửi mảng rỗng", () => {
    const values = toFormValues(withSkills);

    expect(values.skillCodes).toEqual(["tra-cuu"]);
    expect(toUpdateBody(withSkills, values)).toEqual({});
    expect(toUpdateBody(withSkills, { ...values, skillCodes: [] })).toEqual({ skillCodes: [] });
  });
});
