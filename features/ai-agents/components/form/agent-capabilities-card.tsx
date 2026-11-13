"use client";

import { Card, Form } from "antd";

import { AiKnowledgeBaseSelect } from "@/features/ai-knowledge";
import { AiSkillSelect } from "@/features/ai-skills";
import { zodRule } from "@/lib/form";

import { aiAgentSchema } from "../../schemas/ai-agent.schema";

const fields = aiAgentSchema.shape;

/** Skill và kho tri thức agent được dùng. */
export function AgentCapabilitiesCard() {
  return (
    <Card title="Năng lực">
      <Form.Item label="Skill" name="skillCodes" rules={[zodRule(fields.skillCodes)]}>
        <AiSkillSelect />
      </Form.Item>
      <Form.Item
        label="Kho tri thức"
        name="knowledgeBaseUids"
        className="mb-0!"
        rules={[zodRule(fields.knowledgeBaseUids)]}
      >
        <AiKnowledgeBaseSelect />
      </Form.Item>
    </Card>
  );
}
