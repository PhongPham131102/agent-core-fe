"use client";

import { Form, Input } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { changedFields, hasChanges, zodRule } from "@/lib/form";

import { useCreateAiKnowledgeBase, useUpdateAiKnowledgeBase } from "../../api/ai-knowledge.queries";
import { AI_KNOWLEDGE_LIMITS } from "../../constants";
import { knowledgeBaseSchema } from "../../schemas/ai-knowledge-base.schema";

import type { KnowledgeBaseValues } from "../../schemas/ai-knowledge-base.schema";
import type { IAiKnowledgeBase } from "../../types/ai-knowledge.types";

interface IKnowledgeBaseFormModalProps {
  open: boolean;
  /** Có giá trị là đang sửa; không có là tạo mới. */
  base?: IAiKnowledgeBase;
  onClose: () => void;
}

const fields = knowledgeBaseSchema.shape;

function KnowledgeBaseForm({ base, onClose }: Omit<IKnowledgeBaseFormModalProps, "open">) {
  const createBase = useCreateAiKnowledgeBase();
  const updateBase = useUpdateAiKnowledgeBase();
  const submitting = createBase.isPending || updateBase.isPending;

  const handleFinish = (values: KnowledgeBaseValues) => {
    const { name, description = "" } = knowledgeBaseSchema.parse(values);

    if (base) {
      const body = changedFields(base, { name, description });
      if (!hasChanges(body)) return onClose();
      updateBase.mutate({ uid: base.uid, body }, { onSuccess: onClose });
      return;
    }
    createBase.mutate({ name, description: description || undefined }, { onSuccess: onClose });
  };

  return (
    <Form<KnowledgeBaseValues>
      layout="vertical"
      initialValues={{ name: base?.name, description: base?.description }}
      disabled={submitting}
      onFinish={handleFinish}
    >
      <Form.Item label="Tên kho" name="name" required rules={[zodRule(fields.name)]}>
        <Input
          maxLength={AI_KNOWLEDGE_LIMITS.nameMaxLength}
          autoFocus
          placeholder="Ví dụ: Chính sách đổi trả"
        />
      </Form.Item>
      <Form.Item label="Mô tả" name="description" rules={[zodRule(fields.description)]}>
        <Input.TextArea
          maxLength={AI_KNOWLEDGE_LIMITS.descriptionMaxLength}
          autoSize={{ minRows: 2, maxRows: 4 }}
          showCount
        />
      </Form.Item>
      <FormActions
        onCancel={onClose}
        submitting={submitting}
        submitText={base ? "Lưu thay đổi" : "Tạo kho"}
      />
    </Form>
  );
}

export function KnowledgeBaseFormModal({ open, base, onClose }: IKnowledgeBaseFormModalProps) {
  return (
    <FormModal title={base ? "Sửa kho tri thức" : "Tạo kho tri thức"} open={open} onClose={onClose}>
      <KnowledgeBaseForm base={base} onClose={onClose} />
    </FormModal>
  );
}
