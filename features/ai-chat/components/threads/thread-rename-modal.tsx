"use client";

import { Input, Modal } from "antd";
import { useState } from "react";

import { useRenameChatThread } from "../../api/ai-chat.queries";
import { AI_CHAT_LIMITS } from "../../constants";

import type { IAiChatThread } from "../../types/ai-chat.types";

interface IThreadRenameModalProps {
  thread?: IAiChatThread;
  onClose: () => void;
}

function RenameForm({ thread, onClose }: { thread: IAiChatThread; onClose: () => void }) {
  const rename = useRenameChatThread();
  const [title, setTitle] = useState(thread.title);
  const next = title.trim();

  const save = () => {
    if (!next) return;
    if (next === thread.title) return onClose();
    rename.mutate({ threadUid: thread.uid, title: next }, { onSuccess: onClose });
  };

  return (
    <Modal
      open
      title="Đổi tên"
      okText="Lưu"
      cancelText="Huỷ"
      onOk={save}
      onCancel={onClose}
      confirmLoading={rename.isPending}
      okButtonProps={{ disabled: !next }}
    >
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onPressEnter={save}
        maxLength={AI_CHAT_LIMITS.titleMaxLength}
        placeholder="Tên cuộc trò chuyện"
        autoFocus
      />
    </Modal>
  );
}

/** Đổi tên một cuộc trò chuyện; mở khi có `thread`. */
export function ThreadRenameModal({ thread, onClose }: IThreadRenameModalProps) {
  return thread ? <RenameForm key={thread.uid} thread={thread} onClose={onClose} /> : null;
}
