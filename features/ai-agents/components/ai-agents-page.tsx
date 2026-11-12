"use client";

import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DataTable,
  FilterBar,
  IconAction,
  PageHeader,
  SearchInput,
  useConfirmDelete,
} from "@/components/common";
import { Can, Permission, PermissionGuard, useAccess } from "@/features/auth";
import { routes } from "@/lib/constants/routes";
import { useDisclosure } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils/format";

import { useAiAgentsQuery, useDeleteAiAgent } from "../api/ai-agents.queries";
import { AI_AGENT_LIMITS } from "../constants";
import { useAiAgentFilters } from "../hooks/use-ai-agent-filters";

import { AiAgentCreateDrawer } from "./ai-agent-create-drawer";
import { AiAgentStatusSwitch } from "./ai-agent-status-switch";

import type { IAiAgent } from "../types/ai-agent.types";
import type { TableColumnsType } from "antd";

function AiAgentsContent() {
  const router = useRouter();
  const { can } = useAccess();
  const { query, setSearch, setPagination } = useAiAgentFilters();
  const agents = useAiAgentsQuery(query);
  const deleteAgent = useDeleteAiAgent();
  const confirmDelete = useConfirmDelete();
  const createDrawer = useDisclosure();

  const canEdit = can(Permission.aiAgentUpdate);
  const canDelete = can(Permission.aiAgentDelete);

  const handleDelete = (agent: IAiAgent) =>
    confirmDelete({
      title: `Xoá agent "${agent.name}"?`,
      content: "Agent sẽ không nhận hội thoại mới nữa.",
      onConfirm: () => deleteAgent.mutateAsync(agent.uid),
    });

  const columns: TableColumnsType<IAiAgent> = [
    {
      title: "Agent",
      key: "name",
      render: (_, agent) => (
        <div className="min-w-0">
          <Link href={routes.aiAgentDetail(agent.uid)} className="font-medium">
            {agent.name}
          </Link>
          {agent.code && <div className="font-mono text-xs text-black/45">{agent.code}</div>}
        </div>
      ),
    },
    {
      title: "Model",
      key: "model",
      render: (_, { provider, model }) => (
        <span title={model.id}>
          {model.name}
          <Typography.Text type="secondary"> · {provider.name}</Typography.Text>
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: 120,
      render: (_, agent) => <AiAgentStatusSwitch agent={agent} editable={canEdit} />,
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      width: 170,
      render: (updatedAt: string) => formatDateTime(updatedAt),
    },
    {
      title: "",
      key: "actions",
      width: 96,
      align: "right",
      render: (_, agent) => (
        <Space size={4}>
          <IconAction
            label={canEdit ? "Sửa" : "Xem"}
            ariaLabel={`${canEdit ? "Sửa" : "Xem"} agent ${agent.name}`}
            icon={canEdit ? <EditOutlined /> : <EyeOutlined />}
            onClick={() => router.push(routes.aiAgentDetail(agent.uid))}
          />
          {canDelete && (
            <IconAction
              label="Xoá"
              ariaLabel={`Xoá agent ${agent.name}`}
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(agent)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="AI agent"
        extra={
          <Can permission={Permission.aiAgentCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => createDrawer.show()}>
              Thêm agent
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
            maxLength={AI_AGENT_LIMITS.searchMaxLength}
            className="w-full max-w-xs"
          />
        </FilterBar>
        <DataTable<IAiAgent>
          columns={columns}
          result={agents}
          query={query}
          onPaginationChange={setPagination}
          locale={{ emptyText: query.search ? "Không có agent phù hợp" : "Chưa có agent nào" }}
        />
      </Card>
      <AiAgentCreateDrawer open={createDrawer.open} onClose={createDrawer.hide} />
    </>
  );
}

export function AiAgentsPage() {
  return (
    <PermissionGuard permission={Permission.aiAgentRead}>
      <AiAgentsContent />
    </PermissionGuard>
  );
}
