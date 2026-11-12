"use client";

import { FormDrawer } from "@/components/common";
import { Permission, useAccess } from "@/features/auth";
import { fieldErrorHandler, hasChanges } from "@/lib/form";

import { useCreateAiAgent, useUpdateAiAgent } from "../api/ai-agents.queries";
import { AGENT_FIELD_BY_ERROR } from "../errors";
import { NEW_AGENT_VALUES, toCreateBody, toFormValues, toUpdateBody } from "../form-values";

import { AiAgentForm } from "./form/ai-agent-form";

import type { AiAgentFormValues } from "../schemas/ai-agent.schema";
import type { IAiAgent } from "../types/ai-agent.types";
import type { FormInstance } from "antd";

const FORM_ID = "ai-agent-form";

interface IAiAgentFormDrawerProps {
  open: boolean;
  /** Có giá trị là đang sửa (hoặc xem, khi không có quyền sửa); không có là thêm mới. */
  agent?: IAiAgent;
  onClose: () => void;
}

/** Thêm, sửa hoặc xem agent trong drawer, không rời trang danh sách. */
export function AiAgentFormDrawer({ open, agent, onClose }: IAiAgentFormDrawerProps) {
  const { can } = useAccess();
  const createAgent = useCreateAiAgent();
  const updateAgent = useUpdateAiAgent();
  const saving = createAgent.isPending || updateAgent.isPending;
  const readOnly = Boolean(agent) && !can(Permission.aiAgentUpdate);

  const handleFinish = (values: AiAgentFormValues, form: FormInstance<AiAgentFormValues>) => {
    const callbacks = {
      onSuccess: onClose,
      onError: fieldErrorHandler(form, AGENT_FIELD_BY_ERROR),
    };

    if (agent) {
      const body = toUpdateBody(agent, values);
      if (!hasChanges(body)) return onClose();
      updateAgent.mutate({ uid: agent.uid, body }, callbacks);
    } else {
      createAgent.mutate(toCreateBody(values), callbacks);
    }
  };

  return (
    <FormDrawer
      title={agent ? agent.name : "Thêm agent"}
      open={open}
      onClose={onClose}
      formId={FORM_ID}
      submitText={agent ? "Lưu thay đổi" : "Tạo agent"}
      submitting={saving}
      readOnly={readOnly}
    >
      <AiAgentForm
        id={FORM_ID}
        initialValues={agent ? toFormValues(agent) : NEW_AGENT_VALUES}
        disabled={readOnly || saving}
        onFinish={handleFinish}
      />
    </FormDrawer>
  );
}
