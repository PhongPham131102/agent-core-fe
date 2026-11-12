"use client";

import { Card, Drawer, Skeleton, Tag, Typography } from "antd";

import { ErrorView } from "@/components/common";

import { useAiSkillQuery } from "../../api/ai-skills.queries";
import { skillTitle } from "../../skill-title";
import { SkillAvatar } from "../skill-avatar";

import type { IAiSkillDetail } from "../../types/ai-skill.types";

const DRAWER_WIDTH = 720;

interface IAiSkillDetailDrawerProps {
  /** `uid` của skill đang xem; không có là đóng. */
  uid?: string;
  onClose: () => void;
}

function SkillDetail({ skill }: { skill: IAiSkillDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-start gap-3">
          <SkillAvatar iconUrl={skill.iconUrl} size={48} />
          <div className="min-w-0">
            <Typography.Title level={5} className="mb-0!">
              {skillTitle(skill)}
            </Typography.Title>
            <div className="font-mono text-xs text-black/45">{skill.code}</div>
            {skill.description && (
              <Typography.Paragraph className="mt-2! mb-0!">
                {skill.description}
              </Typography.Paragraph>
            )}
          </div>
        </div>
      </Card>
      <Card title={`File (${skill.files.length})`}>
        <div className="flex flex-wrap gap-2">
          {skill.files.map((path) => (
            <Tag key={path} className="me-0! font-mono">
              {path}
            </Tag>
          ))}
        </div>
      </Card>
      <Card title="Nội dung">
        <pre className="m-0 font-mono text-[13px] break-words whitespace-pre-wrap">
          {skill.content}
        </pre>
      </Card>
    </div>
  );
}

function SkillDetailLoader({ uid }: { uid: string }) {
  const skill = useAiSkillQuery(uid);

  if (skill.isPending) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (skill.isError) return <ErrorView error={skill.error} retry={() => void skill.refetch()} />;
  return <SkillDetail skill={skill.data} />;
}

/** Xem một skill: thông tin, danh sách file và nội dung agent sẽ nhận. */
export function AiSkillDetailDrawer({ uid, onClose }: IAiSkillDetailDrawerProps) {
  return (
    <Drawer
      title="Chi tiết skill"
      open={Boolean(uid)}
      onClose={onClose}
      size={DRAWER_WIDTH}
      destroyOnHidden
      styles={{ body: { background: "var(--ac-color-bg-layout)" } }}
    >
      {uid && <SkillDetailLoader uid={uid} />}
    </Drawer>
  );
}
