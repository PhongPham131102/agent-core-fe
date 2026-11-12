"use client";

import { Form } from "antd";

import { AgentConversationCard } from "./agent-conversation-card";
import { AgentGeneralCard } from "./agent-general-card";
import { AgentModelCard } from "./agent-model-card";
import { AgentPromptCard } from "./agent-prompt-card";
import { AgentSkillsCard } from "./agent-skills-card";

import type { AiAgentFormValues } from "../../schemas/ai-agent.schema";
import type { FormInstance } from "antd";

interface IAiAgentFormProps {
  /** `id` của thẻ form, để nút submit nằm ngoài form (chân drawer) gắn được vào. */
  id: string;
  initialValues: AiAgentFormValues;
  disabled: boolean;
  onFinish: (values: AiAgentFormValues, form: FormInstance<AiAgentFormValues>) => void;
}

/** Các field của agent, chia theo khối. Chỉ lo giá trị; gọi API là việc của nơi dùng. */
export function AiAgentForm({ id, initialValues, disabled, onFinish }: IAiAgentFormProps) {
  const [form] = Form.useForm<AiAgentFormValues>();

  // Model thuộc từng nhà cung cấp: đổi nhà cung cấp thì bỏ model đã chọn.
  const handleValuesChange = (changed: AiAgentFormValues) => {
    if ("provider" in changed) form.setFieldValue("model", undefined);
  };

  return (
    <Form<AiAgentFormValues>
      id={id}
      form={form}
      layout="vertical"
      initialValues={initialValues}
      disabled={disabled}
      onValuesChange={handleValuesChange}
      onFinish={(values) => onFinish(values, form)}
      scrollToFirstError={{ behavior: "smooth", block: "center" }}
      className="flex flex-col gap-4"
    >
      <AgentGeneralCard />
      <AgentModelCard />
      <AgentSkillsCard />
      <AgentPromptCard />
      <AgentConversationCard />
    </Form>
  );
}
