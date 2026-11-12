"use client";

import { Card, Form, Input, Switch } from "antd";

import { zodRule } from "@/lib/form";

import { AI_AGENT_LIMITS } from "../../constants";
import { aiAgentSchema } from "../../schemas/ai-agent.schema";

const fields = aiAgentSchema.shape;

/** Tên, mô tả và trạng thái bật/tắt. */
export function AgentGeneralCard() {
  return (
    <Card title="Thông tin chung">
      <Form.Item label="Tên agent" name="name" required rules={[zodRule(fields.name)]}>
        <Input
          maxLength={AI_AGENT_LIMITS.nameMaxLength}
          placeholder="Ví dụ: Trợ lý chăm sóc khách hàng"
        />
      </Form.Item>
      <Form.Item label="Mô tả" name="description" rules={[zodRule(fields.description)]}>
        <Input.TextArea
          maxLength={AI_AGENT_LIMITS.descriptionMaxLength}
          autoSize={{ minRows: 2, maxRows: 4 }}
          showCount
          placeholder="Agent này dùng để làm gì"
        />
      </Form.Item>
      <Form.Item label="Đang bật" name="isActive" valuePropName="checked" className="mb-0!">
        <Switch />
      </Form.Item>
    </Card>
  );
}
