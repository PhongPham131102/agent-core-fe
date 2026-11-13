"use client";

import { SyncOutlined } from "@ant-design/icons";
import { Alert, Button, Drawer, Skeleton, Typography } from "antd";

import { ErrorView } from "@/components/common";
import { Permission, useAccess } from "@/features/auth";

import { useAiMcpServerQuery, useSyncAiMcpTools } from "../../api/ai-mcp-servers.queries";
import { McpSyncStatus } from "../mcp-sync-status";

import { McpToolsTable } from "./mcp-tools-table";

import type { IAiMcpServer } from "../../types/ai-mcp-server.types";

const DRAWER_WIDTH = 860;

interface IMcpToolsDrawerProps {
  open: boolean;
  /** Bản ghi từ danh sách; nội dung đọc lại chi tiết để luôn mới sau khi đồng bộ, sửa. */
  server?: IAiMcpServer;
  onClose: () => void;
}

function ServerTools({ server }: { server: IAiMcpServer }) {
  const { can } = useAccess();
  const syncTools = useSyncAiMcpTools();
  const canUpdate = can(Permission.aiMcpServerUpdate);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Typography.Text type="secondary" ellipsis className="font-mono text-xs">
            {server.url}
          </Typography.Text>
          <McpSyncStatus {...server} />
        </div>
        {canUpdate && (
          <Button
            icon={<SyncOutlined />}
            loading={syncTools.isPending}
            onClick={() => syncTools.mutate(server.uid)}
          >
            Đồng bộ tool
          </Button>
        )}
      </div>
      {server.lastSyncError && <Alert type="error" showIcon title={server.lastSyncError} />}
      <McpToolsTable server={server} canUpdate={canUpdate} />
    </div>
  );
}

function ServerToolsLoader({ uid }: { uid: string }) {
  const server = useAiMcpServerQuery(uid);

  if (server.isPending) return <Skeleton active paragraph={{ rows: 6 }} />;
  if (server.isError) return <ErrorView error={server.error} retry={() => void server.refetch()} />;
  return <ServerTools server={server.data} />;
}

/** Tool của một server MCP: đồng bộ, cho phép tool ghi, gọi thử. */
export function McpToolsDrawer({ open, server, onClose }: IMcpToolsDrawerProps) {
  return (
    <Drawer title={server?.name} open={open} onClose={onClose} size={DRAWER_WIDTH} destroyOnHidden>
      {server && <ServerToolsLoader uid={server.uid} />}
    </Drawer>
  );
}
