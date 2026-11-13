"use client";

import { PlayCircleOutlined } from "@ant-design/icons";
import { Switch, Table, Tag, Typography } from "antd";

import { ErrorView, IconAction } from "@/components/common";
import { useDisclosure } from "@/lib/hooks";

import { useAiMcpToolsQuery, useUpdateAiMcpServer } from "../../api/ai-mcp-servers.queries";

import { McpToolCallModal } from "./mcp-tool-call-modal";

import type { IAiMcpServer, IAiMcpTool } from "../../types/ai-mcp-server.types";
import type { TableColumnsType } from "antd";

interface IMcpToolsTableProps {
  server: IAiMcpServer;
  /** Có quyền sửa server: bật/tắt tool ghi và gọi thử. */
  canUpdate: boolean;
}

/** Tool đã đồng bộ của một server. Tool ghi chỉ được agent gọi khi bật "Cho phép". */
export function McpToolsTable({ server, canUpdate }: IMcpToolsTableProps) {
  const tools = useAiMcpToolsQuery(server.uid);
  const updateServer = useUpdateAiMcpServer();
  const callModal = useDisclosure<IAiMcpTool>();

  const toggleWriteTool = (name: string, allowed: boolean) =>
    updateServer.mutate({
      uid: server.uid,
      body: {
        allowedWriteTools: allowed
          ? [...server.allowedWriteTools, name]
          : server.allowedWriteTools.filter((tool) => tool !== name),
      },
    });

  const columns: TableColumnsType<IAiMcpTool> = [
    {
      title: "Tool",
      key: "name",
      render: (_, tool) => (
        <div className="min-w-0">
          <div className="font-mono text-[13px] font-medium">{tool.name}</div>
          {tool.description && (
            <Typography.Paragraph
              type="secondary"
              ellipsis={{ rows: 2, expandable: "collapsible" }}
              className="mt-1! mb-0! text-xs"
            >
              {tool.description}
            </Typography.Paragraph>
          )}
        </div>
      ),
    },
    {
      title: "Loại",
      key: "readOnly",
      width: 100,
      render: (_, { readOnly }) =>
        readOnly ? <Tag color="blue">Chỉ đọc</Tag> : <Tag color="orange">Ghi</Tag>,
    },
    {
      title: "Cho phép",
      key: "allowed",
      width: 100,
      render: (_, tool) => (
        <Switch
          size="small"
          checked={tool.allowed}
          aria-label={`Cho phép agent gọi ${tool.name}`}
          disabled={tool.readOnly || !canUpdate || updateServer.isPending}
          onChange={(checked) => toggleWriteTool(tool.name, checked)}
        />
      ),
    },
    ...(canUpdate
      ? [
          {
            title: "",
            key: "actions",
            width: 56,
            align: "right" as const,
            render: (_: unknown, tool: IAiMcpTool) => (
              <IconAction
                label="Gọi thử"
                ariaLabel={`Gọi thử ${tool.name}`}
                icon={<PlayCircleOutlined />}
                disabledReason={!tool.allowed && "Tool chưa được cho phép"}
                onClick={() => callModal.show(tool)}
              />
            ),
          },
        ]
      : []),
  ];

  if (tools.isError) return <ErrorView error={tools.error} retry={() => void tools.refetch()} />;

  return (
    <>
      <Table<IAiMcpTool>
        rowKey="name"
        size="small"
        columns={columns}
        dataSource={tools.data}
        loading={tools.isPending}
        pagination={false}
        locale={{ emptyText: "Chưa có tool" }}
      />
      <McpToolCallModal
        open={callModal.open}
        serverUid={server.uid}
        tool={callModal.payload}
        onClose={callModal.hide}
      />
    </>
  );
}
