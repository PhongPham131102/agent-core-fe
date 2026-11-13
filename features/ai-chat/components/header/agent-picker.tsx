"use client";

import { Button } from "antd";
import { ChevronDown } from "lucide-react";
import { useRef, useState } from "react";

import { useClickOutside } from "@/lib/hooks";

import { agentInitials } from "../../model/agent-initials";

import type { IAiChatAgent } from "../../types/ai-chat.types";

interface IAgentPickerProps {
  agent: IAiChatAgent;
  agents: IAiChatAgent[];
  onSelect: (agentUid: string) => void;
}

const AgentBadge = ({ name, small = false }: { name: string; small?: boolean }) => (
  <span
    className={`flex shrink-0 items-center justify-center font-semibold text-white ${
      small ? "size-7 rounded-md text-[10px]" : "size-8 rounded-lg text-xs"
    }`}
    style={{ background: "var(--ac-color-primary)" }}
  >
    {agentInitials(name)}
  </span>
);

/** Agent đang chat ở đầu khung; bấm để đổi agent. */
export function AgentPicker({ agent, agents, onSelect }: IAgentPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useClickOutside(rootRef, open, () => setOpen(false));

  return (
    <div ref={rootRef} className="relative min-w-0">
      <Button
        type="text"
        aria-label="Chọn agent khác"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex! h-11! max-w-full items-center gap-2! px-1!"
      >
        <AgentBadge name={agent.name} />
        <span className="min-w-0 truncate text-sm font-semibold">{agent.name}</span>
        <ChevronDown
          size={14}
          className="shrink-0"
          style={{ color: "var(--ac-color-text-tertiary)" }}
        />
      </Button>
      {open && (
        <div
          role="listbox"
          aria-label="Agent"
          className="absolute start-0 top-full z-30 mt-2 max-h-64 w-64 max-w-[calc(100vw-48px)] overflow-y-auto rounded-xl border p-1.5 shadow-xl"
          style={{
            background: "var(--ac-color-bg-elevated)",
            borderColor: "var(--ac-color-border-secondary)",
          }}
        >
          {agents.map((item) => (
            <Button
              key={item.uid}
              type="text"
              role="option"
              aria-selected={item.uid === agent.uid}
              onClick={() => {
                onSelect(item.uid);
                setOpen(false);
              }}
              className="flex! h-auto! w-full items-center justify-start! gap-2! px-2! py-2!"
              style={
                item.uid === agent.uid ? { background: "var(--ac-color-primary-bg)" } : undefined
              }
            >
              <AgentBadge name={item.name} small />
              <span className="min-w-0 truncate text-start text-sm">{item.name}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
