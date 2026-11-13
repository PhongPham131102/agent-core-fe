"use client";

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Card, Popconfirm, Space, Tag, Typography } from "antd";

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
import { formatDateTime } from "@/lib/utils/format";

import { useAiAgentsQuery, useDeleteAiAgent, useSyncAgentVectors } from "../api/ai-agents.queries";
import { AI_AGENT_LIMITS } from "../constants";

import { AiAgentFormDrawer } from "./ai-agent-form-drawer";
import { AiAgentStatusSwitch } from "./ai-agent-status-switch";

import type { IAiAgent } from "../types/ai-agent.types";
import type { TableColumnsType } from "antd";

function AiAgentsContent() {
  const { can } = useAccess();
  const { query, setSearch, setPagination } = useSearchListParams();
  const agents = useAiAgentsQuery(query);
  const deleteAgent = useDeleteAiAgent();
  const syncVectors = useSyncAgentVectors();
  const confirmDelete = useConfirmDelete();
  const drawer = useDisclosure<IAiAgent>();

  const canEdit = can(Permission.aiAgentUpdate);
  const canDelete = can(Permission.aiAgentDelete);

  const handleDelete = (agent: IAiAgent) =>
    confirmDelete({
      title: `Xoá agent "${agent.name}"?`,
      onConfirm: () => deleteAgent.mutateAsync(agent.uid),
    });

  const columns: TableColumnsType<IAiAgent> = [
    {
      title: "Agent",
      key: "name",
      render: (_, agent) => (
        <div className="min-w-0">
          <Typography.Link strong onClick={() => drawer.show(agent)}>
            {agent.name}
          </Typography.Link>
          <div className="font-mono text-xs text-black/45">{agent.code}</div>
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
      title: "Skill",
      key: "skills",
      render: (_, { skills }) => (
        <div className="flex flex-wrap gap-1">
          {skills.map(({ code, name }) => (
            <Tag key={code} className="me-0!">
              {name}
            </Tag>
          ))}
        </div>
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
            onClick={() => drawer.show(agent)}
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
          <>
            <Can permission={Permission.aiAgentUpdate}>
              <Popconfirm
                title="Dựng lại toàn bộ vector?"
                okText="Dựng lại"
                cancelText="Huỷ"
                onConfirm={() => syncVectors.mutateAsync().catch(() => undefined)}
              >
                <Button icon={<SyncOutlined />} loading={syncVectors.isPending}>
                  Dựng lại vector
                </Button>
              </Popconfirm>
            </Can>
            <Can permission={Permission.aiAgentCreate}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => drawer.show()}>
                Thêm agent
              </Button>
            </Can>
          </>
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
      <AiAgentFormDrawer open={drawer.open} agent={drawer.payload} onClose={drawer.hide} />
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
