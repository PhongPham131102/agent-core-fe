"use client";

import { Card, Form } from "antd";

import { AiSkillSelect } from "@/features/ai-skills";
import { zodRule } from "@/lib/form";

import { aiAgentSchema } from "../../schemas/ai-agent.schema";

export function AgentSkillsCard() {
  return (
    <Card title="Skill">
      <Form.Item
        name="skillCodes"
        className="mb-0!"
        rules={[zodRule(aiAgentSchema.shape.skillCodes)]}
      >
        <AiSkillSelect aria-label="Skill" />
      </Form.Item>
    </Card>
  );
}
