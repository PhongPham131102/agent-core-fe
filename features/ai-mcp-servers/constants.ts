/** Khớp `AI_MCP_SERVER_LIMITS` và `AI_MCP_SERVER_CODE_PATTERN` bên agent-core-be. */
export const AI_MCP_SERVER_LIMITS = {
  codeMaxLength: 20,
  nameMaxLength: 150,
  urlMaxLength: 500,
  headerKeyMaxLength: 100,
  headerValueMaxLength: 2000,
  headersMax: 20,
  searchMaxLength: 150,
} as const;

export const AI_MCP_SERVER_CODE_PATTERN = /^[a-z][a-z0-9_]{0,19}$/;

/** BE chờ server MCP tối đa 60 giây khi gọi tool, 20 giây khi đọc danh sách tool. */
export const MCP_CALL_TIMEOUT_MS = 65_000;
export const MCP_SYNC_TIMEOUT_MS = 25_000;
