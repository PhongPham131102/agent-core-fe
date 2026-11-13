"use client";

import { Tag, Tooltip } from "antd";

import { formatDateTime } from "@/lib/utils/format";

import type { IAiMcpServer } from "../types/ai-mcp-server.types";

/** Trạng thái đồng bộ tool; lỗi thì rê chuột để xem lý do BE lưu lại. */
export function McpSyncStatus({
  toolsSyncedAt,
  lastSyncError,
}: Pick<IAiMcpServer, "toolsSyncedAt" | "lastSyncError">) {
  if (lastSyncError) {
    return (
      <Tooltip title={lastSyncError}>
        <Tag color="error">Lỗi đồng bộ</Tag>
      </Tooltip>
    );
  }
  if (!toolsSyncedAt) return <Tag>Chưa đồng bộ</Tag>;
  return (
    <Tooltip title={formatDateTime(toolsSyncedAt)}>
      <Tag color="success">Đã đồng bộ</Tag>
    </Tooltip>
  );
}
