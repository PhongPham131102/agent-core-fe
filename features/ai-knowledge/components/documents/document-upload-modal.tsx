"use client";

import { App, Form } from "antd";

import { FilePicker, FormActions, FormModal } from "@/components/common";
import { fieldErrorHandler } from "@/lib/form";

import { useUploadKnowledgeDocuments } from "../../api/ai-knowledge.queries";
import { KNOWLEDGE_FILE_ACCEPT, validateKnowledgeFiles } from "../../constants";
import { DOCUMENT_FIELD_BY_ERROR } from "../../errors";
import { KnowledgeDocumentStatus } from "../../types/ai-knowledge.types";

import type { IAiKnowledgeDocument } from "../../types/ai-knowledge.types";
import type { Rule } from "antd/es/form";

interface IDocumentUploadModalProps {
  open: boolean;
  baseUid: string;
  onClose: () => void;
}

interface IDocumentUploadValues {
  files?: File[];
}

const fileRules: Rule[] = [
  { required: true, message: "Vui lòng chọn ít nhất một file" },
  {
    validator: (_rule, files: File[] = []) => {
      const error = validateKnowledgeFiles(files);
      return error ? Promise.reject(new Error(error)) : Promise.resolve();
    },
  },
];

function DocumentUploadForm({ baseUid, onClose }: Omit<IDocumentUploadModalProps, "open">) {
  const { message } = App.useApp();
  const [form] = Form.useForm<IDocumentUploadValues>();
  const upload = useUploadKnowledgeDocuments();

  // BE xử lý từng file riêng: file lỗi vẫn được lưu với trạng thái lỗi, nên báo theo số file.
  const reportResult = (documents: IAiKnowledgeDocument[]) => {
    const failed = documents.filter(({ status }) => status.id === KnowledgeDocumentStatus.failed);
    if (failed.length === 0) void message.success(`Đã thêm ${documents.length} tài liệu`);
    else void message.warning(`${failed.length}/${documents.length} file xử lý lỗi`);
    onClose();
  };

  const handleFinish = ({ files = [] }: IDocumentUploadValues) =>
    upload.mutate(
      { uid: baseUid, files },
      { onSuccess: reportResult, onError: fieldErrorHandler(form, DOCUMENT_FIELD_BY_ERROR) },
    );

  return (
    <Form<IDocumentUploadValues>
      form={form}
      layout="vertical"
      disabled={upload.isPending}
      onFinish={handleFinish}
    >
      <Form.Item label="Tài liệu" name="files" required rules={fileRules}>
        <FilePicker accept={KNOWLEDGE_FILE_ACCEPT} multiple text="Chọn hoặc kéo file vào đây" />
      </Form.Item>
      <FormActions onCancel={onClose} submitting={upload.isPending} submitText="Tải lên" />
    </Form>
  );
}

export function DocumentUploadModal({ open, baseUid, onClose }: IDocumentUploadModalProps) {
  return (
    <FormModal title="Thêm tài liệu" open={open} onClose={onClose}>
      <DocumentUploadForm baseUid={baseUid} onClose={onClose} />
    </FormModal>
  );
}
