"use client";

import { Card, Form, Switch } from "antd";

import { AiKnowledgeBaseSelect } from "@/features/ai-knowledge";
import { AiMcpServerSelect } from "@/features/ai-mcp-servers";
import { AiSkillSelect } from "@/features/ai-skills";
import { zodRule } from "@/lib/form";

import { aiAgentSchema } from "../../schemas/ai-agent.schema";

import { AgentToolSelect } from "./agent-tool-select";

const fields = aiAgentSchema.shape;

/** Skill, kho tri thức, tool, MCP server và ghi nhớ của agent. */
export function AgentCapabilitiesCard() {
  return (
    <Card title="Năng lực">
      <Form.Item label="Skill" name="skillCodes" rules={[zodRule(fields.skillCodes)]}>
        <AiSkillSelect />
      </Form.Item>
      <Form.Item
        label="Kho tri thức"
        name="knowledgeBaseUids"
        rules={[zodRule(fields.knowledgeBaseUids)]}
      >
        <AiKnowledgeBaseSelect />
      </Form.Item>
      <Form.Item label="Tool" name="toolNames" rules={[zodRule(fields.toolNames)]}>
        <AgentToolSelect />
      </Form.Item>
      <Form.Item label="MCP server" name="mcpServerCodes" rules={[zodRule(fields.mcpServerCodes)]}>
        <AiMcpServerSelect />
      </Form.Item>
      <Form.Item label="Ghi nhớ" name="memoryEnabled" valuePropName="checked" className="mb-0!">
        <Switch />
      </Form.Item>
    </Card>
  );
}
