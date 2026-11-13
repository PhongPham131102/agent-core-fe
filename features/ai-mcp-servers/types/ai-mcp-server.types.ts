import type { IPaginationQuery } from "@/lib/http";

/** Header gửi kèm mỗi request tới server MCP. BE luôn trả `value` dạng che (`***abcd`). */
export interface IAiMcpServerHeader {
  key: string;
  value: string;
}

/** Khớp `IAiMcpServerResponse` bên agent-core-be. */
export interface IAiMcpServer {
  uid: string;
  code: string;
  name: string;
  url: string;
  headers: IAiMcpServerHeader[];
  /** Tool ghi (không chỉ đọc) mà agent vẫn được gọi. */
  allowedWriteTools: string[];
  toolCount: number;
  /** `null` là chưa đồng bộ tool lần nào. */
  toolsSyncedAt: string | null;
  /** Lỗi của lần đồng bộ gần nhất; `""` là không lỗi. */
  lastSyncError: string;
  createdAt: string;
  updatedAt: string;
}

/** Một mục của ô chọn server (`GET /ai-mcp-servers/options`), cũng là dạng server gắn trong agent. */
export interface IAiMcpServerOption {
  code: string;
  name: string;
}

/** Tool đã lưu của một server (`GET /ai-mcp-servers/:uid/tools`). */
export interface IAiMcpTool {
  name: string;
  description: string;
  /** JSON Schema của tham số. */
  inputSchema: Record<string, unknown>;
  readOnly: boolean;
  /** Agent được gọi: tool chỉ đọc, hoặc tool ghi nằm trong `allowedWriteTools`. */
  allowed: boolean;
}

export interface IAiMcpToolCallResult {
  isError: boolean;
  text: string;
  structuredContent?: unknown;
}

export interface IAiMcpServerListQuery extends IPaginationQuery {
  /** Tìm theo tên hoặc mã. */
  search?: string;
}

export interface ICreateAiMcpServerBody {
  code: string;
  name: string;
  url: string;
  headers?: IAiMcpServerHeader[];
  allowedWriteTools?: string[];
}

/** Mọi field trừ `code`. Header gửi lại đúng giá trị che thì BE giữ giá trị cũ. */
export type IUpdateAiMcpServerBody = Partial<Omit<ICreateAiMcpServerBody, "code">>;
