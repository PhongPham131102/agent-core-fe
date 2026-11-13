"use client";

import { Empty, Spin } from "antd";
import { useEffect, useState } from "react";

import { ErrorView } from "@/components/common";

import { useChatAgentsQuery } from "../api/ai-chat.queries";
import { useAiChatStore } from "../store/ai-chat.store";

import { AiChatConversation } from "./ai-chat-conversation";
import { ThreadList } from "./threads/thread-list";

interface IAiChatPanelProps {
  expanded: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
}

/**
 * Nội dung khung chat. Thu nhỏ: lịch sử trò chuyện mở đè lên bằng nút ở header.
 * Phóng to: lịch sử trò chuyện luôn hiện bên trái.
 */
export function AiChatPanel({ expanded, onToggleExpanded, onClose }: IAiChatPanelProps) {
  const agents = useChatAgentsQuery();
  const agentUid = useAiChatStore.use.agentUid();
  const threadUid = useAiChatStore.use.threadUid();
  const selectAgent = useAiChatStore.use.selectAgent();
  const selectThread = useAiChatStore.use.selectThread();
  const [threadsOpen, setThreadsOpen] = useState(false);

  const agent = agents.data?.find(({ uid }) => uid === agentUid);
  const firstAgentUid = agents.data?.[0]?.uid;

  // Chưa chọn agent, hoặc agent đã chọn không còn bật: mở agent đầu tiên.
  useEffect(() => {
    if (agents.isSuccess && !agent && firstAgentUid) selectAgent(firstAgentUid);
  }, [agents.isSuccess, agent, firstAgentUid, selectAgent]);

  const pickThread = (uid: string | null) => {
    selectThread(uid);
    setThreadsOpen(false);
  };

  if (agents.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spin />
      </div>
    );
  }
  if (agents.isError) return <ErrorView error={agents.error} retry={() => void agents.refetch()} />;
  if (!agent) return <Empty className="m-auto" description="Chưa có agent nào đang hoạt động." />;

  const threadList = (
    <ThreadList agentUid={agent.uid} activeThreadUid={threadUid} onSelect={pickThread} />
  );

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden">
      {expanded && threadList}
      <AiChatConversation
        agent={agent}
        agents={agents.data}
        threadUid={threadUid}
        expanded={expanded}
        onSelectAgent={(uid) => {
          selectAgent(uid);
          setThreadsOpen(false);
        }}
        onOpenThreads={() => setThreadsOpen(true)}
        onToggleExpanded={() => {
          setThreadsOpen(false);
          onToggleExpanded();
        }}
        onClose={onClose}
      />
      {threadsOpen && !expanded && (
        <div className="absolute inset-x-0 top-14 bottom-0 z-20 flex">
          {threadList}
          <button
            type="button"
            aria-label="Đóng lịch sử trò chuyện"
            className="h-full flex-1 cursor-default border-0"
            style={{ background: "var(--ac-color-bg-mask)" }}
            onClick={() => setThreadsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
