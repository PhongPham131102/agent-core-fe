"use client";

import { Card, Form, Input } from "antd";

import { zodRule } from "@/lib/form";

import { AI_AGENT_LIMITS } from "../../constants";
import { aiAgentSchema } from "../../schemas/ai-agent.schema";

/** System prompt: phần quyết định agent cư xử thế nào, nên có chỗ rộng riêng. */
export function AgentPromptCard() {
  return (
    <Card title="Chỉ dẫn hệ thống">
      <Form.Item
        name="systemPrompt"
        className="mb-0!"
        required
        rules={[zodRule(aiAgentSchema.shape.systemPrompt)]}
      >
        <Input.TextArea
          aria-label="Chỉ dẫn hệ thống"
          maxLength={AI_AGENT_LIMITS.systemPromptMaxLength}
          autoSize={{ minRows: 12, maxRows: 32 }}
          showCount
          placeholder="Bạn là trợ lý chăm sóc khách hàng của..."
          className="font-mono text-[13px]!"
        />
      </Form.Item>
    </Card>
  );
}
