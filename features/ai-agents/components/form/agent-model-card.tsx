"use client";

import { Card, Form, InputNumber, Select } from "antd";

import { AiModelSelect, AiProviderSelect } from "@/features/ai-providers";
import { zodRule } from "@/lib/form";

import { useReasoningEffortsQuery } from "../../api/ai-agents.queries";
import { AI_AGENT_LIMITS } from "../../constants";
import { aiAgentSchema } from "../../schemas/ai-agent.schema";

const fields = aiAgentSchema.shape;

/** Nhà cung cấp, model và các tham số sinh câu trả lời. */
export function AgentModelCard() {
  const form = Form.useFormInstance();
  const provider = Form.useWatch<string | undefined>("provider", form);
  const reasoningEffort = Form.useWatch<string | undefined>("reasoningEffort", form);
  const efforts = useReasoningEffortsQuery();

  return (
    <Card title="Model">
      <Form.Item label="Nhà cung cấp" name="provider" required rules={[zodRule(fields.provider)]}>
        <AiProviderSelect />
      </Form.Item>
      <Form.Item label="Model" name="model" required rules={[zodRule(fields.model)]}>
        <AiModelSelect provider={provider} />
      </Form.Item>
      <Form.Item label="Mức suy luận" name="reasoningEffort">
        <Select
          allowClear
          placeholder="Không dùng"
          loading={efforts.isFetching}
          options={efforts.data?.map(({ id, name }) => ({ value: id, label: name }))}
        />
      </Form.Item>
      <div className="grid grid-cols-2 gap-x-4">
        <Form.Item label="Temperature" name="temperature" rules={[zodRule(fields.temperature)]}>
          <InputNumber
            {...AI_AGENT_LIMITS.temperature}
            step={0.1}
            disabled={Boolean(reasoningEffort)}
            className="w-full!"
          />
        </Form.Item>
        <Form.Item
          label="Token tối đa"
          name="maxOutputTokens"
          rules={[zodRule(fields.maxOutputTokens)]}
        >
          <InputNumber
            {...AI_AGENT_LIMITS.maxOutputTokens}
            step={256}
            precision={0}
            className="w-full!"
          />
        </Form.Item>
      </div>
    </Card>
  );
}
