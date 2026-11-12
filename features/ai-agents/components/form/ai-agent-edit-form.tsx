"use client";

import { Button, Form } from "antd";
import Link from "next/link";

import { PageHeader } from "@/components/common";
import { routes } from "@/lib/constants/routes";
import { useFormDirty } from "@/lib/form";

import { AiAgentFields, clearModelOnProviderChange } from "./ai-agent-fields";

import type { AiAgentFormValues } from "../../schemas/ai-agent.schema";
import type { FormInstance } from "antd";

interface IAiAgentEditFormProps {
  title: string;
  description?: string;
  initialValues: AiAgentFormValues;
  submitting: boolean;
  /** Không có quyền sửa: chỉ xem, không có nút lưu. */
  readOnly?: boolean;
  onSubmit: (values: AiAgentFormValues, form: FormInstance<AiAgentFormValues>) => void;
}

/**
 * Trang sửa agent: cả trang vì system prompt dài. Nút Lưu chỉ bật khi có thay đổi,
 * kèm Hoàn tác. Chỉ lo bố cục và giá trị; gọi API là việc của trang dùng nó.
 */
export function AiAgentEditForm({
  title,
  description,
  initialValues,
  submitting,
  readOnly = false,
  onSubmit,
}: IAiAgentEditFormProps) {
  const [form] = Form.useForm<AiAgentFormValues>();
  const dirty = useFormDirty(form, initialValues);

  const actions = readOnly ? (
    <Link href={routes.aiAgents}>
      <Button>Quay lại danh sách</Button>
    </Link>
  ) : (
    <>
      <Button disabled={!dirty || submitting} onClick={() => form.resetFields()}>
        Hoàn tác
      </Button>
      <Button type="primary" htmlType="submit" loading={submitting} disabled={!dirty}>
        Lưu thay đổi
      </Button>
    </>
  );

  return (
    <Form<AiAgentFormValues>
      form={form}
      layout="vertical"
      initialValues={initialValues}
      disabled={readOnly || submitting}
      onValuesChange={clearModelOnProviderChange(form)}
      onFinish={(values) => onSubmit(values, form)}
      // Lỗi ở field ngoài màn hình thì cuộn tới cho người dùng thấy.
      scrollToFirstError={{ behavior: "smooth", block: "center" }}
    >
      <PageHeader
        title={title}
        description={description}
        backHref={routes.aiAgents}
        extra={actions}
      />
      <AiAgentFields layout="page" />
    </Form>
  );
}
