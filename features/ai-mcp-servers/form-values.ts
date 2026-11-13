import { changedFields } from "@/lib/form";

import { aiMcpServerSchema } from "./schemas/ai-mcp-server.schema";

import type { AiMcpServerFormValues } from "./schemas/ai-mcp-server.schema";
import type {
  IAiMcpServer,
  IAiMcpServerHeader,
  ICreateAiMcpServerBody,
  IUpdateAiMcpServerBody,
} from "./types/ai-mcp-server.types";

/**
 * Chuyển đổi giữa dữ liệu BE và giá trị form MCP server. Header BE trả dạng che (`***abcd`);
 * form đổ sẵn đúng giá trị đó, gửi lại nguyên vẹn thì BE giữ giá trị cũ.
 */

export const toFormValues = (server: IAiMcpServer): AiMcpServerFormValues => ({
  code: server.code,
  name: server.name,
  url: server.url,
  headers: server.headers.map(({ key, value }) => ({ key, value })),
});

const normalize = (values: AiMcpServerFormValues) => {
  const { headers = [], ...rest } = aiMcpServerSchema.parse(values);
  return {
    ...rest,
    headers: headers.map(({ key, value = "" }): IAiMcpServerHeader => ({ key, value })),
  };
};

const sameHeaders = (a: IAiMcpServerHeader[], b: IAiMcpServerHeader[]) =>
  a.length === b.length &&
  a.every(({ key, value }, index) => key === b[index]?.key && value === b[index].value);

export const toCreateBody = (values: AiMcpServerFormValues): ICreateAiMcpServerBody => {
  const { headers, ...rest } = normalize(values);
  return { ...rest, headers: headers.length > 0 ? headers : undefined };
};

/** Sửa: chỉ gửi field đã đổi; header đổi bất kỳ chỗ nào thì gửi cả danh sách. Không gửi mã. */
export const toUpdateBody = (
  server: IAiMcpServer,
  values: AiMcpServerFormValues,
): IUpdateAiMcpServerBody => {
  const { code: _code, headers, ...rest } = normalize(values);
  return {
    ...changedFields(server, rest),
    ...(!sameHeaders(server.headers, headers) && { headers }),
  };
};
