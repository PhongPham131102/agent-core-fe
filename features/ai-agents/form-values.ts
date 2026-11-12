import { changedFields } from "@/lib/form";

import { AI_AGENT_DEFAULTS } from "./constants";
import { aiAgentSchema } from "./schemas/ai-agent.schema";

import type { AiAgentFormValues } from "./schemas/ai-agent.schema";
import type { IAiAgent, ICreateAiAgentBody, IUpdateAiAgentBody } from "./types/ai-agent.types";

/**
 * Chuyển đổi giữa dữ liệu BE và giá trị form agent. Gom một chỗ để form tạo, form sửa
 * và test dùng chung, và để khi BE đổi hợp đồng chỉ phải sửa ở đây.
 * BE trả `{ id, name }` cho nhà cung cấp, model, mức suy luận; form và body chỉ dùng `id`.
 */

/** Giá trị ban đầu khi tạo agent mới: mặc định giống BE. */
export const NEW_AGENT_VALUES: AiAgentFormValues = { ...AI_AGENT_DEFAULTS };

/** Bản ghi BE → giá trị form. */
export const toFormValues = (agent: IAiAgent): AiAgentFormValues => ({
  name: agent.name,
  code: agent.code,
  description: agent.description,
  provider: agent.provider.id,
  model: agent.model.id,
  reasoningEffort: agent.reasoningEffort?.id,
  systemPrompt: agent.systemPrompt,
  temperature: agent.temperature,
  maxOutputTokens: agent.maxOutputTokens,
  maxSteps: agent.maxSteps,
  historyTurnLimit: agent.historyTurnLimit,
  isActive: agent.isActive,
});

/** Giá trị đã kiểm tra, với các field tuỳ chọn để trống quy về "". */
const normalize = (values: AiAgentFormValues) => {
  const {
    code = "",
    description = "",
    reasoningEffort = "",
    ...rest
  } = aiAgentSchema.parse(values);
  return { ...rest, code, description, reasoningEffort };
};

/** Tạo mới: bỏ hẳn field tuỳ chọn còn trống (mã trống thì BE lấy slug của tên). */
export const toCreateBody = (values: AiAgentFormValues): ICreateAiAgentBody => {
  const { code, description, reasoningEffort, ...rest } = normalize(values);
  return {
    ...rest,
    code: code || undefined,
    description: description || undefined,
    reasoningEffort: reasoningEffort || undefined,
  };
};

/**
 * Sửa: chỉ gửi field đã đổi. Xoá trắng mã là gửi "" (BE tạo lại từ tên),
 * bỏ mức suy luận là gửi "".
 */
export const toUpdateBody = (agent: IAiAgent, values: AiAgentFormValues): IUpdateAiAgentBody => {
  const current = { ...toFormValues(agent), reasoningEffort: agent.reasoningEffort?.id ?? "" };
  return changedFields(current, normalize(values));
};
