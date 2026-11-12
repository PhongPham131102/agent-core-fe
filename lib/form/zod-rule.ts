import type { Rule } from "antd/es/form";
import type { z } from "zod";

/**
 * Dùng schema Zod làm rule cho `Form.Item` của antd, để một schema phục vụ cả
 * validate form lẫn suy ra kiểu payload:
 *
 *   <Form.Item name="email" rules={[zodRule(loginSchema.shape.email)]}>
 */
export const zodRule = (schema: z.ZodType): Rule => ({
  validator: (_rule, value: unknown) => {
    const result = schema.safeParse(value);
    return result.success
      ? Promise.resolve()
      : Promise.reject(new Error(result.error.issues[0]?.message ?? "Giá trị không hợp lệ"));
  },
});
