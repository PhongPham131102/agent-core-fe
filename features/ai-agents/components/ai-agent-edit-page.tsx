"use client";

import { Card, Skeleton } from "antd";

import { ErrorView, NotFoundView } from "@/components/common";
import { Permission, PermissionGuard, useAccess } from "@/features/auth";
import { fieldErrorHandler, hasChanges } from "@/lib/form";
import { isApiError } from "@/lib/http";

import { useAiAgentQuery, useUpdateAiAgent } from "../api/ai-agents.queries";
import { AGENT_FIELD_BY_ERROR } from "../errors";
import { toFormValues, toUpdateBody } from "../form-values";

import { AiAgentEditForm } from "./form/ai-agent-edit-form";

const isNotFound = (error: unknown) => isApiError(error) && error.status === 404;

function AiAgentEditor({ uid }: { uid: string }) {
  const { can } = useAccess();
  const agent = useAiAgentQuery(uid);
  const updateAgent = useUpdateAiAgent();

  if (agent.isPending) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }
  if (agent.isError) {
    return isNotFound(agent.error) ? (
      <NotFoundView />
    ) : (
      <ErrorView error={agent.error} retry={() => void agent.refetch()} />
    );
  }

  const record = agent.data;
  return (
    <AiAgentEditForm
      // Lưu xong BE trả bản mới: mount lại form để giá trị ban đầu khớp bản đã lưu.
      key={record.updatedAt}
      title={record.name}
      description={record.code}
      initialValues={toFormValues(record)}
      submitting={updateAgent.isPending}
      readOnly={!can(Permission.aiAgentUpdate)}
      onSubmit={(values, form) => {
        const body = toUpdateBody(record, values);
        if (!hasChanges(body)) return;
        updateAgent.mutate(
          { uid, body },
          { onError: fieldErrorHandler(form, AGENT_FIELD_BY_ERROR) },
        );
      }}
    />
  );
}

export function AiAgentEditPage({ uid }: { uid: string }) {
  return (
    <PermissionGuard permission={Permission.aiAgentRead}>
      <AiAgentEditor uid={uid} />
    </PermissionGuard>
  );
}
