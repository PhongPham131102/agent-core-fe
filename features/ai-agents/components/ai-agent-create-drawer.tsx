"use client";

import { Button, Drawer, Form } from "antd";

import { fieldErrorHandler } from "@/lib/form";

import { useCreateAiAgent } from "../api/ai-agents.queries";
import { AGENT_FIELD_BY_ERROR } from "../errors";
import { NEW_AGENT_VALUES, toCreateBody } from "../form-values";

import { AiAgentFields, clearModelOnProviderChange } from "./form/ai-agent-fields";

import type { AiAgentFormValues } from "../schemas/ai-agent.schema";

const FORM_ID = "ai-agent-create-form";
const DRAWER_WIDTH = 720;

interface IAiAgentCreateDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface IAiAgentCreateFormProps {
  createAgent: ReturnType<typeof useCreateAiAgent>;
  onClose: () => void;
}

function AiAgentCreateForm({ createAgent, onClose }: IAiAgentCreateFormProps) {
  const [form] = Form.useForm<AiAgentFormValues>();

  const handleFinish = (values: AiAgentFormValues) =>
    createAgent.mutate(toCreateBody(values), {
      onSuccess: onClose,
      onError: fieldErrorHandler(form, AGENT_FIELD_BY_ERROR),
    });

  return (
    <Form<AiAgentFormValues>
      id={FORM_ID}
      form={form}
      layout="vertical"
      initialValues={NEW_AGENT_VALUES}
      disabled={createAgent.isPending}
      onValuesChange={clearModelOnProviderChange(form)}
      onFinish={handleFinish}
      scrollToFirstError={{ behavior: "smooth", block: "center" }}
    >
      <AiAgentFields layout="stack" />
    </Form>
  );
}

/**
 * Thêm agent trong drawer bên phải, không rời trang danh sách. Nút ở chân drawer submit
 * form qua thuộc tính `form` của nút, vì footer nằm ngoài thẻ form.
 */
export function AiAgentCreateDrawer({ open, onClose }: IAiAgentCreateDrawerProps) {
  // Mutation ở đây để nút "Tạo agent" ở chân drawer biết đang lưu.
  const createAgent = useCreateAiAgent();

  return (
    <Drawer
      title="Thêm agent"
      open={open}
      onClose={onClose}
      size={DRAWER_WIDTH}
      destroyOnHidden
      styles={{ body: { background: "var(--ac-color-bg-layout)" } }}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Huỷ</Button>
          <Button type="primary" htmlType="submit" form={FORM_ID} loading={createAgent.isPending}>
            Tạo agent
          </Button>
        </div>
      }
    >
      <AiAgentCreateForm createAgent={createAgent} onClose={onClose} />
    </Drawer>
  );
}
