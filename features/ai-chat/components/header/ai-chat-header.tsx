"use client";

import { Button } from "antd";
import { Brain, Expand, History, Shrink, Trash2, X } from "lucide-react";

import { AgentPicker } from "./agent-picker";

import type { IAiChatAgent } from "../../types/ai-chat.types";
import type { ReactNode } from "react";

interface IAiChatHeaderProps {
  agent: IAiChatAgent;
  agents: IAiChatAgent[];
  expanded: boolean;
  /** Có cuộc chat đang mở và không có lượt chạy: mới xoá được. */
  canDeleteThread: boolean;
  onSelectAgent: (agentUid: string) => void;
  onOpenThreads: () => void;
  onOpenMemories: () => void;
  onDeleteThread: () => void;
  onToggleExpanded: () => void;
  onClose: () => void;
}

const HeaderButton = ({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <Button
    type="text"
    size="small"
    icon={icon}
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
  />
);

export function AiChatHeader({
  agent,
  agents,
  expanded,
  canDeleteThread,
  onSelectAgent,
  onOpenThreads,
  onOpenMemories,
  onDeleteThread,
  onToggleExpanded,
  onClose,
}: IAiChatHeaderProps) {
  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3"
      style={{ borderColor: "var(--ac-color-border-secondary)" }}
    >
      <div className="min-w-0 flex-1">
        <AgentPicker agent={agent} agents={agents} onSelect={onSelectAgent} />
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {!expanded && (
          <HeaderButton
            label="Lịch sử trò chuyện"
            icon={<History size={16} />}
            onClick={onOpenThreads}
          />
        )}
        {agent.memoryEnabled && (
          <HeaderButton label="Ghi nhớ" icon={<Brain size={16} />} onClick={onOpenMemories} />
        )}
        <HeaderButton
          label="Xoá cuộc trò chuyện"
          icon={<Trash2 size={16} />}
          disabled={!canDeleteThread}
          onClick={onDeleteThread}
        />
        <HeaderButton
          label={expanded ? "Thu nhỏ khung chat" : "Phóng to khung chat"}
          icon={expanded ? <Shrink size={16} /> : <Expand size={16} />}
          onClick={onToggleExpanded}
        />
        <HeaderButton label="Đóng khung chat" icon={<X size={18} />} onClick={onClose} />
      </div>
    </header>
  );
}
