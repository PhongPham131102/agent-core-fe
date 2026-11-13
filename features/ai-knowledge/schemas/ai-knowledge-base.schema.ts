import { z } from "zod";

import { AI_KNOWLEDGE_LIMITS as L } from "../constants";

export const knowledgeBaseSchema = z.object({
  name: z
    .string({ error: "Vui lòng nhập tên kho" })
    .trim()
    .min(1, "Vui lòng nhập tên kho")
    .max(L.nameMaxLength, `Tên tối đa ${L.nameMaxLength} ký tự`),
  description: z
    .string()
    .trim()
    .max(L.descriptionMaxLength, `Mô tả tối đa ${L.descriptionMaxLength} ký tự`)
    .optional(),
});

export type KnowledgeBaseValues = z.input<typeof knowledgeBaseSchema>;

export const knowledgeSearchSchema = z.object({
  query: z
    .string({ error: "Vui lòng nhập câu hỏi" })
    .trim()
    .min(1, "Vui lòng nhập câu hỏi")
    .max(L.queryMaxLength, `Câu hỏi tối đa ${L.queryMaxLength} ký tự`),
});

export type KnowledgeSearchValues = z.input<typeof knowledgeSearchSchema>;
