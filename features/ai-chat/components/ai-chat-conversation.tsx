"use client";

import { WifiOff } from "lucide-react";

import { useConfirmDelete } from "@/components/common";
import { AiMemoriesModal } from "@/features/ai-memories";
import { useDisclosure } from "@/lib/hooks";

import { useDeleteChatThread } from "../api/ai-chat.queries";
import { ChatConnection, useAiChatStore } from "../store/ai-chat.store";

import { ChatComposer } from "./composer/chat-composer";
import { AiChatHeader } from "./header/ai-chat-header";
import { ChatErrorBanner } from "./messages/chat-error-banner";
import { MessageList } from "./messages/message-list";

import type { IAiChatAgent } from "../types/ai-chat.types";

interface IAiChatConversationProps {
  agent: IAiChatAgent;
  agents: IAiChatAgent[];
  threadUid: string | null;
  expanded: boolean;
  onSelectAgent: (agentUid: string) => void;
  onOpenThreads: () => void;
  onToggleExpanded: () => void;
  onClose: () => void;
}

/** Header, tin nhắn và ô soạn của cuộc trò chuyện đang mở (null là cuộc mới). */
export function AiChatConversation({
  agent,
  agents,
  threadUid,
  expanded,
  onSelectAgent,
  onOpenThreads,
  onToggleExpanded,
  onClose,
}: IAiChatConversationProps) {
  const selectThread = useAiChatStore.use.selectThread();
  const chatError = useAiChatStore.use.chatError();
  const disconnected = useAiChatStore.use.connection() === ChatConnection.disconnected;
  const setChatError = useAiChatStore.use.setChatError();
  // Cuộc trò chuyện mới: lượt của agent này đang chờ ack (chưa có threadUid).
  const turn = useAiChatStore.use
    .turns()
    .find((item) =>
      threadUid
        ? item.threadUid === threadUid
        : item.threadUid === null && item.agentUid === agent.uid,
    );
  const deleteThread = useDeleteChatThread();
  const confirmDelete = useConfirmDelete();
  const memories = useDisclosure();

  const handleDelete = () =>
    threadUid &&
    confirmDelete({
      title: "Xoá cuộc trò chuyện này?",
      onConfirm: () => deleteThread.mutateAsync(threadUid).then(() => selectThread(null)),
    });

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <AiChatHeader
        agent={agent}
        agents={agents}
        expanded={expanded}
        canDeleteThread={Boolean(threadUid) && !turn}
        onSelectAgent={onSelectAgent}
        onOpenThreads={onOpenThreads}
        onOpenMemories={memories.show}
        onDeleteThread={handleDelete}
        onToggleExpanded={onToggleExpanded}
        onClose={onClose}
      />
      <div className={`flex min-h-0 flex-1 flex-col pt-4 ${expanded ? "px-6" : "px-4"}`}>
        <MessageList agent={agent} threadUid={threadUid} turn={turn} />
        {chatError && <ChatErrorBanner message={chatError} onClose={() => setChatError(null)} />}
      </div>
      <div className={`shrink-0 ${expanded ? "px-6 pt-3 pb-5" : "p-3"}`}>
        {disconnected && (
          <p
            role="status"
            className="m-0 mb-2 flex items-center gap-1.5 text-xs"
            style={{ color: "var(--ac-color-warning)" }}
          >
            <WifiOff size={13} />
            Mất kết nối
          </p>
        )}
        <ChatComposer agent={agent} threadUid={threadUid} answering={Boolean(turn)} />
      </div>
      <AiMemoriesModal open={memories.open} agentUid={agent.uid} onClose={memories.hide} />
    </section>
  );
}
