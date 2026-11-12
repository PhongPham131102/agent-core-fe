"use client";

import { Card, Form, InputNumber } from "antd";

import { zodRule } from "@/lib/form";

import { AI_AGENT_LIMITS } from "../../constants";
import { aiAgentSchema } from "../../schemas/ai-agent.schema";

const fields = aiAgentSchema.shape;

/** Giới hạn mỗi lượt hội thoại. */
export function AgentConversationCard() {
  return (
    <Card title="Hội thoại">
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item
          label="Số bước tối đa"
          name="maxSteps"
          className="mb-0!"
          rules={[zodRule(fields.maxSteps)]}
        >
          <InputNumber {...AI_AGENT_LIMITS.maxSteps} precision={0} className="w-full!" />
        </Form.Item>
        <Form.Item
          label="Số lượt nhớ"
          name="historyTurnLimit"
          className="mb-0!"
          rules={[zodRule(fields.historyTurnLimit)]}
        >
          <InputNumber {...AI_AGENT_LIMITS.historyTurnLimit} precision={0} className="w-full!" />
        </Form.Item>
      </div>
    </Card>
  );
}
