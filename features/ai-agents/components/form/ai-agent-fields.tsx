"use client";

import { AgentConversationCard } from "./agent-conversation-card";
import { AgentGeneralCard } from "./agent-general-card";
import { AgentModelCard } from "./agent-model-card";
import { AgentPromptCard } from "./agent-prompt-card";

import type { AiAgentFormValues } from "../../schemas/ai-agent.schema";
import type { FormInstance } from "antd";

interface IAiAgentFieldsProps {
  /**
   * `page`: hai cột trên màn hình rộng (trang sửa).
   * `stack`: một cột, model đứng ngay sau thông tin chung (drawer thêm mới).
   */
  layout: "page" | "stack";
}

/** Toàn bộ field của agent, chia 4 khối. Dùng bên trong một antd `Form`. */
export function AiAgentFields({ layout }: IAiAgentFieldsProps) {
  if (layout === "stack") {
    return (
      <div className="flex flex-col gap-4">
        <AgentGeneralCard />
        <AgentModelCard />
        <AgentPromptCard />
        <AgentConversationCard />
      </div>
    );
  }
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex min-w-0 flex-col gap-4">
        <AgentGeneralCard />
        <AgentPromptCard />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <AgentModelCard />
        <AgentConversationCard />
      </div>
    </div>
  );
}

/** `onValuesChange` dùng chung: model thuộc từng nhà cung cấp, đổi nhà cung cấp thì bỏ model. */
export const clearModelOnProviderChange =
  (form: FormInstance<AiAgentFormValues>) => (changed: AiAgentFormValues) => {
    if ("provider" in changed) form.setFieldValue("model", undefined);
  };
