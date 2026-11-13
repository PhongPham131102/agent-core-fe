import { z } from "zod";

import { AI_MCP_SERVER_CODE_PATTERN, AI_MCP_SERVER_LIMITS as L } from "../constants";

const headerSchema = z.object({
  key: z
    .string({ error: "Vui lòng nhập tên header" })
    .trim()
    .min(1, "Vui lòng nhập tên header")
    .max(L.headerKeyMaxLength, `Tên header tối đa ${L.headerKeyMaxLength} ký tự`),
  value: z
    .string()
    .max(L.headerValueMaxLength, `Giá trị tối đa ${L.headerValueMaxLength} ký tự`)
    .optional(),
});

/** Ràng buộc của cả danh sách header: số lượng và không trùng tên (không phân biệt hoa thường). */
const headerListSchema = <T extends z.ZodType<{ key?: string }>>(item: T) =>
  z
    .array(item)
    .max(L.headersMax, `Tối đa ${L.headersMax} header`)
    .refine(
      (headers) => {
        const keys = headers.map(({ key = "" }) => key.trim().toLowerCase()).filter(Boolean);
        return new Set(keys).size === keys.length;
      },
      { error: "Tên header bị trùng" },
    );

export const aiMcpServerSchema = z.object({
  code: z
    .string({ error: "Vui lòng nhập mã" })
    .trim()
    .min(1, "Vui lòng nhập mã")
    .regex(
      AI_MCP_SERVER_CODE_PATTERN,
      `Mã gồm a-z, 0-9, _, bắt đầu bằng chữ, tối đa ${L.codeMaxLength} ký tự`,
    ),
  name: z
    .string({ error: "Vui lòng nhập tên" })
    .trim()
    .min(1, "Vui lòng nhập tên")
    .max(L.nameMaxLength, `Tên tối đa ${L.nameMaxLength} ký tự`),
  url: z
    .string({ error: "Vui lòng nhập URL" })
    .trim()
    .min(1, "Vui lòng nhập URL")
    .max(L.urlMaxLength, `URL tối đa ${L.urlMaxLength} ký tự`)
    .regex(/^https?:\/\/\S+$/, "URL phải bắt đầu bằng http:// hoặc https://"),
  headers: headerListSchema(headerSchema).optional(),
});

export const aiMcpServerHeaderSchema = headerSchema;
/** Rule cho `Form.List`: chỉ kiểm tra cả danh sách, từng dòng có rule riêng. */
export const aiMcpServerHeaderListSchema = headerListSchema(
  z.object({ key: z.string().optional() }),
);

export type AiMcpServerValues = z.output<typeof aiMcpServerSchema>;
/** Giá trị trong form: lúc đang nhập, field nào cũng có thể trống. */
export type AiMcpServerFormValues = Partial<z.input<typeof aiMcpServerSchema>>;

/** Tham số gọi thử tool: một object JSON. */
export const mcpToolArgumentsSchema = z
  .string()
  .trim()
  .refine((text) => {
    if (!text) return true;
    try {
      const parsed: unknown = JSON.parse(text);
      return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
    } catch {
      return false;
    }
  }, "Tham số phải là một object JSON");
