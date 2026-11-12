"use client";

import { Switch, Tag } from "antd";

import { useUpdateAiAgent } from "../api/ai-agents.queries";

import type { IAiAgent } from "../types/ai-agent.types";

interface IAiAgentStatusSwitchProps {
  agent: IAiAgent;
  /** Không có quyền sửa thì chỉ hiện nhãn trạng thái. */
  editable: boolean;
}

/** Bật/tắt agent ngay trên bảng, không cần mở form. */
export function AiAgentStatusSwitch({ agent, editable }: IAiAgentStatusSwitchProps) {
  const updateAgent = useUpdateAiAgent("Đã cập nhật trạng thái agent");
  const active = agent.isActive;

  if (!editable) {
    return active ? <Tag color="green">Đang bật</Tag> : <Tag>Đã tắt</Tag>;
  }
  return (
    <Switch
      size="small"
      checked={active}
      loading={updateAgent.isPending}
      aria-label={`${active ? "Tắt" : "Bật"} agent ${agent.name}`}
      onChange={(checked) => updateAgent.mutate({ uid: agent.uid, body: { isActive: checked } })}
    />
  );
}
