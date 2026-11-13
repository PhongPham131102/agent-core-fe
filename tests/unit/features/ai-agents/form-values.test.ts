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
      memoryEnabled: false,
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

describe("kho tri thức của agent", () => {
  const withBases = buildAiAgent({
    knowledgeBases: [{ uid: "kb-1", name: "Chính sách", description: "" }],
  });

  it("đổ sẵn uid từ knowledgeBases; chỉ gửi khi đổi", () => {
    const values = toFormValues(withBases);

    expect(values.knowledgeBaseUids).toEqual(["kb-1"]);
    expect(toUpdateBody(withBases, values)).toEqual({});
    expect(toUpdateBody(withBases, { ...values, knowledgeBaseUids: [] })).toEqual({
      knowledgeBaseUids: [],
    });
  });

  it("tạo mới chỉ gửi knowledgeBaseUids khi có chọn", () => {
    const values = toFormValues(agent);

    expect(toCreateBody(values).knowledgeBaseUids).toBeUndefined();
    expect(toCreateBody({ ...values, knowledgeBaseUids: ["kb-1"] }).knowledgeBaseUids).toEqual([
      "kb-1",
    ]);
  });
});

describe("tool và ghi nhớ của agent", () => {
  const withTools = buildAiAgent({
    tools: [{ id: "get_current_datetime", name: "Ngày giờ", description: "" }],
    memoryEnabled: true,
  });

  it("đổ sẵn id tool và trạng thái ghi nhớ; chỉ gửi khi đổi", () => {
    const values = toFormValues(withTools);

    expect(values).toMatchObject({ toolNames: ["get_current_datetime"], memoryEnabled: true });
    expect(toUpdateBody(withTools, values)).toEqual({});
    expect(toUpdateBody(withTools, { ...values, toolNames: [], memoryEnabled: false })).toEqual({
      toolNames: [],
      memoryEnabled: false,
    });
  });
});

describe("MCP server của agent", () => {
  const withServers = buildAiAgent({ mcpServers: [{ code: "teeinblue", name: "Teeinblue" }] });

  it("tạo mới chỉ gửi mcpServerCodes khi có chọn", () => {
    const values = toFormValues(agent);

    expect(toCreateBody(values).mcpServerCodes).toBeUndefined();
    expect(toCreateBody({ ...values, mcpServerCodes: ["teeinblue"] }).mcpServerCodes).toEqual([
      "teeinblue",
    ]);
  });

  it("sửa: đổ sẵn code từ mcpServers, bỏ hết thì gửi mảng rỗng", () => {
    const values = toFormValues(withServers);

    expect(values.mcpServerCodes).toEqual(["teeinblue"]);
    expect(toUpdateBody(withServers, values)).toEqual({});
    expect(toUpdateBody(withServers, { ...values, mcpServerCodes: [] })).toEqual({
      mcpServerCodes: [],
    });
  });
});
