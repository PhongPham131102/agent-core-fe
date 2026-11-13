"use client";

import { Button, Empty, Modal, Spin, Typography } from "antd";
import { Trash2 } from "lucide-react";

import { ErrorView, useConfirmDelete } from "@/components/common";
import { formatDateTime } from "@/lib/utils/format";

import { useAiMemoriesQuery, useDeleteAiMemory } from "../api/ai-memories.queries";

import type { IAiMemory } from "../types/ai-memory.types";

const MODAL_WIDTH = 560;

interface IAiMemoriesModalProps {
  open: boolean;
  agentUid: string;
  onClose: () => void;
}

function MemoryList({ agentUid }: { agentUid: string }) {
  const memories = useAiMemoriesQuery(agentUid);
  const deleteMemory = useDeleteAiMemory();
  const confirmDelete = useConfirmDelete();

  const handleDelete = (memory: IAiMemory) =>
    confirmDelete({
      title: "Xoá ghi nhớ này?",
      onConfirm: () => deleteMemory.mutateAsync(memory.uid),
    });

  if (memories.isPending) return <Spin className="flex! justify-center py-6" />;
  if (memories.isError) {
    return <ErrorView error={memories.error} retry={() => void memories.refetch()} />;
  }
  if (memories.data.length === 0) return <Empty description="Chưa có ghi nhớ nào." />;

  return memories.data.map((memory) => (
    <div
      key={memory.uid}
      className="mb-2 flex items-start justify-between gap-3 rounded-lg border p-3"
      style={{ borderColor: "var(--ac-color-border-secondary)" }}
    >
      <div className="min-w-0">
        <p className="m-0 text-sm break-words whitespace-pre-wrap">{memory.content}</p>
        <Typography.Text type="secondary" className="text-xs">
          {formatDateTime(memory.createdAt)}
        </Typography.Text>
      </div>
      <Button
        type="text"
        icon={<Trash2 size={16} />}
        aria-label="Xoá ghi nhớ"
        title="Xoá ghi nhớ"
        onClick={() => handleDelete(memory)}
      />
    </div>
  ));
}

/** Những gì agent đã ghi nhớ về người dùng hiện tại; xem và xoá. */
export function AiMemoriesModal({ open, agentUid, onClose }: IAiMemoriesModalProps) {
  return (
    <Modal
      title="Ghi nhớ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={MODAL_WIDTH}
      destroyOnHidden
    >
      <div className="max-h-[60vh] overflow-y-auto">
        <MemoryList agentUid={agentUid} />
      </div>
    </Modal>
  );
}
