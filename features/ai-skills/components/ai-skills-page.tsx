"use client";

import { CloudUploadOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Space, Typography } from "antd";
import { useState } from "react";

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

import { useAiSkillsQuery, useDeleteAiSkill } from "../api/ai-skills.queries";
import { AI_SKILL_LIMITS } from "../constants";
import { skillTitle } from "../skill-title";

import { AiSkillDetailDrawer } from "./detail/ai-skill-detail-drawer";
import { SkillAvatar } from "./skill-avatar";
import { AiSkillUploadModal } from "./upload/ai-skill-upload-modal";

import type { IAiSkill } from "../types/ai-skill.types";
import type { TableColumnsType } from "antd";

function AiSkillsContent() {
  const { can } = useAccess();
  const { query, setSearch, setPagination } = useSearchListParams();
  const skills = useAiSkillsQuery(query);
  const deleteSkill = useDeleteAiSkill();
  const confirmDelete = useConfirmDelete();
  const upload = useDisclosure<IAiSkill>();
  const [viewingUid, setViewingUid] = useState<string>();

  const canUpdate = can(Permission.aiSkillUpdate);
  const canDelete = can(Permission.aiSkillDelete);

  const handleDelete = (skill: IAiSkill) =>
    confirmDelete({
      title: `Xoá skill "${skillTitle(skill)}"?`,
      onConfirm: () => deleteSkill.mutateAsync(skill.uid),
    });

  const columns: TableColumnsType<IAiSkill> = [
    {
      title: "Skill",
      key: "name",
      render: (_, skill) => (
        <div className="flex min-w-0 items-center gap-3">
          <SkillAvatar iconUrl={skill.iconUrl} />
          <div className="min-w-0">
            <Typography.Link strong onClick={() => setViewingUid(skill.uid)}>
              {skillTitle(skill)}
            </Typography.Link>
            <div className="font-mono text-xs text-black/45">{skill.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Số file",
      key: "files",
      width: 90,
      align: "right",
      render: (_, { files }) => files.length,
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
      width: 132,
      align: "right",
      render: (_, skill) => {
        const name = skillTitle(skill);
        return (
          <Space size={4}>
            <IconAction
              label="Xem"
              ariaLabel={`Xem skill ${name}`}
              icon={<EyeOutlined />}
              onClick={() => setViewingUid(skill.uid)}
            />
            {canUpdate && (
              <IconAction
                label="Thay file"
                ariaLabel={`Thay file skill ${name}`}
                icon={<CloudUploadOutlined />}
                onClick={() => upload.show(skill)}
              />
            )}
            {canDelete && (
              <IconAction
                label="Xoá"
                ariaLabel={`Xoá skill ${name}`}
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDelete(skill)}
              />
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Skill"
        extra={
          <Can permission={Permission.aiSkillCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => upload.show()}>
              Tải skill lên
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
            maxLength={AI_SKILL_LIMITS.searchMaxLength}
            className="w-full max-w-xs"
          />
        </FilterBar>
        <DataTable<IAiSkill>
          columns={columns}
          result={skills}
          query={query}
          onPaginationChange={setPagination}
          locale={{ emptyText: query.search ? "Không có skill phù hợp" : "Chưa có skill nào" }}
        />
      </Card>
      <AiSkillUploadModal open={upload.open} skill={upload.payload} onClose={upload.hide} />
      <AiSkillDetailDrawer uid={viewingUid} onClose={() => setViewingUid(undefined)} />
    </>
  );
}

export function AiSkillsPage() {
  return (
    <PermissionGuard permission={Permission.aiSkillRead}>
      <AiSkillsContent />
    </PermissionGuard>
  );
}
