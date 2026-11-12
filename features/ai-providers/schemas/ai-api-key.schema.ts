import { z } from "zod";

/** Khớp `AI_API_KEY_LIMITS` bên agent-core-be. */
export const AI_API_KEY_LIMITS = {
  secretKeyMaxLength: 500,
} as const;

const secretKey = z
  .string()
  .trim()
  .max(
    AI_API_KEY_LIMITS.secretKeyMaxLength,
    `Key tối đa ${AI_API_KEY_LIMITS.secretKeyMaxLength} ký tự`,
  );

/** Model chọn từ danh mục của BE nên không cần kiểm tra thêm; bỏ trống là chưa đặt. */
const defaultModel = z.string().optional();

export const createAiApiKeySchema = z.object({
  provider: z.string({ error: "Vui lòng chọn nhà cung cấp" }).min(1, "Vui lòng chọn nhà cung cấp"),
  secretKey: z
    .string({ error: "Vui lòng nhập API key" })
    .pipe(secretKey.min(1, "Vui lòng nhập API key")),
  defaultModel,
});

/** Khi sửa, để trống key nghĩa là giữ key hiện tại. */
export const updateAiApiKeySchema = z.object({
  secretKey: secretKey.optional(),
  defaultModel,
});

export type AiApiKeyFormValues = Partial<z.input<typeof createAiApiKeySchema>>;
