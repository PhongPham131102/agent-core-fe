"use client";

import { DeleteOutlined, EditOutlined, FolderOpenOutlined, PlusOutlined } from "@ant-design/icons";
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
import { formatDateTime } from "@/lib/utils/format";

import { useAiKnowledgeBasesQuery, useDeleteAiKnowledgeBase } from "../api/ai-knowledge.queries";
import { AI_KNOWLEDGE_LIMITS } from "../constants";

import { KnowledgeBaseFormModal } from "./base-form/knowledge-base-form-modal";
import { KnowledgeBaseDrawer } from "./knowledge-base-drawer";

import type { IAiKnowledgeBase } from "../types/ai-knowledge.types";
import type { TableColumnsType } from "antd";

function AiKnowledgeBasesContent() {
  const { can } = useAccess();
  const { query, setSearch, setPagination } = useSearchListParams();
  const bases = useAiKnowledgeBasesQuery(query);
  const deleteBase = useDeleteAiKnowledgeBase();
  const confirmDelete = useConfirmDelete();
  const form = useDisclosure<IAiKnowledgeBase>();
  const drawer = useDisclosure<IAiKnowledgeBase>();

  const canEdit = can(Permission.aiKnowledgeUpdate);
  const canDelete = can(Permission.aiKnowledgeDelete);

  const handleDelete = (base: IAiKnowledgeBase) =>
    confirmDelete({
      title: `Xoá kho "${base.name}" cùng toàn bộ tài liệu?`,
      onConfirm: () => deleteBase.mutateAsync(base.uid),
    });

  const columns: TableColumnsType<IAiKnowledgeBase> = [
    {
      title: "Kho",
      key: "name",
      render: (_, base) => (
        <Typography.Link strong onClick={() => drawer.show(base)}>
          {base.name}
        </Typography.Link>
      ),
    },
    { title: "Mô tả", dataIndex: "description", ellipsis: true },
    { title: "Tài liệu", dataIndex: "documentCount", width: 100, align: "right" },
    { title: "Số đoạn", dataIndex: "chunkCount", width: 100, align: "right" },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      width: 170,
      render: (updatedAt: string) => formatDateTime(updatedAt),
    },
    {
      title: "",
      key: "actions",
      width: 132,
      align: "right",
      render: (_, base) => (
        <Space size={4}>
          <IconAction
            label="Tài liệu"
            ariaLabel={`Mở tài liệu kho ${base.name}`}
            icon={<FolderOpenOutlined />}
            onClick={() => drawer.show(base)}
          />
          {canEdit && (
            <IconAction
              label="Sửa"
              ariaLabel={`Sửa kho ${base.name}`}
              icon={<EditOutlined />}
              onClick={() => form.show(base)}
            />
          )}
          {canDelete && (
            <IconAction
              label="Xoá"
              ariaLabel={`Xoá kho ${base.name}`}
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(base)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Kho tri thức"
        extra={
          <>
            <Can permission={Permission.aiKnowledgeCreate}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => form.show()}>
                Tạo kho
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
            placeholder="Tìm theo tên hoặc mô tả"
            maxLength={AI_KNOWLEDGE_LIMITS.searchMaxLength}
            className="w-full max-w-xs"
          />
        </FilterBar>
        <DataTable<IAiKnowledgeBase>
          columns={columns}
          result={bases}
          query={query}
          onPaginationChange={setPagination}
          locale={{ emptyText: query.search ? "Không có kho phù hợp" : "Chưa có kho nào" }}
        />
      </Card>
      <KnowledgeBaseFormModal open={form.open} base={form.payload} onClose={form.hide} />
      <KnowledgeBaseDrawer open={drawer.open} base={drawer.payload} onClose={drawer.hide} />
    </>
  );
}

export function AiKnowledgeBasesPage() {
  return (
    <PermissionGuard permission={Permission.aiKnowledgeRead}>
      <AiKnowledgeBasesContent />
    </PermissionGuard>
  );
}
