import { z } from "zod";

import { AI_AGENT_LIMITS as L } from "../constants";

/** Ô số của antd trả `null` khi xoá trắng, nên báo "bắt buộc" thay vì lỗi kiểu dữ liệu. */
const numberInRange = (label: string, { min, max }: { min: number; max: number }, int = true) => {
  const base = z.number({ error: `Vui lòng nhập ${label.toLowerCase()}` });
  return (int ? base.int(`${label} phải là số nguyên`) : base)
    .min(min, `${label} từ ${min} đến ${max}`)
    .max(max, `${label} từ ${min} đến ${max}`);
};

export const aiAgentSchema = z.object({
  name: z
    .string({ error: "Vui lòng nhập tên agent" })
    .trim()
    .min(1, "Vui lòng nhập tên agent")
    .max(L.nameMaxLength, `Tên tối đa ${L.nameMaxLength} ký tự`),
  description: z
    .string()
    .trim()
    .max(L.descriptionMaxLength, `Mô tả tối đa ${L.descriptionMaxLength} ký tự`)
    .optional(),
  provider: z.string({ error: "Vui lòng chọn nhà cung cấp" }).min(1, "Vui lòng chọn nhà cung cấp"),
  model: z.string({ error: "Vui lòng chọn model" }).min(1, "Vui lòng chọn model"),
  /** `id` lấy từ danh mục của BE; bỏ trống là không dùng. */
  reasoningEffort: z.string().optional(),
  systemPrompt: z
    .string({ error: "Vui lòng nhập chỉ dẫn hệ thống" })
    .trim()
    .min(1, "Vui lòng nhập chỉ dẫn hệ thống")
    .max(L.systemPromptMaxLength, `Chỉ dẫn tối đa ${L.systemPromptMaxLength} ký tự`),
  temperature: numberInRange("Temperature", L.temperature, false),
  maxOutputTokens: numberInRange("Số token tối đa", L.maxOutputTokens),
  maxSteps: numberInRange("Số bước tối đa", L.maxSteps),
  historyTurnLimit: numberInRange("Số lượt nhớ", L.historyTurnLimit),
  isActive: z.boolean(),
  skillCodes: z
    .array(z.string())
    .max(L.skillCodesMax, `Tối đa ${L.skillCodesMax} skill`)
    .optional(),
  knowledgeBaseUids: z
    .array(z.string())
    .max(L.knowledgeBasesMax, `Tối đa ${L.knowledgeBasesMax} kho tri thức`)
    .optional(),
});

export type AiAgentValues = z.output<typeof aiAgentSchema>;
/** Giá trị trong form: lúc đang nhập, field nào cũng có thể trống. */
export type AiAgentFormValues = Partial<z.input<typeof aiAgentSchema>>;
