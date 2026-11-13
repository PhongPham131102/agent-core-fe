"use client";

import { Button, Spin } from "antd";
import { ArrowDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ErrorView } from "@/components/common";
import { useLoadMoreOnVisible } from "@/lib/hooks";

import { useChatMessagesQuery } from "../../api/ai-chat.queries";
import { flattenMessages, toViewMessage, withLiveTurn } from "../../model/chat-messages";

import { ChatEmptyState } from "./chat-empty-state";
import { MessageBubble } from "./message-bubble";

import type { IChatTurn } from "../../model/chat-turn";
import type { IAiChatAgent } from "../../types/ai-chat.types";

/** Cách đáy bao nhiêu px thì vẫn coi là đang ở cuối cuộc trò chuyện. */
const AT_BOTTOM_THRESHOLD_PX = 24;

interface IMessageListProps {
  agent: IAiChatAgent;
  threadUid: string | null;
  /** Lượt đang chạy của cuộc trò chuyện này, nếu có. */
  turn?: IChatTurn;
}

/**
 * Tin mới nhất ở dưới cùng. Dùng `flex-col-reverse` nên phần tử đầu là tin mới nhất và
 * trình duyệt tự giữ đáy khi có chữ mới; cuộn lên trên cùng thì tải tin cũ.
 */
export function MessageList({ agent, threadUid, turn }: IMessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const messages = useChatMessagesQuery(threadUid);
  const olderRef = useLoadMoreOnVisible<HTMLDivElement>({
    hasMore: Boolean(messages.hasNextPage),
    loading: messages.isFetchingNextPage,
    onLoadMore: () => void messages.fetchNextPage(),
  });

  // Lịch sử chỉ đổi khi tải trang mới; mỗi đoạn chữ stream về chỉ thay phần lượt đang chạy.
  const saved = useMemo(() => flattenMessages(messages.data), [messages.data]);
  const history = useMemo(() => saved.map(toViewMessage), [saved]);
  const view = withLiveTurn(history, saved[0], turn);

  // Vừa gửi tin thì về cuối cuộc trò chuyện.
  useEffect(() => {
    if (turn?.id) listRef.current?.scrollTo({ top: 0 });
  }, [turn?.id]);

  if (threadUid && messages.isPending) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Spin />
      </div>
    );
  }
  if (messages.isError) {
    return <ErrorView error={messages.error} retry={() => void messages.refetch()} />;
  }
  if (view.length === 0) return <ChatEmptyState agentName={agent.name} />;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={listRef}
        // Ở flex-col-reverse, scrollTop = 0 là đáy và âm dần khi cuộn lên.
        onScroll={({ currentTarget }) =>
          setAtBottom(Math.abs(currentTarget.scrollTop) < AT_BOTTOM_THRESHOLD_PX)
        }
        style={{ overflowAnchor: atBottom ? "none" : "auto" }}
        className="flex min-h-0 flex-1 flex-col-reverse gap-3 overflow-y-auto pe-1 pb-2"
      >
        {view.map((message) => (
          <MessageBubble key={message.key} message={message} skills={agent.skills} />
        ))}
        {messages.isFetchingNextPage && <Spin size="small" className="flex! justify-center" />}
        <div ref={olderRef} className="h-px shrink-0" />
      </div>
      {!atBottom && (
        <Button
          shape="circle"
          icon={<ArrowDown size={16} />}
          aria-label="Xuống tin mới nhất"
          title="Xuống tin mới nhất"
          onClick={() => listRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute! inset-x-0 bottom-3 z-10 mx-auto flex! items-center justify-center shadow-md"
        />
      )}
    </div>
  );
}
