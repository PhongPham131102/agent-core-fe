"use client";

import { DeleteOutlined, EditOutlined, PlusOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";

import {
  DataTable,
  FilterBar,
  IconAction,
  PageHeader,
  SearchInput,
  useConfirmDelete,
} from "@/components/common";
import { Can, Permission, PermissionGuard, useAccess } from "@/features/auth";
import { useDisclosure } from "@/lib/hooks";
import { useSearchListParams } from "@/lib/url";

import { useAiMcpServersQuery, useDeleteAiMcpServer } from "../api/ai-mcp-servers.queries";
import { AI_MCP_SERVER_LIMITS } from "../constants";

import { AiMcpServerFormModal } from "./form/ai-mcp-server-form-modal";
import { McpSyncStatus } from "./mcp-sync-status";
import { McpToolsDrawer } from "./tools/mcp-tools-drawer";

import type { IAiMcpServer } from "../types/ai-mcp-server.types";
import type { TableColumnsType } from "antd";

function AiMcpServersContent() {
  const { can } = useAccess();
  const { query, setSearch, setPagination } = useSearchListParams();
  const servers = useAiMcpServersQuery(query);
  const deleteServer = useDeleteAiMcpServer();
  const confirmDelete = useConfirmDelete();
  const form = useDisclosure<IAiMcpServer>();
  const drawer = useDisclosure<IAiMcpServer>();

  const canEdit = can(Permission.aiMcpServerUpdate);
  const canDelete = can(Permission.aiMcpServerDelete);

  const handleDelete = (server: IAiMcpServer) =>
    confirmDelete({
      title: `Xoá MCP server "${server.name}"?`,
      onConfirm: () => deleteServer.mutateAsync(server.uid),
    });

  const columns: TableColumnsType<IAiMcpServer> = [
    {
      title: "Server",
      key: "name",
      render: (_, server) => (
        <div className="min-w-0">
          <Typography.Link strong onClick={() => drawer.show(server)}>
            {server.name}
          </Typography.Link>
          <div className="font-mono text-xs text-black/45">{server.code}</div>
        </div>
      ),
    },
    {
      title: "URL",
      dataIndex: "url",
      ellipsis: true,
      render: (url: string) => <span className="font-mono text-xs">{url}</span>,
    },
    { title: "Tool", dataIndex: "toolCount", width: 80, align: "right" },
    {
      title: "Đồng bộ",
      key: "sync",
      width: 140,
      render: (_, server) => <McpSyncStatus {...server} />,
    },
    {
      title: "",
      key: "actions",
      width: 132,
      align: "right",
      render: (_, server) => (
        <Space size={4}>
          <IconAction
            label="Tool"
            ariaLabel={`Mở tool của ${server.name}`}
            icon={<ToolOutlined />}
            onClick={() => drawer.show(server)}
          />
          {canEdit && (
            <IconAction
              label="Sửa"
              ariaLabel={`Sửa ${server.name}`}
              icon={<EditOutlined />}
              onClick={() => form.show(server)}
            />
          )}
          {canDelete && (
            <IconAction
              label="Xoá"
              ariaLabel={`Xoá ${server.name}`}
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(server)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="MCP server"
        extra={
          <Can permission={Permission.aiMcpServerCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => form.show()}>
              Thêm server
            </Button>
          </Can>
        }
      />
      <Card>
        <FilterBar>
          <SearchInput
            value={query.search}
            onSearch={setSearch}
            placeholder="Tìm theo tên hoặc mã"
            maxLength={AI_MCP_SERVER_LIMITS.searchMaxLength}
            className="w-full max-w-xs"
          />
        </FilterBar>
        <DataTable<IAiMcpServer>
          columns={columns}
          result={servers}
          query={query}
          onPaginationChange={setPagination}
          locale={{ emptyText: query.search ? "Không có server phù hợp" : "Chưa có server nào" }}
        />
      </Card>
      <AiMcpServerFormModal open={form.open} server={form.payload} onClose={form.hide} />
      <McpToolsDrawer open={drawer.open} server={drawer.payload} onClose={drawer.hide} />
    </>
  );
}

export function AiMcpServersPage() {
  return (
    <PermissionGuard permission={Permission.aiMcpServerRead}>
      <AiMcpServersContent />
    </PermissionGuard>
  );
}
