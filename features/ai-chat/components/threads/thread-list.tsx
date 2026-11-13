"use client";

import { Button, Spin } from "antd";
import { Edit2, SquarePen, Trash2 } from "lucide-react";
import { useState } from "react";

import { useConfirmDelete } from "@/components/common";
import { useLoadMoreOnVisible } from "@/lib/hooks";

import { useChatThreadsQuery, useDeleteChatThread } from "../../api/ai-chat.queries";
import { useAiChatStore } from "../../store/ai-chat.store";

import { ThreadRenameModal } from "./thread-rename-modal";

import type { IAiChatThread } from "../../types/ai-chat.types";

interface IThreadListProps {
  agentUid: string;
  activeThreadUid: string | null;
  /** null là mở cuộc trò chuyện mới. */
  onSelect: (threadUid: string | null) => void;
}

const BUSY_SEPARATOR = "|";

/** Lịch sử trò chuyện với một agent, mới nhất trước; cuộn tới cuối thì tải thêm. */
export function ThreadList({ agentUid, activeThreadUid, onSelect }: IThreadListProps) {
  const threads = useChatThreadsQuery(agentUid);
  const deleteThread = useDeleteChatThread();
  const confirmDelete = useConfirmDelete();
  // Chỉ cần biết cuộc nào đang bận; chọn ra chuỗi để mỗi đoạn chữ stream về không vẽ lại cả danh sách.
  const busyKey = useAiChatStore((state) =>
    state.turns.flatMap(({ threadUid }) => (threadUid ? [threadUid] : [])).join(BUSY_SEPARATOR),
  );
  const busy = new Set(busyKey.split(BUSY_SEPARATOR));
  const [renaming, setRenaming] = useState<IAiChatThread>();
  const loadMoreRef = useLoadMoreOnVisible<HTMLDivElement>({
    hasMore: Boolean(threads.hasNextPage),
    loading: threads.isFetchingNextPage,
    onLoadMore: () => void threads.fetchNextPage(),
  });

  const items = threads.data?.pages.flatMap(({ items }) => items) ?? [];

  const handleDelete = (thread: IAiChatThread) =>
    confirmDelete({
      title: "Xoá cuộc trò chuyện này?",
      onConfirm: () =>
        deleteThread.mutateAsync(thread.uid).then(() => {
          if (thread.uid === activeThreadUid) onSelect(null);
        }),
    });

  return (
    <aside
      className="flex h-full w-64 shrink-0 flex-col border-e"
      style={{
        borderColor: "var(--ac-color-border-secondary)",
        // Token fill là màu trong suốt: phủ lên nền đặc để khi mở đè lên khung chat
        // (lúc thu nhỏ) không nhìn xuyên thấy tin nhắn bên dưới.
        backgroundColor: "var(--ac-color-bg-container)",
        backgroundImage:
          "linear-gradient(var(--ac-color-fill-quaternary), var(--ac-color-fill-quaternary))",
      }}
    >
      <div className="p-2">
        <Button
          type="text"
          block
          icon={<SquarePen size={16} />}
          onClick={() => onSelect(null)}
          className="justify-start! px-3! font-medium"
        >
          Trò chuyện mới
        </Button>
      </div>
      <p
        className="m-0 px-5 pt-2 pb-1 text-xs font-medium"
        style={{ color: "var(--ac-color-text-tertiary)" }}
      >
        Lịch sử trò chuyện
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {threads.isPending && <Spin size="small" className="flex! justify-center py-4" />}
        {threads.isSuccess && items.length === 0 && (
          <p
            className="m-0 px-2 py-6 text-center text-xs"
            style={{ color: "var(--ac-color-text-quaternary)" }}
          >
            Chưa có cuộc trò chuyện nào.
          </p>
        )}
        {items.map((thread) => {
          const active = thread.uid === activeThreadUid;
          return (
            <div
              key={thread.uid}
              className="group mb-1 flex items-center rounded-lg px-1 py-0.5 transition-colors hover:bg-[var(--ac-color-fill-tertiary)]"
              style={active ? { background: "var(--ac-color-fill-secondary)" } : undefined}
            >
              <Button
                type="text"
                title={thread.title}
                onClick={() => onSelect(thread.uid)}
                className={`min-w-0 flex-1 justify-start! overflow-hidden px-2! text-start text-xs! hover:bg-transparent! ${active ? "font-medium" : ""}`}
              >
                <span className="truncate">{thread.title}</span>
              </Button>
              <div className="hidden items-center pe-1 group-hover:flex">
                <Button
                  type="text"
                  size="small"
                  icon={<Edit2 size={13} />}
                  aria-label="Đổi tên"
                  title="Đổi tên"
                  onClick={() => setRenaming(thread)}
                  className="size-6! min-w-6! p-0!"
                />
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<Trash2 size={13} />}
                  aria-label="Xoá cuộc trò chuyện"
                  title="Xoá cuộc trò chuyện"
                  disabled={busy.has(thread.uid)}
                  onClick={() => handleDelete(thread)}
                  className="size-6! min-w-6! p-0!"
                />
              </div>
            </div>
          );
        })}
        {threads.isFetchingNextPage && <Spin size="small" className="flex! justify-center py-2" />}
        <div ref={loadMoreRef} className="h-px" />
      </div>
      <ThreadRenameModal thread={renaming} onClose={() => setRenaming(undefined)} />
    </aside>
  );
}
