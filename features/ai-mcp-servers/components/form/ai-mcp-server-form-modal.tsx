"use client";

import { Form, Input } from "antd";

import { FormActions, FormModal } from "@/components/common";
import { fieldErrorHandler, hasChanges, zodRule } from "@/lib/form";

import { useCreateAiMcpServer, useUpdateAiMcpServer } from "../../api/ai-mcp-servers.queries";
import { AI_MCP_SERVER_LIMITS as L } from "../../constants";
import { AiMcpServerErrorCode } from "../../errors";
import { toCreateBody, toFormValues, toUpdateBody } from "../../form-values";
import { aiMcpServerSchema } from "../../schemas/ai-mcp-server.schema";

import { McpHeadersField } from "./mcp-headers-field";

import type { AiMcpServerFormValues } from "../../schemas/ai-mcp-server.schema";
import type { IAiMcpServer } from "../../types/ai-mcp-server.types";

interface IAiMcpServerFormModalProps {
  open: boolean;
  /** Có giá trị là đang sửa; không có là thêm mới. */
  server?: IAiMcpServer;
  onClose: () => void;
}

const fields = aiMcpServerSchema.shape;

function AiMcpServerForm({ server, onClose }: Omit<IAiMcpServerFormModalProps, "open">) {
  const [form] = Form.useForm<AiMcpServerFormValues>();
  const createServer = useCreateAiMcpServer();
  const updateServer = useUpdateAiMcpServer();
  const submitting = createServer.isPending || updateServer.isPending;

  const handleFinish = (values: AiMcpServerFormValues) => {
    const callbacks = {
      onSuccess: onClose,
      onError: fieldErrorHandler(form, { [AiMcpServerErrorCode.codeExists]: "code" }),
    };
    if (server) {
      const body = toUpdateBody(server, values);
      if (!hasChanges(body)) return onClose();
      updateServer.mutate({ uid: server.uid, body }, callbacks);
      return;
    }
    createServer.mutate(toCreateBody(values), callbacks);
  };

  return (
    <Form<AiMcpServerFormValues>
      form={form}
      layout="vertical"
      initialValues={server ? toFormValues(server) : { headers: [] }}
      disabled={submitting}
      onFinish={handleFinish}
    >
      <Form.Item label="Tên" name="name" required rules={[zodRule(fields.name)]}>
        <Input maxLength={L.nameMaxLength} autoFocus placeholder="Ví dụ: Teeinblue" />
      </Form.Item>
      <Form.Item label="Mã" name="code" required rules={[zodRule(fields.code)]}>
        <Input maxLength={L.codeMaxLength} disabled={Boolean(server)} placeholder="teeinblue" />
      </Form.Item>
      <Form.Item label="URL" name="url" required rules={[zodRule(fields.url)]}>
        <Input maxLength={L.urlMaxLength} placeholder="https://mcp.example.com/mcp" />
      </Form.Item>
      <McpHeadersField />
      <FormActions
        onCancel={onClose}
        submitting={submitting}
        submitText={server ? "Lưu thay đổi" : "Thêm server"}
      />
    </Form>
  );
}

export function AiMcpServerFormModal({ open, server, onClose }: IAiMcpServerFormModalProps) {
  return (
    <FormModal
      title={server ? `Sửa ${server.name}` : "Thêm MCP server"}
      open={open}
      onClose={onClose}
      width={640}
    >
      <AiMcpServerForm server={server} onClose={onClose} />
    </FormModal>
  );
}
